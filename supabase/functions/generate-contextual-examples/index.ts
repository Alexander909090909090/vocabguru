
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
    const { word, context } = await req.json();

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
            content: `You are Calvarn, an AI contextual usage specialist. Generate contextual examples and usage patterns for words. Return JSON with this structure:

{
  "examples": [
    {
      "sentence": "string",
      "context_type": "string",
      "explanation": "string"
    }
  ],
  "usage_patterns": ["string"]
}

Context types: academic, professional, casual, literary, technical, historical, cultural, colloquial`
          },
          {
            role: 'user',
            content: `Generate 6-8 contextual examples for the word "${word}" in different contexts${context ? ` with focus on ${context}` : ''}. Include varied sentence structures and usage patterns.`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const examplesText = data.choices[0].message.content;
    
    try {
      const contextualExamples = JSON.parse(examplesText);
      return new Response(JSON.stringify(contextualExamples), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse contextual examples:', parseError);
      return new Response(JSON.stringify({
        examples: [],
        usage_patterns: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-contextual-examples function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      examples: [],
      usage_patterns: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
