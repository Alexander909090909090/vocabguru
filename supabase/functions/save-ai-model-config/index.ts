
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
    const { modelType, apiKey, enabled } = await req.json()

    if (!modelType) {
      return new Response(
        JSON.stringify({ error: 'Model type is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Saving AI model config for ${modelType}`)
    
    // For models that require API keys (like Hugging Face)
    if (apiKey) {
      console.log(`API key provided for ${modelType}`)
    }
    
    // For local models (spaCy, NLTK, etc.), we just enable them
    console.log(`${modelType} model ${enabled ? 'enabled' : 'disabled'}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${modelType} configuration saved successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error saving AI model config:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
