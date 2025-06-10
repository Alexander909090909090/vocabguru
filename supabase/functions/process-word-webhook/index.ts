
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { source, payload } = await req.json()
    
    // Log the incoming webhook
    const { data: logData, error: logError } = await supabaseClient
      .from('webhook_logs')
      .insert({
        source,
        payload,
        status: 'pending'
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging webhook:', logError)
      return new Response(
        JSON.stringify({ error: 'Failed to log webhook' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Process Calvin webhook payload
    if (source === 'calvin' || source === 'zapier') {
      await processCalvinPayload(supabaseClient, payload, logData.id)
    }

    return new Response(
      JSON.stringify({ success: true, log_id: logData.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processCalvinPayload(supabaseClient: any, payload: any, logId: string) {
  try {
    const wordData = {
      word: payload.word,
      pronunciation: payload.metadata?.pronunciation,
      part_of_speech: payload.metadata?.part_of_speech,
      language_origin: payload.metadata?.language_origin || 'Unknown',
      
      // Morpheme breakdown
      prefix_text: payload.morphemes?.prefix?.text,
      prefix_meaning: payload.morphemes?.prefix?.meaning,
      root_text: payload.morphemes?.root?.text,
      root_meaning: payload.morphemes?.root?.meaning,
      suffix_text: payload.morphemes?.suffix?.text,
      suffix_meaning: payload.morphemes?.suffix?.meaning,
      
      // Etymology
      historical_origin: payload.etymology?.origin,
      word_evolution: payload.etymology?.evolution,
      cultural_variations: payload.etymology?.cultural_variations,
      
      // Definitions
      definitions: payload.definitions || [],
      
      // Word forms
      noun_form: payload.forms?.noun,
      verb_form: payload.forms?.verb,
      adjective_form: payload.forms?.adjective,
      adverb_form: payload.forms?.adverb,
      
      // Usage
      common_collocations: payload.usage?.collocations || [],
      contextual_usage: payload.usage?.contextual_usage,
      example_sentence: payload.usage?.example_sentence,
      
      // Synonyms and antonyms
      synonyms: payload.synonyms || [],
      antonyms: payload.antonyms || [],
      
      // Metadata
      frequency_score: payload.metadata?.frequency_score || 0,
      difficulty_level: payload.metadata?.difficulty_level || 'intermediate',
      is_featured: false
    }

    // Insert or update word profile
    const { data: wordProfile, error: wordError } = await supabaseClient
      .from('word_profiles')
      .upsert(wordData, { 
        onConflict: 'word',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (wordError) {
      throw new Error(`Failed to save word profile: ${wordError.message}`)
    }

    // Update webhook log status
    await supabaseClient
      .from('webhook_logs')
      .update({ 
        status: 'processed',
        word_profile_id: wordProfile.id 
      })
      .eq('id', logId)

    console.log(`Successfully processed word: ${payload.word}`)

  } catch (error) {
    console.error('Error processing Calvin payload:', error)
    
    // Update webhook log with error
    await supabaseClient
      .from('webhook_logs')
      .update({ 
        status: 'failed',
        error_message: error.message 
      })
      .eq('id', logId)
    
    throw error
  }
}
