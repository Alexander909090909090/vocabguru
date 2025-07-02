
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
    const { modelType, apiKey } = await req.json()

    let testResult = { success: false, error: 'Unknown model type' }

    // Test different AI model connections
    switch (modelType) {
      case 'huggingface':
        if (!apiKey) {
          testResult = { success: false, error: 'API key required for Hugging Face' }
        } else {
          testResult = await testHuggingFaceConnection(apiKey)
        }
        break
      case 'spacy':
      case 'nltk':
      case 'stanford_nlp':
      case 'ollama':
        // These are local installations, so we simulate a successful test
        testResult = { success: true, message: `${modelType} is configured for local use` }
        break
      default:
        testResult = { success: false, error: 'Unsupported model type' }
    }

    return new Response(
      JSON.stringify(testResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error testing AI model connection:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function testHuggingFaceConnection(apiKey: string) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/bert-base-uncased', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: "test"
      })
    })
    
    if (response.ok) {
      return { success: true, message: 'Hugging Face API connection successful' }
    } else if (response.status === 503) {
      // Model is loading, but API key is valid
      return { success: true, message: 'Hugging Face API key is valid (model loading)' }
    } else if (response.status === 401) {
      return { success: false, error: 'Invalid Hugging Face API token' }
    } else {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { success: false, error: `Connection failed: ${error.message}` }
  }
}
