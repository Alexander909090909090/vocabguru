
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
    // Get the authorization header
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

    // Create authenticated Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from JWT token
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

    // Allow all authenticated users to analyze word quality
    console.log(`User ${user.id} requesting word quality analysis`)

    // Get all word profiles for analysis
    const { data: wordProfiles, error: profilesError } = await supabase
      .from('word_profiles')
      .select('id, word, definitions, etymology, morpheme_breakdown, analysis, quality_score, completeness_score')

    if (profilesError) {
      console.error('Error fetching word profiles:', profilesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch word profiles' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!wordProfiles || wordProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No word profiles found to analyze',
          analyzed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Analyze each word profile
    const analysisPromises = wordProfiles.map(async (profile) => {
      try {
        // Calculate quality score based on data completeness
        let qualityScore = 0
        let completenessScore = 0

        // Check for essential data
        if (profile.word && profile.word.trim()) qualityScore += 10
        if (profile.definitions?.primary) qualityScore += 20
        if (profile.morpheme_breakdown?.root) qualityScore += 15
        if (profile.etymology?.language_of_origin) qualityScore += 10
        if (profile.analysis?.parts_of_speech) qualityScore += 10

        // Check for enriched data
        if (profile.definitions?.standard && Array.isArray(profile.definitions.standard) && profile.definitions.standard.length > 1) {
          qualityScore += 10
        }
        if (profile.analysis?.synonyms && Array.isArray(profile.analysis.synonyms) && profile.analysis.synonyms.length > 0) {
          qualityScore += 5
        }
        if (profile.analysis?.usage_examples && Array.isArray(profile.analysis.usage_examples) && profile.analysis.usage_examples.length > 0) {
          qualityScore += 10
        }
        if (profile.morpheme_breakdown?.root?.meaning) qualityScore += 10

        // Calculate completeness score
        const totalFields = 10
        let completedFields = 0
        
        if (profile.word) completedFields++
        if (profile.definitions?.primary) completedFields++
        if (profile.morpheme_breakdown?.root) completedFields++
        if (profile.etymology?.language_of_origin) completedFields++
        if (profile.analysis?.parts_of_speech) completedFields++
        if (profile.definitions?.standard?.length > 0) completedFields++
        if (profile.analysis?.synonyms?.length > 0) completedFields++
        if (profile.analysis?.usage_examples?.length > 0) completedFields++
        if (profile.morpheme_breakdown?.root?.meaning) completedFields++
        if (profile.etymology?.historical_development) completedFields++

        completenessScore = Math.round((completedFields / totalFields) * 100)

        // Update the word profile with calculated scores
        const { error: updateError } = await supabase
          .from('word_profiles')
          .update({
            quality_score: qualityScore,
            completeness_score: completenessScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`Error updating quality scores for ${profile.word}:`, updateError)
          return false
        }

        return true
      } catch (error) {
        console.error(`Error analyzing word ${profile.word}:`, error)
        return false
      }
    })

    const results = await Promise.all(analysisPromises)
    const successCount = results.filter(result => result).length

    console.log(`Successfully analyzed ${successCount}/${wordProfiles.length} word profiles`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully analyzed ${successCount} word profiles`,
        analyzed: successCount,
        total: wordProfiles.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in analyze-word-quality:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
