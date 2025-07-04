
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

    // Allow all authenticated users to start batch enrichment
    console.log(`User ${user.id} requesting batch enrichment`)

    const { batchSize = 10, qualityThreshold = 70 } = await req.json()

    // Get words that need enrichment
    const { data: wordsToEnrich, error: wordsError } = await supabase
      .from('word_profiles')
      .select('id, word, quality_score, enrichment_status')
      .or(`quality_score.lt.${qualityThreshold},enrichment_status.eq.pending,enrichment_status.is.null`)
      .limit(batchSize)

    if (wordsError) {
      console.error('Error fetching words to enrich:', wordsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch words for enrichment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!wordsToEnrich || wordsToEnrich.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No words found that need enrichment',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Queue words for enrichment
    const enrichmentPromises = wordsToEnrich.map(async (word) => {
      const { error: queueError } = await supabase
        .from('enrichment_queue')
        .upsert({
          word_profile_id: word.id,
          status: 'pending',
          priority: 2,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'word_profile_id'
        })

      if (queueError) {
        console.error(`Error queueing word ${word.word}:`, queueError)
        return false
      }

      // Update word profile status
      const { error: updateError } = await supabase
        .from('word_profiles')
        .update({ 
          enrichment_status: 'queued',
          updated_at: new Date().toISOString()
        })
        .eq('id', word.id)

      if (updateError) {
        console.error(`Error updating word ${word.word}:`, updateError)
        return false
      }

      return true
    })

    const results = await Promise.all(enrichmentPromises)
    const successCount = results.filter(result => result).length

    console.log(`Successfully queued ${successCount}/${wordsToEnrich.length} words for enrichment`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully queued ${successCount} words for enrichment`,
        processed: successCount,
        total: wordsToEnrich.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in start-batch-enrichment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
