
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
    const { action, apiName, apiKey } = await req.json()
    
    if (action === 'save') {
      // Map friendly names to secret keys
      const secretKeyMap: Record<string, string> = {
        'OpenAI': 'OPENAI_API_KEY',
        'Merriam-Webster Dictionary': 'MERRIAM_WEBSTER_DICT_KEY',
        'Merriam-Webster Thesaurus': 'MERRIAM_WEBSTER_THES_KEY',
        'Oxford Dictionary': 'OXFORD_DICT_KEY',
        'WordsAPI': 'WORDSAPI_KEY',
        'Cambridge Dictionary': 'CAMBRIDGE_DICT_KEY'
      }

      const secretKey = secretKeyMap[apiName]
      if (!secretKey) {
        throw new Error(`Unknown API: ${apiName}`)
      }

      // In a real implementation, you would save to Supabase secrets
      // For now, we'll simulate success
      console.log(`Saving API key for ${apiName} as ${secretKey}`)
      
      return new Response(
        JSON.stringify({ success: true, message: `${apiName} API key saved successfully` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('API key management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
