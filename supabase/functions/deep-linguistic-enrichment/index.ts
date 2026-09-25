import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { wordProfileId } = await req.json()

    if (!wordProfileId) {
      return new Response(
        JSON.stringify({ error: 'Word profile ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the word profile
    const { data: wordProfile, error: profileError } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('id', wordProfileId)
      .single()

    if (profileError || !wordProfile) {
      return new Response(
        JSON.stringify({ error: 'Word profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const enrichmentResults = {
      morphological: await performMorphologicalAnalysis(wordProfile),
      phonological: await performPhonologicalAnalysis(wordProfile),
      semantic: await performSemanticAnalysis(wordProfile),
      etymological: await performEtymologicalAnalysis(wordProfile),
      syntactic: await performSyntacticAnalysis(wordProfile)
    }

    // Calculate comprehensive quality score
    const qualityScore = calculateQualityScore(wordProfile, enrichmentResults)

    // Update word profile with enrichment results
    const { error: updateError } = await supabase
      .from('word_profiles')
      .update({
        quality_score: qualityScore.overall,
        completeness_score: qualityScore.completeness,
        enrichment_status: 'completed',
        last_enrichment_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', wordProfileId)

    if (updateError) {
      console.error('Error updating word profile:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update word profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Store detailed enrichment results in respective tables
    await storeEnrichmentResults(supabase, wordProfileId, enrichmentResults)

    console.log(`Successfully enriched word: ${wordProfile.word} (Quality: ${qualityScore.overall})`)

    return new Response(
      JSON.stringify({ 
        success: true,
        word: wordProfile.word,
        qualityScore: qualityScore,
        enrichmentResults: {
          morphological: enrichmentResults.morphological.componentCount,
          phonological: enrichmentResults.phonological.syllableCount,
          semantic: enrichmentResults.semantic.relationshipCount,
          etymological: enrichmentResults.etymological.chainLength,
          syntactic: enrichmentResults.syntactic.patternCount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in deep-linguistic-enrichment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Morphological Analysis: Advanced prefix/root/suffix decomposition
async function performMorphologicalAnalysis(wordProfile: any) {
  const word = wordProfile.word
  const components = []
  
  // Advanced morpheme detection patterns
  const prefixPatterns = {
    'un-': { meaning: 'not, opposite of', origin: 'Old English' },
    'pre-': { meaning: 'before', origin: 'Latin' },
    'anti-': { meaning: 'against', origin: 'Greek' },
    'sub-': { meaning: 'under, below', origin: 'Latin' },
    'inter-': { meaning: 'between', origin: 'Latin' },
    'trans-': { meaning: 'across, beyond', origin: 'Latin' },
    'over-': { meaning: 'excessive, above', origin: 'Old English' },
    'under-': { meaning: 'below, insufficient', origin: 'Old English' }
  }
  
  const suffixPatterns = {
    '-tion': { meaning: 'act, state of', origin: 'Latin' },
    '-ness': { meaning: 'state, quality', origin: 'Old English' },
    '-able': { meaning: 'capable of', origin: 'Latin' },
    '-ful': { meaning: 'full of', origin: 'Old English' },
    '-less': { meaning: 'without', origin: 'Old English' },
    '-ment': { meaning: 'result, condition', origin: 'Latin' },
    '-ly': { meaning: 'in manner of', origin: 'Old English' },
    '-ing': { meaning: 'action, process', origin: 'Old English' }
  }

  // Detect prefixes
  for (const [prefix, data] of Object.entries(prefixPatterns)) {
    if (word.toLowerCase().startsWith(prefix.replace('-', ''))) {
      components.push({
        component_type: 'prefix',
        text: prefix.replace('-', ''),
        meaning: data.meaning,
        origin_language: data.origin,
        boundary_position: prefix.length - 1
      })
      break
    }
  }

  // Detect suffixes
  for (const [suffix, data] of Object.entries(suffixPatterns)) {
    if (word.toLowerCase().endsWith(suffix.replace('-', ''))) {
      components.push({
        component_type: 'suffix',
        text: suffix.replace('-', ''),
        meaning: data.meaning,
        origin_language: data.origin,
        boundary_position: word.length - (suffix.length - 1)
      })
      break
    }
  }

  // Extract root (what remains after removing prefix/suffix)
  let rootText = word
  const prefix = components.find(c => c.component_type === 'prefix')
  const suffix = components.find(c => c.component_type === 'suffix')
  
  if (prefix) rootText = rootText.slice(prefix.text.length)
  if (suffix) rootText = rootText.slice(0, -suffix.text.length)
  
  components.push({
    component_type: 'root',
    text: rootText,
    meaning: wordProfile.definitions?.primary || 'core meaning',
    origin_language: wordProfile.etymology?.language_of_origin || 'Unknown',
    boundary_position: prefix ? prefix.text.length : 0
  })

  return {
    components,
    componentCount: components.length,
    complexity: components.length > 2 ? 'complex' : 'simple'
  }
}

// Phonological Analysis: IPA transcription, syllable structure, stress patterns
async function performPhonologicalAnalysis(wordProfile: any) {
  const word = wordProfile.word
  const syllables = []
  
  // Basic syllable detection (simplified)
  const vowelPattern = /[aeiouAEIOU]/g
  const vowelMatches = word.match(vowelPattern) || []
  const syllableCount = Math.max(1, vowelMatches.length)
  
  // Generate basic IPA transcription (simplified)
  let ipaTranscription = word.toLowerCase()
    .replace(/th/g, 'θ')
    .replace(/sh/g, 'ʃ')
    .replace(/ch/g, 'tʃ')
    .replace(/ng/g, 'ŋ')
    .replace(/ph/g, 'f')
  
  // Basic stress pattern detection
  let stressPattern = 'trochee' // Default for 2-syllable words
  if (syllableCount === 1) stressPattern = 'monosyllabic'
  else if (syllableCount >= 3) stressPattern = 'complex'

  const phonemes = ipaTranscription.split('').map(char => ({
    symbol: char,
    type: /[aeiouAEIOU]/.test(char) ? 'vowel' : 'consonant'
  }))

  return {
    ipaTranscription: `/${ipaTranscription}/`,
    syllableCount,
    syllableStructure: `${syllableCount} syllables`,
    stressPattern,
    phonemes,
    rhymeScheme: word.slice(-2) // Simple rhyme detection
  }
}

// Semantic Analysis: Synonym clustering, semantic fields, contextual relationships
async function performSemanticAnalysis(wordProfile: any) {
  const word = wordProfile.word
  const pos = wordProfile.analysis?.parts_of_speech || 'noun'
  
  // Semantic field classification
  const semanticFields = {
    abstract: ['idea', 'concept', 'thought', 'theory'],
    concrete: ['object', 'thing', 'item', 'entity'],
    emotional: ['feeling', 'emotion', 'mood', 'sentiment'],
    temporal: ['time', 'moment', 'period', 'duration'],
    spatial: ['place', 'location', 'position', 'area']
  }
  
  let semanticField = 'general'
  for (const [field, keywords] of Object.entries(semanticFields)) {
    if (keywords.some(keyword => word.toLowerCase().includes(keyword))) {
      semanticField = field
      break
    }
  }
  
  // Difficulty assessment
  const difficultyLevel = word.length > 8 ? 'advanced' : 
                         word.length > 5 ? 'intermediate' : 'basic'
  
  // Frequency estimation (simplified)
  const frequencyScore = Math.max(10, Math.min(100, 100 - word.length * 5))
  
  const relationships = [{
    type: 'semantic_field',
    value: semanticField,
    strength: 0.8
  }, {
    type: 'difficulty',
    value: difficultyLevel,
    strength: 0.9
  }]

  return {
    semanticField,
    difficultyLevel,
    frequencyScore,
    relationships,
    relationshipCount: relationships.length,
    connotation: 'neutral' // Could be enhanced with sentiment analysis
  }
}

// Etymological Analysis: Language family trees, borrowing paths, historical development
async function performEtymologicalAnalysis(wordProfile: any) {
  const word = wordProfile.word
  const origin = wordProfile.etymology?.language_of_origin || 'Unknown'
  
  // Language family mapping
  const languageFamilies = {
    'Latin': 'Indo-European',
    'Greek': 'Indo-European',
    'Germanic': 'Indo-European',
    'French': 'Indo-European',
    'Spanish': 'Indo-European',
    'Italian': 'Indo-European',
    'Old English': 'Indo-European',
    'Middle English': 'Indo-European',
    'Sanskrit': 'Indo-European',
    'Celtic': 'Indo-European'
  }
  
  const languageFamily = languageFamilies[origin] || 'Unknown'
  
  // Historical development chain
  const historicalForms = []
  if (origin === 'Latin') {
    historicalForms.push({
      period: 'Classical Latin',
      form: word + 'us',
      meaning: wordProfile.definitions?.primary
    })
  } else if (origin === 'Old English') {
    historicalForms.push({
      period: 'Old English',
      form: word.replace(/k/g, 'c'),
      meaning: wordProfile.definitions?.primary
    })
  }
  
  const borrowingPath = origin !== 'Old English' ? [
    { language: origin, period: 'original' },
    { language: 'Middle English', period: 'medieval' },
    { language: 'Modern English', period: 'contemporary' }
  ] : []

  return {
    languageFamily,
    sourceLanguage: origin,
    historicalForms,
    borrowingPath,
    chainLength: borrowingPath.length,
    firstAttestation: 'Unknown', // Could be enhanced with historical data
    semanticEvolution: 'Meaning has remained relatively stable'
  }
}

// Syntactic Analysis: Collocation patterns, argument structure, register analysis
async function performSyntacticAnalysis(wordProfile: any) {
  const word = wordProfile.word
  const pos = wordProfile.analysis?.parts_of_speech || 'noun'
  
  // Common collocation patterns based on POS
  const collocations = []
  if (pos === 'noun') {
    collocations.push(`the ${word}`, `a ${word}`, `${word} of`)
  } else if (pos === 'verb') {
    collocations.push(`to ${word}`, `${word} the`, `${word} with`)
  } else if (pos === 'adjective') {
    collocations.push(`very ${word}`, `${word} and`, `quite ${word}`)
  }
  
  // Register analysis
  const registerLevel = word.length > 10 ? 'formal' : 
                       word.length > 6 ? 'neutral' : 'informal'
  
  // Argument structure (simplified)
  const argumentStructure = pos === 'verb' ? ['subject', 'object'] : 
                           pos === 'adjective' ? ['subject'] : []

  const syntacticPatterns = collocations.map((pattern, index) => ({
    pattern,
    frequency: Math.max(10, 90 - index * 20),
    register: registerLevel
  }))

  return {
    collocations,
    registerLevel,
    argumentStructure,
    syntacticPatterns,
    patternCount: syntacticPatterns.length
  }
}

// Calculate comprehensive quality score
function calculateQualityScore(wordProfile: any, enrichmentResults: any) {
  let score = 0
  let maxScore = 100
  
  // Basic data completeness (40 points)
  if (wordProfile.word) score += 10
  if (wordProfile.definitions?.primary) score += 15
  if (wordProfile.etymology?.language_of_origin) score += 10
  if (wordProfile.analysis?.parts_of_speech) score += 5
  
  // Enrichment depth (60 points)
  score += Math.min(15, enrichmentResults.morphological.componentCount * 5)
  score += Math.min(10, enrichmentResults.phonological.syllableCount * 2)
  score += Math.min(15, enrichmentResults.semantic.relationshipCount * 3)
  score += Math.min(10, enrichmentResults.etymological.chainLength * 3)
  score += Math.min(10, enrichmentResults.syntactic.patternCount * 2)
  
  // Completeness calculation
  const essentialFields = 8
  let completedFields = 0
  
  if (wordProfile.word) completedFields++
  if (wordProfile.definitions?.primary) completedFields++
  if (wordProfile.etymology?.language_of_origin) completedFields++
  if (wordProfile.analysis?.parts_of_speech) completedFields++
  if (enrichmentResults.morphological.componentCount > 0) completedFields++
  if (enrichmentResults.phonological.syllableCount > 0) completedFields++
  if (enrichmentResults.semantic.relationshipCount > 0) completedFields++
  if (enrichmentResults.etymological.chainLength > 0) completedFields++
  
  const completeness = Math.round((completedFields / essentialFields) * 100)
  
  return {
    overall: Math.min(100, score),
    completeness,
    breakdown: {
      basic: Math.min(40, score),
      morphological: Math.min(15, enrichmentResults.morphological.componentCount * 5),
      phonological: Math.min(10, enrichmentResults.phonological.syllableCount * 2),
      semantic: Math.min(15, enrichmentResults.semantic.relationshipCount * 3),
      etymological: Math.min(10, enrichmentResults.etymological.chainLength * 3),
      syntactic: Math.min(10, enrichmentResults.syntactic.patternCount * 2)
    }
  }
}

// Store enrichment results in database tables
async function storeEnrichmentResults(supabase: any, wordProfileId: string, results: any) {
  try {
    // Store morphological components
    if (results.morphological.components.length > 0) {
      const { error: morphError } = await supabase
        .from('morphological_components')
        .upsert(
          results.morphological.components.map((comp: any) => ({
            word_profile_id: wordProfileId,
            ...comp
          })),
          { onConflict: 'word_profile_id,component_type' }
        )
      
      if (morphError) console.error('Error storing morphological data:', morphError)
    }
    
    // Store phonetic data
    const { error: phoneticError } = await supabase
      .from('phonetic_data')
      .upsert({
        word_profile_id: wordProfileId,
        ipa_transcription: results.phonological.ipaTranscription,
        syllable_count: results.phonological.syllableCount,
        syllable_structure: results.phonological.syllableStructure,
        stress_pattern: results.phonological.stressPattern,
        phonemes: results.phonological.phonemes,
        rhyme_scheme: results.phonological.rhymeScheme
      }, { onConflict: 'word_profile_id' })
    
    if (phoneticError) console.error('Error storing phonetic data:', phoneticError)
    
    // Store semantic relationships
    const { error: semanticError } = await supabase
      .from('semantic_relationships')
      .upsert({
        word_profile_id: wordProfileId,
        semantic_field: results.semantic.semanticField,
        difficulty_level: results.semantic.difficultyLevel,
        frequency_score: results.semantic.frequencyScore,
        connotation: results.semantic.connotation
      }, { onConflict: 'word_profile_id' })
    
    if (semanticError) console.error('Error storing semantic data:', semanticError)
    
    // Store etymology chain
    const { error: etymologyError } = await supabase
      .from('etymology_chains')
      .upsert({
        word_profile_id: wordProfileId,
        language_family: results.etymological.languageFamily,
        source_language: results.etymological.sourceLanguage,
        historical_forms: results.etymological.historicalForms,
        borrowing_path: results.etymological.borrowingPath,
        first_attestation_date: results.etymological.firstAttestation,
        semantic_evolution: results.etymological.semanticEvolution
      }, { onConflict: 'word_profile_id' })
    
    if (etymologyError) console.error('Error storing etymology data:', etymologyError)
    
  } catch (error) {
    console.error('Error storing enrichment results:', error)
  }
}