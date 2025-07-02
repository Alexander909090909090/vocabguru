
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, context = 'general', limit = 10 } = await req.json()
    
    console.log(`AI Word Discovery request: "${query}" with context: ${context}`)

    // Step 1: Use AI to suggest related words
    const suggestedWords = await getSuggestedWords(query, context, limit)
    console.log(`AI suggested ${suggestedWords.length} words:`, suggestedWords)

    // Step 2: Fetch and store each suggested word
    const discoveredWords = []
    
    for (const word of suggestedWords) {
      try {
        const wordData = await fetchWordFromAPIs(word)
        if (wordData) {
          const storedWord = await storeWordInDatabase(wordData)
          if (storedWord) {
            discoveredWords.push(storedWord)
          }
        }
      } catch (error) {
        console.error(`Failed to process word "${word}":`, error)
        continue
      }
    }

    console.log(`Successfully discovered and stored ${discoveredWords.length} words`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        discoveredWords,
        totalFound: discoveredWords.length,
        suggestions: suggestedWords
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('AI word discovery error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getSuggestedWords(query: string, context: string, limit: number): Promise<string[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Calvarn, an AI vocabulary expert for VocabGuru. Your task is to suggest related words for vocabulary learning.

When given a search query, suggest ${limit} related words that would be valuable for vocabulary expansion. Consider:
- Synonyms and antonyms
- Words in the same semantic field
- Words with similar morphological patterns
- Academic and professional terminology
- Words appropriate for intermediate to advanced learners

Context: ${context}

Return ONLY a JSON array of strings, nothing else. Each word should be a single English word, properly spelled.`
          },
          {
            role: 'user',
            content: `Suggest ${limit} vocabulary words related to: "${query}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const suggestionsText = data.choices[0].message.content.trim()
    
    try {
      const suggestions = JSON.parse(suggestionsText)
      return Array.isArray(suggestions) ? suggestions.slice(0, limit) : []
    } catch {
      // If JSON parsing fails, try to extract words from text
      const words = suggestionsText.match(/\b[a-zA-Z]+\b/g) || []
      return words.slice(0, limit)
    }
  } catch (error) {
    console.error('OpenAI suggestion error:', error)
    return []
  }
}

async function fetchWordFromAPIs(word: string) {
  const results = {
    word: word.toLowerCase(),
    sources: []
  }

  // Try Free Dictionary API first (always available)
  try {
    const freeDictData = await fetchFromFreeDictionary(word)
    if (freeDictData) {
      results.sources.push({ api: 'free-dictionary', data: freeDictData })
    }
  } catch (error) {
    console.log(`Free Dictionary failed for "${word}":`, error.message)
  }

  // Try Merriam-Webster if key is available
  const mwDictKey = Deno.env.get('MERRIAM_WEBSTER_DICT_KEY')
  if (mwDictKey) {
    try {
      const mwData = await fetchFromMerriamWebster(word, mwDictKey)
      if (mwData) {
        results.sources.push({ api: 'merriam-webster', data: mwData })
      }
    } catch (error) {
      console.log(`Merriam-Webster failed for "${word}":`, error.message)
    }
  }

  // Try other APIs if keys are available
  const oxfordKey = Deno.env.get('OXFORD_DICT_KEY')
  if (oxfordKey) {
    try {
      const oxfordData = await fetchFromOxford(word, oxfordKey)
      if (oxfordData) {
        results.sources.push({ api: 'oxford', data: oxfordData })
      }
    } catch (error) {
      console.log(`Oxford failed for "${word}":`, error.message)
    }
  }

  return results.sources.length > 0 ? results : null
}

async function fetchFromFreeDictionary(word: string) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
  if (!response.ok) return null
  
  const data = await response.json()
  return data[0] || null
}

