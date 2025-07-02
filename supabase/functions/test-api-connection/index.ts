
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

    const { apiType, apiKey, apiKeyValue } = await req.json()

    if (!apiType || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'API type and key are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let testApiKey = apiKeyValue

    // If no API key value provided, try to retrieve from secure storage
    if (!testApiKey) {
      const configKey = `${apiType}_${apiKey}_api_key`
      const { data: configData, error: configError } = await supabase
        .from('api_source_data')
        .select('raw_data')
        .eq('source_name', configKey)
        .single()

      if (configError || !configData?.raw_data?.api_key) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'API key not found. Please configure the API key first.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      testApiKey = configData.raw_data.api_key
    }

    // Test the API connection based on the API type
    let testResult = { success: false, error: 'Unknown API type' }

    switch (apiKey) {
      case 'wordnik':
        testResult = await testWordnikAPI(testApiKey)
        break
      case 'oxford':
        testResult = await testOxfordAPI(testApiKey)
        break
      case 'merriam_webster':
        testResult = await testMerriamWebsterAPI(testApiKey)
        break
      case 'wiktionary':
      case 'free_dictionary':
        // These don't require API keys
        testResult = { success: true, message: 'No authentication required' }
        break
      default:
        testResult = { success: false, error: `Unsupported API: ${apiKey}` }
    }

    return new Response(
      JSON.stringify(testResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error testing API connection:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function testWordnikAPI(apiKey: string) {
  try {
    const response = await fetch(`https://api.wordnik.com/v4/word.json/test/definitions?limit=1&api_key=${apiKey}`)
    
    if (response.ok) {
      return { success: true, message: 'Wordnik API connection successful' }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid Wordnik API key' }
    } else {
      return { success: false, error: `Wordnik API error: ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Wordnik API' }
  }
}

async function testOxfordAPI(apiKey: string) {
  try {
    // Oxford API requires both app_id and app_key, but for testing we'll just validate format
    if (!apiKey.includes(':')) {
      return { success: false, error: 'Oxford API key should be in format "app_id:app_key"' }
    }
    
    const [appId, appKey] = apiKey.split(':')
    if (!appId || !appKey) {
      return { success: false, error: 'Invalid Oxford API key format' }
    }

    // Test with a simple word lookup
    const response = await fetch('https://od-api.oxforddictionaries.com/api/v2/entries/en-us/test', {
      headers: {
        'app_id': appId,
        'app_key': appKey
      }
    })

    if (response.ok) {
      return { success: true, message: 'Oxford API connection successful' }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid Oxford API credentials' }
    } else {
      return { success: false, error: `Oxford API error: ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Oxford API' }
  }
}

async function testMerriamWebsterAPI(apiKey: string) {
  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/test?key=${apiKey}`)
    
    if (response.ok) {
      return { success: true, message: 'Merriam-Webster API connection successful' }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid Merriam-Webster API key' }
    } else {
      return { success: false, error: `Merriam-Webster API error: ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: 'Failed to connect to Merriam-Webster API' }
  }
}
