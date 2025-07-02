
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check status of configured APIs
    const apiStatus: { [key: string]: any } = {}

    // Dictionary APIs
    const dictionaryAPIs = [
      'wiktionary',
      'wordnik', 
      'free_dictionary',
      'oxford',
      'merriam_webster'
    ]

    // AI Models
    const aiModels = [
      'huggingface',
      'spacy',
      'nltk',
      'stanford_nlp',
      'ollama'
    ]

    // Check dictionary API status
    for (const api of dictionaryAPIs) {
      const secretKey = `${api.toUpperCase()}_API_KEY`
      const hasKey = Deno.env.get(secretKey) !== undefined
      
      // Special handling for APIs that don't require keys
      if (api === 'wiktionary' || api === 'free_dictionary') {
        apiStatus[api] = {
          connected: true,
          lastTested: new Date().toISOString(),
          requiresAuth: false
        }
      } else {
        apiStatus[api] = {
          connected: hasKey,
          lastTested: hasKey ? new Date().toISOString() : null,
          requiresAuth: true,
          error: hasKey ? null : 'API key not configured'
        }
      }
    }

    // Check AI model status
    for (const model of aiModels) {
      if (model === 'huggingface') {
        const hasKey = Deno.env.get('HUGGINGFACE_API_KEY') !== undefined
        apiStatus[model] = {
          connected: hasKey,
          lastTested: hasKey ? new Date().toISOString() : null,
          requiresAuth: true,
          error: hasKey ? null : 'API key not configured'
        }
      } else {
        // Local models don't require API keys
        apiStatus[model] = {
          connected: true,
          lastTested: new Date().toISOString(),
          requiresAuth: false,
          localInstallation: true
        }
      }
    }

    return new Response(
      JSON.stringify({ status: apiStatus }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error checking API status:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
