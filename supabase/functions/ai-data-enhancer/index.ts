import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnhancementRequest {
  word: string;
  existingData: any;
  missingFields: string[];
}

interface EnhancementResult {
  enhancements: any;
  confidence: number;
  generated_fields: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, existingData, missingFields }: EnhancementRequest = await req.json();
    
    console.log('🤖 AI enhancing word:', word, 'Missing fields:', missingFields);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const aiPrompt = `
You are an expert linguist and etymologist. Enhance the word profile for "${word}" by generating missing linguistic data.

Existing data: ${JSON.stringify(existingData, null, 2)}
Missing fields to generate: ${missingFields.join(', ')}

Generate a JSON response with comprehensive linguistic analysis including:
{
  "definitions": {
    "primary": "clear, concise definition",
    "secondary": ["alternative meanings"],
    "contextual": ["context-specific meanings"]
  },
  "morpheme_breakdown": {
    "prefix": {"text": "prefix", "meaning": "prefix meaning"} or null,
    "root": {"text": "root", "meaning": "root meaning"},
    "suffix": {"text": "suffix", "meaning": "suffix meaning"} or null
  },
  "etymology": {
    "language_of_origin": "source language",
    "historical_development": "evolution explanation",
    "related_words": ["cognates and derivatives"]
  },
  "part_of_speech": "primary grammatical category",
  "pronunciation": "phonetic transcription",
  "synonyms": ["similar words"],
  "antonyms": ["opposite words"],
  "usage_examples": [
    {"sentence": "example sentence", "context": "usage context"},
    {"sentence": "another example", "context": "different context"}
  ],
  "collocations": ["common word combinations"],
  "frequency_score": number_1_to_100,
  "difficulty_level": "beginner|intermediate|advanced",
  "semantic_field": "conceptual domain",
  "connotation": "positive|negative|neutral",
  "register": "formal|informal|technical|colloquial"
}

Provide accurate, educational content suitable for vocabulary learning. Base morphological analysis on established linguistic principles.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a precise linguistic AI that responds only with valid JSON containing comprehensive word analysis.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const enhancements = JSON.parse(aiData.choices[0].message.content);

    const result: EnhancementResult = {
      enhancements,
      confidence: 0.85,
      generated_fields: missingFields
    };

    console.log('✨ AI Enhancement Result for', word, ':', Object.keys(enhancements));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Enhancement error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      enhancements: {},
      confidence: 0,
      generated_fields: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});