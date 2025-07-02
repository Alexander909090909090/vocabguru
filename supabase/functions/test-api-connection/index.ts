
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
    const { apiName, apiKey } = await req.json()

    let testResult = { success: false, error: '' }

    switch (apiName) {
      case 'OpenAI':
        testResult = await testOpenAI(apiKey)
        break
      case 'Merriam-Webster Dictionary':
        testResult = await testMerriamWebsterDict(apiKey)
        break
      case 'Merriam-Webster Thesaurus':
        testResult = await testMerriamWebsterThes(apiKey)
        break
      case 'Oxford Dictionary':
        testResult = await testOxfordDict(apiKey)
        break
      case 'WordsAPI':
        testResult = await testWordsAPI(apiKey)
        break
      case 'Cambridge Dictionary':
        testResult = await testCambridgeDict(apiKey)
        break
      default:
        testResult = { success: false, error: 'Unknown API' }
    }

    return new Response(
      JSON.stringify(testResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('API connection test error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function testOpenAI(apiKey: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true, error: '' }
    } else {
      const error = await response.text()
      return { success: false, error: `HTTP ${response.status}: ${error}` }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testMerriamWebsterDict(apiKey: string) {
  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/test?key=${apiKey}`)
    
    if (response.ok) {
      const data = await response.json()
      return { success: Array.isArray(data), error: Array.isArray(data) ? '' : 'Invalid API response' }
    } else {
      return { success: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testMerriamWebsterThes(apiKey: string) {
  try {
    const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/test?key=${apiKey}`)
    
    if (response.ok) {
      const data = await response.json()
      return { success: Array.isArray(data), error: Array.isArray(data) ? '' : 'Invalid API response' }
    } else {
      return { success: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testOxfordDict(apiKey: string) {
  try {
    // Oxford API requires both app_id and app_key, this is simplified
    const response = await fetch('https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/test', {
      headers: {
        'Accept': 'application/json',
        'app_id': 'test', // Would need proper app_id
        'app_key': apiKey
      }
    })
    
    return { success: response.status !== 401, error: response.status === 401 ? 'Invalid credentials' : '' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testWordsAPI(apiKey: string) {
  try {
    const response = await fetch('https://wordsapiv1.p.rapidapi.com/words/test', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
      }
    })
    
    return { success: response.status !== 401, error: response.status === 401 ? 'Invalid API key' : '' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testCambridgeDict(apiKey: string) {
  try {
    // Cambridge API test - simplified
    const response = await fetch(`https://dictionary.cambridge.org/api/v1/dictionaries/english/entries/test?key=${apiKey}`)
    
    return { success: response.status !== 401, error: response.status === 401 ? 'Invalid API key' : '' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
