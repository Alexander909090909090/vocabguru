
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
            content: `You are Calvarn, an expert linguist specializing in collocation analysis. Analyze the word "${word}" and provide detailed collocation data. Return your response as a JSON object with this structure:

{
  "collocations": [
    {
      "word": "string",
      "frequency": number (1-100),
      "strength": number (0-1),
      "semantic_category": "string",
      "examples": ["string", "string", "string"]
    }
  ]
}

Focus on:
- Common verb-noun, adjective-noun, adverb-verb collocations
- Strength based on mutual information and frequency
- Semantic categories like "intensity", "emotion", "action", etc.
- Real usage examples`
          },
          {
            role: 'user',
            content: `Analyze collocations for the word "${word}"`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(analysisText);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({
        collocations: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in get-advanced-collocations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      collocations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
