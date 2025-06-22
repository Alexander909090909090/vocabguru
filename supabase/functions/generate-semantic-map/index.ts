
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Calvarn, an AI semantic mapping specialist. Generate a semantic map showing how words relate to each other conceptually. Return JSON with this structure:

{
  "central_concept": "string",
  "related_words": [
    {"word": "string", "relationship": "string", "strength": number}
  ],
  "conceptual_domains": ["string"]
}

Relationship types: synonym, antonym, hypernym, hyponym, meronym, holonym, metaphor, metonym, collocation, semantic_field
Strength: 0.1-1.0 (1.0 being strongest relationship)`
          },
          {
            role: 'user',
            content: `Generate a semantic map for the word "${word}". Include 10-15 related words with varied relationship types and strengths.`
          }
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    const mapText = data.choices[0].message.content;
    
    try {
      const semanticMap = JSON.parse(mapText);
      return new Response(JSON.stringify(semanticMap), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse semantic map:', parseError);
      return new Response(JSON.stringify({
        central_concept: word,
        related_words: [],
        conceptual_domains: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-semantic-map function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      central_concept: word,
      related_words: [],
      conceptual_domains: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
