
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
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
    const { word, context } = await req.json()
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are VocabGuru's AI assistant, specialized in morphological analysis and etymology. Provide detailed word breakdowns including:
            1. Morpheme analysis (prefix, root, suffix)
            2. Etymology and historical origins
            3. Related words and word families
            4. Usage patterns and collocations
            5. Memory techniques for learning
            
            Always format your response as structured JSON with these fields:
            - morphemes: { prefix, root, suffix }
            - etymology: { origin, evolution, related_languages }
            - word_family: array of related words
            - memory_tips: array of learning techniques
            - advanced_usage: contextual usage examples`
          },
          {
            role: 'user',
            content: `Analyze the word "${word}"${context ? ` in the context: ${context}` : ''}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    })

    const data = await response.json()
    const analysis = data.choices[0].message.content

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('AI analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
