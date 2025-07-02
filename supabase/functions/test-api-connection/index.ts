
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { apiType, apiKey, apiKeyValue } = await req.json()

    let testResult = { success: false, error: 'Unknown API' }

    // Test different API connections
    switch (apiKey) {
      case 'wordnik':
        testResult = await testWordnikAPI(apiKeyValue)
        break
      case 'oxford':
        testResult = await testOxfordAPI(apiKeyValue)
        break
      case 'merriam_webster':
        testResult = await testMerriamWebsterAPI(apiKeyValue)
        break
      case 'huggingface':
        testResult = await testHuggingFaceAPI(apiKeyValue)
        break
      case 'wiktionary':
      case 'free_dictionary':
        testResult = await testPublicAPI(apiKey)
        break
      default:
        testResult = { success: false, error: 'Unsupported API' }
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
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function testWordnikAPI(apiKey: string) {
  try {
    const response = await fetch(`https://api.wordnik.com/v4/words.json/definitions?limit=1&api_key=${apiKey}`)
    
    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}

async function testOxfordAPI(apiKey: string) {
  try {
    // Oxford API requires both app_id and app_key, this is a simplified test
    const response = await fetch('https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/test', {
      headers: {
        'app_id': apiKey.split(':')[0] || apiKey,
        'app_key': apiKey.split(':')[1] || apiKey
      }
    })
    
    // Even a 404 means the API is reachable and keys are valid
    if (response.status === 404 || response.status === 200) {
      return { success: true }
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Invalid API credentials' }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}

async function testMerriamWebsterAPI(apiKey: string) {
  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/test?key=${apiKey}`)
    
    if (response.ok) {
      return { success: true }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid API key' }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}

async function testHuggingFaceAPI(apiKey: string) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/bert-base-uncased', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    
    if (response.ok || response.status === 503) {
      // 503 means model is loading, but API key is valid
      return { success: true }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid API token' }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}

async function testPublicAPI(apiType: string) {
  try {
    let testUrl = ''
    
    switch (apiType) {
      case 'wiktionary':
        testUrl = 'https://en.wiktionary.org/w/api.php?action=query&format=json&titles=test'
        break
      case 'free_dictionary':
        testUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/test'
        break
    }
    
    const response = await fetch(testUrl)
    
    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}
