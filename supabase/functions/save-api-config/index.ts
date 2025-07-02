
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create authenticated Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user from JWT token
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { apiType, apiKey, apiKeyValue } = await req.json()

    if (!apiKey || !apiKeyValue) {
      return new Response(
        JSON.stringify({ error: 'API key and value are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate API key format
    if (apiKeyValue.length < 10) {
      return new Response(
        JSON.stringify({ error: 'API key must be at least 10 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Store API key securely in a configuration table
    const configKey = `${apiType}_${apiKey}_api_key`
    const { error: insertError } = await supabase
      .from('api_source_data')
      .upsert({
        source_name: configKey,
        raw_data: { 
          api_key: apiKeyValue, 
          configured_by: user.id,
          configured_at: new Date().toISOString(),
          api_type: apiType
        },
        confidence_score: 1.0
      }, {
        onConflict: 'source_name'
      })

    if (insertError) {
      console.error('Error storing API config:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to store API configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Successfully stored API config for ${apiKey} (type: ${apiType}) by admin ${user.email}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${apiKey} API configuration saved successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error saving API config:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
