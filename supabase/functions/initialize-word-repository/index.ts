
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

    const { configuredAPIs, batchSize = 50 } = await req.json()

    if (!configuredAPIs || configuredAPIs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No configured APIs provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Initializing word repository with APIs: ${configuredAPIs.join(', ')}`)

    // Essential words to seed the database
    const essentialWords = [
      'amazing', 'beautiful', 'creative', 'delicious', 'exciting',
      'fantastic', 'gorgeous', 'helpful', 'incredible', 'joyful',
      'analyze', 'construct', 'develop', 'establish', 'factor',
      'generate', 'identify', 'justify', 'maintain', 'obtain',
      'collaborate', 'communicate', 'coordinate', 'demonstrate', 'evaluate',
      'facilitate', 'implement', 'negotiate', 'organize', 'prioritize',
      'eloquent', 'profound', 'sophisticated', 'comprehensive', 'innovative',
      'meticulous', 'resilient', 'strategic', 'systematic', 'versatile'
    ]

    const results = []
    
    // Process words in batches
    for (let i = 0; i < essentialWords.length; i += batchSize) {
      const batch = essentialWords.slice(i, i + batchSize)
      
      for (const word of batch) {
        try {
          // Check if word already exists
          const { data: existing } = await supabaseClient
            .from('word_profiles')
            .select('id')
            .eq('word', word.toLowerCase())
            .maybeSingle()

          if (existing) {
            console.log(`Word '${word}' already exists, skipping`)
            continue
          }

          // Fetch word data using configured APIs
          let wordData = await fetchWordData(word, configuredAPIs)
          
          if (wordData) {
            // Insert into database
            const { error } = await supabaseClient
              .from('word_profiles')
              .insert(wordData)

            if (error) {
              console.error(`Error inserting word '${word}':`, error)
              results.push({ word, success: false, error: error.message })
            } else {
              console.log(`Successfully added word: ${word}`)
              results.push({ word, success: true })
            }
          } else {
            results.push({ word, success: false, error: 'No data found' })
          }
        } catch (error) {
          console.error(`Error processing word '${word}':`, error)
          results.push({ word, success: false, error: error.message })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error initializing word repository:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function fetchWordData(word: string, configuredAPIs: string[]) {
  // Try to fetch from Free Dictionary API first (no auth required)
  if (configuredAPIs.includes('free_dictionary')) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      
      if (response.ok) {
        const data = await response.json()
        const entry = data[0]
        
        return {
          word: word.toLowerCase(),
          morpheme_breakdown: {
            phonetic: entry.phonetic || '',
            audio_url: entry.phonetics?.find((p: any) => p.audio)?.audio || '',
            root: { text: word, meaning: entry.meanings?.[0]?.definitions?.[0]?.definition || '' }
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
          },
          data_sources: ['free_dictionary_api'],
          quality_score: 75,
          completeness_score: 80
        }
      }
    } catch (error) {
      console.error(`Error fetching from Free Dictionary API for word '${word}':`, error)
    }
  }

  // If Free Dictionary API fails, try other configured APIs
  // This would be expanded to include other API integrations
  
  return null
}
