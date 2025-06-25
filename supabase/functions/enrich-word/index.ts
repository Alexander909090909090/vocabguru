
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnrichmentOptions {
  cleanData?: boolean;
  fillMissingFields?: boolean;
  enhanceDefinitions?: boolean;
  improveEtymology?: boolean;
  addUsageExamples?: boolean;
  generateSynonyms?: boolean;
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

    const { wordId, options = {} } = await req.json()
    
    if (!wordId) {
      return new Response(
        JSON.stringify({ error: 'Word ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Enriching word ID: ${wordId} with options:`, options)

    // Fetch the word profile
    const { data: wordData, error: fetchError } = await supabaseClient
      .from('word_profiles')
      .select('*')
      .eq('id', wordId)
      .single()

    if (fetchError || !wordData) {
      return new Response(
        JSON.stringify({ error: 'Word not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try Groq API first (free tier available)
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    let enrichmentResult = null

    if (groqApiKey) {
      console.log('Using Groq API for enrichment')
      enrichmentResult = await enrichWithGroq(wordData, options, groqApiKey)
    } else {
      console.log('No Groq API key found, using fallback enrichment')
      enrichmentResult = await enrichWithFallback(wordData, options)
    }

    // Update the word profile with enriched data
    const { data: updatedWord, error: updateError } = await supabaseClient
      .from('word_profiles')
      .update(enrichmentResult.enrichedData)
      .eq('id', wordId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating word:', updateError)
      throw updateError
    }

    const result = {
      word: wordData.word,
      success: true,
      changes: enrichmentResult.changes,
      quality_score: enrichmentResult.qualityScore,
      enriched_data: updatedWord
    }

    console.log(`Enrichment completed for word: ${wordData.word}`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Enrichment error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Enrichment failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function enrichWithGroq(wordData: any, options: EnrichmentOptions, apiKey: string) {
  const prompt = generateEnrichmentPrompt(wordData, options)
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a linguistic expert specializing in etymology, morphology, and vocabulary enrichment. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const enrichedContent = JSON.parse(data.choices[0].message.content)
    
    return processEnrichmentResponse(wordData, enrichedContent, options)
  } catch (error) {
    console.error('Groq enrichment failed:', error)
    // Fallback to rule-based enrichment
    return await enrichWithFallback(wordData, options)
  }
}

async function enrichWithFallback(wordData: any, options: EnrichmentOptions) {
  console.log('Using fallback enrichment for word:', wordData.word)
  
  const changes: string[] = []
  const enrichedData = { ...wordData }
  
  // Clean existing data
  if (options.cleanData) {
    enrichedData.word = wordData.word?.trim().toLowerCase() || ''
    if (enrichedData.definitions?.primary) {
      enrichedData.definitions.primary = cleanText(enrichedData.definitions.primary)
    }
    changes.push('cleaned_data')
  }
  
  // Fill missing fields with intelligent defaults
  if (options.fillMissingFields) {
    if (!enrichedData.etymology?.language_of_origin) {
      enrichedData.etymology = enrichedData.etymology || {}
      enrichedData.etymology.language_of_origin = detectLanguageOrigin(wordData.word)
      changes.push('added_language_origin')
    }
    
    if (!enrichedData.analysis?.parts_of_speech) {
      enrichedData.analysis = enrichedData.analysis || {}
      enrichedData.analysis.parts_of_speech = inferPartOfSpeech(wordData.word)
      changes.push('inferred_part_of_speech')
    }
  }
  
  // Generate basic synonyms if missing
  if (options.generateSynonyms && (!enrichedData.analysis?.synonyms?.length)) {
    enrichedData.analysis = enrichedData.analysis || {}
    enrichedData.analysis.synonyms = generateBasicSynonyms(wordData.word)
    changes.push('generated_synonyms')
  }
  
  const qualityScore = assessQuality(enrichedData)
  
  return {
    enrichedData,
    changes,
    qualityScore
  }
}

function generateEnrichmentPrompt(wordData: any, options: EnrichmentOptions): string {
  const word = wordData.word
  const currentData = JSON.stringify(wordData, null, 2)
  
  return `
Analyze and enrich this word profile for "${word}". Current data:
${currentData}

Please provide enrichment in this exact JSON format:
{
  "morpheme_breakdown": {
    "prefix": {"text": "prefix", "meaning": "meaning"} or null,
    "root": {"text": "root", "meaning": "meaning"},
    "suffix": {"text": "suffix", "meaning": "meaning"} or null,
    "phonetic": "phonetic transcription"
  },
  "etymology": {
    "language_of_origin": "language",
    "historical_origins": "detailed etymology",
    "word_evolution": "how the word evolved"
  },
  "definitions": {
    "primary": "clear, concise primary definition",
    "standard": ["definition 1", "definition 2", "definition 3"]
  },
  "analysis": {
    "parts_of_speech": "noun/verb/adjective/etc",
    "synonyms": ["synonym1", "synonym2", "synonym3"],
    "antonyms": ["antonym1", "antonym2"],
    "usage_examples": ["example 1", "example 2", "example 3"],
    "collocations": ["collocation 1", "collocation 2"]
  },
  "word_forms": {
    "base_form": "${word}",
    "noun_forms": {"singular": "", "plural": ""} or null,
    "verb_tenses": {"present": "", "past": "", "past_participle": ""} or null,
    "adjective_forms": {"positive": "", "comparative": "", "superlative": ""} or null
  }
}

Requirements:
- Only include accurate, verifiable information
- Keep definitions clear and concise
- Provide 2-3 high-quality synonyms
- Include realistic usage examples
- Ensure phonetic transcription follows IPA standards
- Fill missing fields while preserving existing accurate data
`
}

function processEnrichmentResponse(originalData: any, enrichedContent: any, options: EnrichmentOptions) {
  const changes: string[] = []
  const enrichedData = { ...originalData }
  
  // Merge enriched data carefully, preserving good existing data
  if (enrichedContent.morpheme_breakdown && options.fillMissingFields) {
    enrichedData.morpheme_breakdown = {
      ...enrichedData.morpheme_breakdown,
      ...enrichedContent.morpheme_breakdown
    }
    changes.push('enhanced_morpheme_breakdown')
  }
  
  if (enrichedContent.etymology && options.improveEtymology) {
    enrichedData.etymology = {
      ...enrichedData.etymology,
      ...enrichedContent.etymology
    }
    changes.push('enhanced_etymology')
  }
  
  if (enrichedContent.definitions && options.enhanceDefinitions) {
    enrichedData.definitions = {
      ...enrichedData.definitions,
      ...enrichedContent.definitions
    }
    changes.push('enhanced_definitions')
  }
  
  if (enrichedContent.analysis) {
    enrichedData.analysis = {
      ...enrichedData.analysis,
      ...enrichedContent.analysis
    }
    changes.push('enhanced_analysis')
  }
  
  if (enrichedContent.word_forms) {
    enrichedData.word_forms = {
      ...enrichedData.word_forms,
      ...enrichedContent.word_forms
    }
    changes.push('enhanced_word_forms')
  }
  
  const qualityScore = assessQuality(enrichedData)
  
  return {
    enrichedData,
    changes,
    qualityScore
  }
}

// Utility functions
function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').replace(/[^\w\s\-.,;:!?'"()]/g, '').trim()
}

function detectLanguageOrigin(word: string): string {
  // Simple heuristics for language detection
  if (word.endsWith('tion') || word.endsWith('sion')) return 'Latin'
  if (word.includes('ph') || word.includes('th')) return 'Greek'
  if (word.endsWith('ung') || word.includes('sch')) return 'German'
  if (word.endsWith('esque') || word.endsWith('age')) return 'French'
  return 'English'
}

function inferPartOfSpeech(word: string): string {
  if (word.endsWith('ly')) return 'adverb'
  if (word.endsWith('tion') || word.endsWith('ness') || word.endsWith('ment')) return 'noun'
  if (word.endsWith('ing') || word.endsWith('ed')) return 'verb'
  if (word.endsWith('ful') || word.endsWith('less') || word.endsWith('ous')) return 'adjective'
  return 'noun' // Default assumption
}

function generateBasicSynonyms(word: string): string[] {
  // This is a simplified approach - in production, you'd use a thesaurus API
  const synonymMap: Record<string, string[]> = {
    'beautiful': ['lovely', 'attractive', 'gorgeous'],
    'big': ['large', 'huge', 'enormous'],
    'small': ['tiny', 'little', 'miniature'],
    'good': ['excellent', 'great', 'wonderful'],
    'bad': ['awful', 'terrible', 'horrible']
  }
  
  return synonymMap[word.toLowerCase()] || []
}

function assessQuality(wordData: any): number {
  let score = 0
  let maxScore = 0
  
  // Essential fields (40 points)
  maxScore += 40
  if (wordData.word) score += 10
  if (wordData.definitions?.primary) score += 15
  if (wordData.etymology?.language_of_origin) score += 10
  if (wordData.analysis?.parts_of_speech) score += 5
  
  // Morpheme breakdown (25 points)
  maxScore += 25
  if (wordData.morpheme_breakdown?.root?.text) score += 10
  if (wordData.morpheme_breakdown?.root?.meaning) score += 8
  if (wordData.morpheme_breakdown?.prefix || wordData.morpheme_breakdown?.suffix) score += 7
  
  // Enhanced content (25 points)
  maxScore += 25
  if (wordData.analysis?.synonyms?.length > 0) score += 8
  if (wordData.analysis?.usage_examples?.length > 0) score += 8
  if (wordData.definitions?.standard?.length > 1) score += 9
  
  // Etymology richness (10 points)
  maxScore += 10
  if (wordData.etymology?.historical_origins) score += 5
  if (wordData.etymology?.word_evolution) score += 5
  
  return Math.round((score / maxScore) * 100)
}