async function fetchFromMerriamWebster(word: string, apiKey: string) {
  const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`)
  if (!response.ok) return null
  
  const data = await response.json()
  return Array.isArray(data) && data.length > 0 ? data[0] : null
}

async function fetchFromOxford(word: string, apiKey: string) {
  // Simplified Oxford API call - would need proper app_id/app_key setup
  try {
    const response = await fetch(`https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/${word}`, {
      headers: {
        'Accept': 'application/json',
        'app_key': apiKey
      }
    })
    if (!response.ok) return null
    
    const data = await response.json()
    return data
  } catch {
    return null
  }
}

async function storeWordInDatabase(wordData: any) {
  try {
    // Check if word already exists
    const { data: existingWord } = await supabaseClient
      .from('word_profiles')
      .select('id')
      .eq('word', wordData.word)
      .maybeSingle()

    if (existingWord) {
      console.log(`Word "${wordData.word}" already exists, skipping`)
      return existingWord
    }

    // Convert multi-source data to unified word profile format
    const wordProfile = await convertToWordProfile(wordData)
    
    const { data, error } = await supabaseClient
      .from('word_profiles')
      .insert(wordProfile)
      .select()
      .single()

    if (error) {
      console.error(`Database error for "${wordData.word}":`, error)
      return null
    }

    console.log(`Successfully stored word: ${wordData.word}`)
    return data
  } catch (error) {
    console.error(`Error storing word "${wordData.word}":`, error)
    return null
  }
}

async function convertToWordProfile(wordData: any) {
  const sources = wordData.sources
  const primarySource = sources[0]?.data
  
  if (!primarySource) {
    throw new Error('No valid source data')
  }

  // Extract definitions from all sources
  const allDefinitions = []
  let etymology = {}
  let phonetic = ''

  for (const source of sources) {
    const data = source.data
    
    if (source.api === 'free-dictionary') {
      if (data.meanings) {
        for (const meaning of data.meanings) {
          for (const def of meaning.definitions || []) {
            allDefinitions.push({
              definition: def.definition,
              partOfSpeech: meaning.partOfSpeech,
              example: def.example
            })
          }
        }
      }
      if (data.phonetic) phonetic = data.phonetic
      if (data.origin) etymology.historical_origins = data.origin
    } else if (source.api === 'merriam-webster') {
      if (Array.isArray(data.shortdef)) {
        for (const def of data.shortdef) {
          allDefinitions.push({
            definition: def,
            partOfSpeech: data.fl || 'unknown'
          })
        }
      }
      if (data.et && data.et[0] && data.et[0][1]) {
        etymology.historical_origins = data.et[0][1]
      }
    }
  }

  // Use AI to enhance the word profile
  const enhancedProfile = await enhanceWithAI(wordData.word, allDefinitions, etymology)

  return {
    word: wordData.word,
    morpheme_breakdown: enhancedProfile.morpheme_breakdown || {},
    etymology: etymology,
    definitions: {
      primary: allDefinitions[0]?.definition || '',
      standard: allDefinitions.slice(0, 3).map(d => d.definition),
      contextual: enhancedProfile.contextual_definition || '',
      extended: allDefinitions.slice(3, 6).map(d => d.definition)
    },
    word_forms: enhancedProfile.word_forms || {},
    analysis: {
      parts_of_speech: [...new Set(allDefinitions.map(d => d.partOfSpeech))].join(', '),
      synonyms: enhancedProfile.synonyms || [],
      usage_examples: enhancedProfile.usage_examples || [],
      common_collocations: enhancedProfile.collocations || '',
      example: allDefinitions.find(d => d.example)?.example || enhancedProfile.example_sentence || ''
    },
    data_sources: sources.map(s => s.api),
    quality_score: calculateQualityScore(allDefinitions, etymology, enhancedProfile),
    enrichment_status: 'ai_enhanced'
  }
}

async function enhanceWithAI(word: string, definitions: any[], etymology: any) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  if (!openaiKey) return {}

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Calvarn, an AI vocabulary expert. Analyze words and provide enhanced linguistic data in JSON format.'
          },
          {
            role: 'user',
            content: `Enhance this word profile for "${word}":
            
Existing definitions: ${JSON.stringify(definitions.slice(0, 3))}
Etymology: ${JSON.stringify(etymology)}

Provide a JSON response with:
- morpheme_breakdown: {prefix: {text, meaning}, root: {text, meaning}, suffix: {text, meaning}}
- word_forms: relevant inflections
- synonyms: array of 3-5 synonyms
- usage_examples: array of 2-3 example sentences
- collocations: common word combinations
- contextual_definition: enhanced definition with context
- example_sentence: one clear example sentence

Keep responses concise and educational.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const content = data.choices[0].message.content
      try {
        return JSON.parse(content)
      } catch {
        return {}
      }
    }
  } catch (error) {
    console.error('AI enhancement error:', error)
  }
  
  return {}
}

function calculateQualityScore(definitions: any[], etymology: any, aiData: any): number {
  let score = 0
  
  // Base score for having definitions
  if (definitions.length > 0) score += 30
  if (definitions.length > 2) score += 10
  
  // Etymology bonus
  if (etymology.historical_origins) score += 15
  
  // AI enhancement bonuses
  if (aiData.morpheme_breakdown) score += 20
  if (aiData.synonyms && aiData.synonyms.length > 0) score += 10
  if (aiData.usage_examples && aiData.usage_examples.length > 0) score += 10
  if (aiData.collocations) score += 5
  
  return Math.min(score, 100)
}
