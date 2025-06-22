
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
    const { query, filters, limit = 20 } = await req.json()
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Smart search for query: ${query}`)

    // Basic semantic search using word patterns and relationships
    let searchQuery = supabaseClient
      .from('word_profiles')
      .select('*')

    if (query) {
      searchQuery = searchQuery.or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%,analysis->>synonyms.cs.["${query}"]`)
    }

    if (filters?.etymology) {
      searchQuery = searchQuery.eq('etymology->>language_of_origin', filters.etymology)
    }

    if (filters?.partOfSpeech) {
      searchQuery = searchQuery.ilike('analysis->>parts_of_speech', `%${filters.partOfSpeech}%`)
    }

    if (filters?.difficulty) {
      searchQuery = searchQuery.eq('difficulty_level', filters.difficulty)
    }

    const { data, error } = await searchQuery
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Search error:', error)
      throw error
    }

    console.log(`Found ${data?.length || 0} basic results`)

    // AI-powered semantic expansion for better results
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    let enhancedResults = data || []

    if (openaiApiKey && query) {
      try {
        console.log('Enhancing search with AI suggestions...')
        
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
                content: 'You are a vocabulary search assistant. Given a search query, suggest related words, synonyms, and semantic connections that would be relevant to someone learning vocabulary.'
              },
              {
                role: 'user',
                content: `For the search query "${query}", suggest 10 related words or concepts that a vocabulary learner might also be interested in. Return only a JSON array of strings.`
              }
            ],
            temperature: 0.3,
            max_tokens: 200
          }),
        })

        if (response.ok) {
          const aiData = await response.json()
          const suggestions = JSON.parse(aiData.choices[0].message.content)
          
          console.log(`AI suggested ${suggestions.length} related terms`)
          
          // Find additional words based on AI suggestions
          for (const suggestion of suggestions.slice(0, 5)) {
            const { data: additionalWords } = await supabaseClient
              .from('word_profiles')
              .select('*')
              .or(`word.ilike.%${suggestion}%,definitions->>primary.ilike.%${suggestion}%`)
              .limit(2)

            if (additionalWords) {
              enhancedResults = [...enhancedResults, ...additionalWords]
            }
          }
        }
      } catch (aiError) {
        console.log('AI enhancement failed, using basic search:', aiError)
      }
    }

    // Remove duplicates and limit results
    const uniqueResults = enhancedResults.filter((word, index, self) => 
      index === self.findIndex(w => w.id === word.id)
    ).slice(0, limit)

    console.log(`Returning ${uniqueResults.length} unique results`)

    return new Response(
      JSON.stringify({ results: uniqueResults, total: uniqueResults.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Smart search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
