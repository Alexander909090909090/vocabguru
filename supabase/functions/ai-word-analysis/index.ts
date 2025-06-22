
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
            content: `You are Calvarn, an advanced AI morphological linguist specializing in deep word analysis. Provide comprehensive analysis of words including morphological breakdown, semantic analysis, etymology, and learning insights. Return your response as a JSON object with the following structure:

{
  "word": "string",
  "morphological_breakdown": {
    "prefix": {"text": "string", "meaning": "string", "origin": "string"} | null,
    "root": {"text": "string", "meaning": "string", "origin": "string"},
    "suffix": {"text": "string", "meaning": "string", "origin": "string"} | null
  },
  "semantic_analysis": {
    "core_meaning": "string",
    "conceptual_metaphors": ["string"],
    "semantic_field": "string",
    "related_concepts": ["string"]
  },
  "etymology_deep_dive": {
    "historical_development": "string",
    "language_family": "string",
    "cognates": [{"language": "string", "word": "string", "meaning": "string"}],
    "semantic_evolution": "string"
  },
  "contextual_usage": {
    "register_levels": ["string"],
    "discourse_patterns": ["string"],
    "collocational_strength": [{"word": "string", "score": number}],
    "pragmatic_functions": ["string"]
  },
  "learning_insights": {
    "difficulty_factors": ["string"],
    "memory_anchors": ["string"],
    "learning_strategies": ["string"],
    "common_errors": ["string"]
  }
}`
          },
          {
            role: 'user',
            content: `Analyze the word "${word}" providing deep morphological, semantic, and etymological insights. Focus on educational value and learning strategies.`
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
        error: 'Failed to parse AI analysis',
        raw_response: analysisText
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-word-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      word: req.body?.word || 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
