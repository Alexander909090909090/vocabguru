
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

// High-value vocabulary words organized by category
const VOCABULARY_CATEGORIES = {
  academic: [
    'analyze', 'synthesize', 'hypothesis', 'methodology', 'paradigm', 'empirical',
    'theoretical', 'comprehensive', 'demonstrate', 'illustrate', 'evaluate', 'critique',
    'fundamental', 'significant', 'considerable', 'substantial', 'inherent', 'apparent'
  ],
  common: [
    'beautiful', 'important', 'different', 'following', 'complete', 'special',
    'available', 'political', 'difficult', 'economic', 'similar', 'various',
    'recent', 'certain', 'personal', 'international', 'social', 'general'
  ],
  technical: [
    'algorithm', 'interface', 'protocol', 'architecture', 'framework', 'infrastructure',
    'optimization', 'implementation', 'configuration', 'deployment', 'integration', 'scalability',
    'authentication', 'encryption', 'database', 'bandwidth', 'latency', 'throughput'
  ],
  literary: [
    'eloquent', 'profound', 'sublime', 'melancholy', 'serendipity', 'ephemeral',
    'quintessential', 'ubiquitous', 'meticulous', 'arduous', 'luminous', 'enigmatic',
    'poignant', 'resilient', 'transcendent', 'vivacious', 'whimsical', 'zealous'
  ],
  business: [
    'strategic', 'leverage', 'synergy', 'paradigm', 'optimize', 'streamline',
    'facilitate', 'implement', 'collaborate', 'innovative', 'sustainable', 'scalable',
    'competitive', 'profitable', 'efficient', 'productive', 'dynamic', 'versatile'
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { mode = 'initial', targetCount = 100, categories = ['academic', 'common'] } = await req.json()
    
    console.log(`Smart population mode: ${mode}, target: ${targetCount}, categories:`, categories)

    // Check current word count
    const { count: currentCount } = await supabaseClient
      .from('word_profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`Current word count: ${currentCount}`)

    if (mode === 'initial' && (currentCount || 0) >= targetCount) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Database already has sufficient words',
          currentCount,
          wordsAdded: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Select words to populate
    const wordsToAdd = selectWordsForPopulation(categories, targetCount - (currentCount || 0))
    console.log(`Selected ${wordsToAdd.length} words for population`)

    // Process words in batches
    const batchSize = 5
    let totalAdded = 0
    
    for (let i = 0; i < wordsToAdd.length; i += batchSize) {
      const batch = wordsToAdd.slice(i, i + batchSize)
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: ${batch.join(', ')}`)
      
      const batchResults = await Promise.allSettled(
        batch.map(word => processWordForDatabase(word))
      )
      
      const successful = batchResults.filter(result => result.status === 'fulfilled').length
      totalAdded += successful
      
      console.log(`Batch completed: ${successful}/${batch.length} successful`)
      
      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`Population completed: ${totalAdded} words added`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        wordsAdded: totalAdded,
        currentTotal: (currentCount || 0) + totalAdded,
        categories: categories
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Smart population error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function selectWordsForPopulation(categories: string[], targetCount: number): string[] {
  const selectedWords = new Set<string>()
  const wordsPerCategory = Math.ceil(targetCount / categories.length)
  
  for (const category of categories) {
    const categoryWords = VOCABULARY_CATEGORIES[category as keyof typeof VOCABULARY_CATEGORIES] || []
    const shuffled = categoryWords.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < Math.min(wordsPerCategory, shuffled.length); i++) {
      selectedWords.add(shuffled[i])
      if (selectedWords.size >= targetCount) break
    }
    
    if (selectedWords.size >= targetCount) break
  }
  
  return Array.from(selectedWords)
}

async function processWordForDatabase(word: string): Promise<boolean> {
  try {
    // Check if word already exists
    const { data: existingWord } = await supabaseClient
      .from('word_profiles')
      .select('id')
      .eq('word', word.toLowerCase())
      .maybeSingle()

    if (existingWord) {
      console.log(`Word "${word}" already exists, skipping`)
      return false
    }

    // Fetch word data from APIs
    const wordData = await fetchWordFromMultipleAPIs(word)
    if (!wordData) {
      console.log(`No data found for word "${word}"`)
      return false
    }

    // Store in database
    const stored = await storeEnhancedWord(wordData)
    return !!stored
  } catch (error) {
    console.error(`Error processing word "${word}":`, error)
    return false
  }
}

async function fetchWordFromMultipleAPIs(word: string) {
  const results = { word: word.toLowerCase(), sources: [] }

  // Try Free Dictionary API
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (response.ok) {
      const data = await response.json()
      if (data[0]) {
        results.sources.push({ api: 'free-dictionary', data: data[0] })
      }
    }
  } catch (error) {
    console.log(`Free Dictionary failed for "${word}":`, error.message)
  }

  // Try Merriam-Webster if available
  const mwKey = Deno.env.get('MERRIAM_WEBSTER_DICT_KEY')
  if (mwKey) {
    try {
      const response = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${mwKey}`)
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data[0] && typeof data[0] === 'object') {
          results.sources.push({ api: 'merriam-webster', data: data[0] })
        }
      }
    } catch (error) {
      console.log(`Merriam-Webster failed for "${word}":`, error.message)
    }
  }

  return results.sources.length > 0 ? results : null
}

