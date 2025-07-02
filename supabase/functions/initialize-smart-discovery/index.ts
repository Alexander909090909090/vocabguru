
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { forceReinit = false } = await req.json()
    
    console.log('Initializing Smart Discovery System...')

    // Check required API keys
    const requiredKeys = ['OPENAI_API_KEY', 'MERRIAM_WEBSTER_DICT_KEY']
    const missingKeys = []
    
    for (const key of requiredKeys) {
      if (!Deno.env.get(key)) {
        missingKeys.push(key)
      }
    }

    if (missingKeys.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required API keys: ${missingKeys.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check current database status
    const { count: wordCount } = await supabaseClient
      .from('word_profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`Current word count: ${wordCount}`)

    // Initialize system state
    const initializationStatus = {
      timestamp: new Date().toISOString(),
      wordCount: wordCount || 0,
      apis_configured: {
        openai: !!Deno.env.get('OPENAI_API_KEY'),
        merriam_webster_dict: !!Deno.env.get('MERRIAM_WEBSTER_DICT_KEY'),
        merriam_webster_thes: !!Deno.env.get('MERRIAM_WEBSTER_THES_KEY'),
        oxford: !!Deno.env.get('OXFORD_DICT_KEY'),
        wordsapi: !!Deno.env.get('WORDSAPI_KEY'),
        cambridge: !!Deno.env.get('CAMBRIDGE_DICT_KEY')
      },
      features_enabled: {
        ai_discovery: true,
        multi_api_fetching: true,
        auto_population: true,
        user_driven_discovery: true
      }
    }

    console.log('Smart Discovery System initialized successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Smart Discovery System initialized successfully',
        status: initializationStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Initialization error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
