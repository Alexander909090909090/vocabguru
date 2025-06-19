
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: any;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { words } = await req.json()
    
    if (!words || !Array.isArray(words)) {
      return new Response(
        JSON.stringify({ error: 'Invalid words array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []
    
    for (const word of words) {
      try {
        // Fetch from Free Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        
        if (response.ok) {
          const data = await response.json()
          const entry = data[0]
          
          const wordData = {
            word: word.toLowerCase(),
            morpheme_breakdown: {
              phonetic: entry.phonetic || '',
              audio_url: entry.phonetics?.find((p: any) => p.audio)?.audio || '',
              root: { text: word, meaning: '' }
            },
            etymology: {
              historical_origins: entry.origin || '',
              language_of_origin: 'English'
            },
            definitions: {
              primary: entry.meanings?.[0]?.definitions?.[0]?.definition || '',
              standard: entry.meanings?.slice(0, 3).map((m: any) => 
                m.definitions?.[0]?.definition || ''
              ).filter(Boolean) || []
            },
            word_forms: {
              base_form: word
            },
            analysis: {
              parts_of_speech: entry.meanings?.map((m: any) => m.partOfSpeech).join(', ') || '',
              usage_examples: entry.meanings?.flatMap((m: any) => 
                m.definitions?.map((d: any) => d.example).filter(Boolean)
              ).slice(0, 3) || [],
              synonyms: entry.meanings?.flatMap((m: any) => 
                m.definitions?.flatMap((d: any) => d.synonyms || [])
              ).slice(0, 5) || [],
              antonyms: entry.meanings?.flatMap((m: any) => 
                m.definitions?.flatMap((d: any) => d.antonyms || [])
              ).slice(0, 5) || []
            }
          }

          const { error } = await supabaseClient
            .from('word_profiles')
            .upsert(wordData, { onConflict: 'word' })

          if (error) {
            console.error(`Error storing word ${word}:`, error)
            results.push({ word, success: false, error: error.message })
          } else {
            results.push({ word, success: true })
          }
        } else {
          results.push({ word, success: false, error: 'Word not found in dictionary' })
        }
      } catch (error) {
        console.error(`Error processing word ${word}:`, error)
        results.push({ word, success: false, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