async function storeEnhancedWord(wordData: any) {
  try {
    const wordProfile = await convertToEnhancedWordProfile(wordData)
    
    const { data, error } = await supabaseClient
      .from('word_profiles')
      .insert(wordProfile)
      .select()
      .single()

    if (error) {
      console.error(`Database error for "${wordData.word}":`, error)
      return null
    }

    console.log(`Successfully stored enhanced word: ${wordData.word}`)
    return data
  } catch (error) {
    console.error(`Error storing word "${wordData.word}":`, error)
    return null
  }
}

async function convertToEnhancedWordProfile(wordData: any) {
  const sources = wordData.sources
  const primarySource = sources[0]?.data
  
  // Extract basic data
  const definitions = []
  let etymology = {}
  let phonetic = ''
  let partOfSpeech = ''

  for (const source of sources) {
    const data = source.data
    
    if (source.api === 'free-dictionary') {
      if (data.meanings) {
        for (const meaning of data.meanings) {
          partOfSpeech = meaning.partOfSpeech || partOfSpeech
          for (const def of meaning.definitions || []) {
            definitions.push({
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
      partOfSpeech = data.fl || partOfSpeech
      if (Array.isArray(data.shortdef)) {
        for (const def of data.shortdef) {
          definitions.push({
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

  // Enhance with AI
  const aiEnhancement = await getAIEnhancement(wordData.word, definitions, etymology)

  return {
    word: wordData.word,
    morpheme_breakdown: aiEnhancement.morpheme_breakdown || {
      root: { text: wordData.word, meaning: definitions[0]?.definition || '' }
    },
    etymology: {
      ...etymology,
      language_of_origin: aiEnhancement.language_of_origin || 'English'
    },
    definitions: {
      primary: definitions[0]?.definition || '',
      standard: definitions.slice(0, 3).map(d => d.definition),
      contextual: aiEnhancement.contextual_definition || '',
      extended: definitions.slice(3, 6).map(d => d.definition)
    },
    word_forms: aiEnhancement.word_forms || {
      base_form: wordData.word
    },
    analysis: {
      parts_of_speech: partOfSpeech || 'unknown',
      synonyms: aiEnhancement.synonyms || [],
      usage_examples: aiEnhancement.usage_examples || [],
      common_collocations: aiEnhancement.collocations || '',
      example: definitions.find(d => d.example)?.example || aiEnhancement.example_sentence || ''
    },
    data_sources: sources.map(s => s.api),
    quality_score: calculateWordQuality(definitions, etymology, aiEnhancement),
    enrichment_status: 'auto_populated'
  }
}

async function getAIEnhancement(word: string, definitions: any[], etymology: any) {
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
            content: 'You are Calvarn, VocabGuru\'s AI vocabulary expert. Enhance word profiles with accurate linguistic data in JSON format. Be concise and educational.'
          },
          {
            role: 'user',
            content: `Enhance "${word}" with this data:
Definitions: ${JSON.stringify(definitions.slice(0, 2))}
Etymology: ${JSON.stringify(etymology)}

Return JSON with:
- morpheme_breakdown: {prefix/root/suffix with text and meaning}
- word_forms: relevant inflections
- synonyms: 3-5 quality synonyms
- usage_examples: 2-3 clear sentences
- collocations: common phrases with this word
- contextual_definition: enhanced definition
- example_sentence: one perfect example
- language_of_origin: origin language

Focus on accuracy and educational value.`
          }
        ],
        temperature: 0.2,
        max_tokens: 400
      }),
    })

    if (response.ok) {
      const data = await response.json()
      try {
        return JSON.parse(data.choices[0].message.content)
      } catch {
        return {}
      }
    }
  } catch (error) {
    console.error('AI enhancement error:', error)
  }
  
  return {}
}

function calculateWordQuality(definitions: any[], etymology: any, aiData: any): number {
  let score = 20 // Base score
  
  if (definitions.length > 0) score += 25
  if (definitions.length > 2) score += 10
  if (etymology.historical_origins) score += 15
  if (aiData.morpheme_breakdown) score += 15
  if (aiData.synonyms && aiData.synonyms.length > 0) score += 10
  if (aiData.usage_examples && aiData.usage_examples.length > 0) score += 5
  
  return Math.min(score, 100)
}
