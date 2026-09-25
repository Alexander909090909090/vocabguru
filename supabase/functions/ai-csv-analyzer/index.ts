import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CsvAnalysisRequest {
  headers: string[];
  sampleRows: string[][];
}

interface CsvAnalysisResult {
  mappings: Record<string, number>;
  confidence: number;
  recommendations: string[];
  preview: any[];
  aiEnhancements: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headers, sampleRows }: CsvAnalysisRequest = await req.json();
    
    console.log('🔍 AI-powered CSV analysis for headers:', headers);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use AI to intelligently analyze the CSV structure
    const aiPrompt = `
You are an expert linguistic data analyst. Analyze this CSV structure and provide intelligent mapping for a vocabulary learning application.

Headers: ${headers.join(', ')}
Sample rows: ${sampleRows.slice(0, 3).map(row => row.join(', ')).join('\n')}

Please provide a JSON response with the following structure:
{
  "mappings": {
    "word": index_number_or_null,
    "definition": index_number_or_null,
    "part_of_speech": index_number_or_null,
    "etymology": index_number_or_null,
    "pronunciation": index_number_or_null,
    "prefix": index_number_or_null,
    "root": index_number_or_null,
    "suffix": index_number_or_null,
    "language_origin": index_number_or_null,
    "example_usage": index_number_or_null
  },
  "confidence": number_between_0_and_1,
  "unmapped_columns": [list_of_column_indices_that_dont_match_standard_fields],
  "ai_enhancements": [list_of_missing_fields_that_can_be_generated_with_ai],
  "analysis_notes": "explanation_of_your_analysis"
}

Consider semantic meaning, not just exact column names. For example:
- "meaning", "definition", "explanation" all map to definition
- "type", "pos", "grammar" map to part_of_speech
- "origin", "source", "from" map to etymology
- Be flexible and intelligent in your mapping
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
          { role: 'system', content: 'You are a precise data analysis AI that responds only with valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.1,
      }),
    });

    const aiData = await response.json();
    const aiResult = JSON.parse(aiData.choices[0].message.content);

    // Convert AI response to our expected format
    const mappings: Record<string, number> = {};
    const recommendations: string[] = [];
    const aiEnhancements: string[] = aiResult.ai_enhancements || [];

    // Process AI mappings
    Object.entries(aiResult.mappings).forEach(([field, index]) => {
      if (index !== null && typeof index === 'number') {
        mappings[field] = index;
        recommendations.push(`✅ AI detected "${headers[index]}" as ${field} (${Math.round(aiResult.confidence * 100)}% confidence)`);
      }
    });

    // Handle unmapped columns
    if (aiResult.unmapped_columns) {
      aiResult.unmapped_columns.forEach((index: number) => {
        const customFieldName = `custom_${headers[index].toLowerCase().replace(/\s+/g, '_')}`;
        mappings[customFieldName] = index;
        recommendations.push(`📝 Unmapped column: "${headers[index]}" - will be stored as custom field`);
      });
    }

    // Add AI enhancement recommendations
    aiEnhancements.forEach(enhancement => {
      recommendations.push(`🤖 AI will generate: ${enhancement}`);
    });

    // Generate preview with mappings
    const preview = sampleRows.slice(0, 3).map(row => {
      const mapped: any = {};
      Object.entries(mappings).forEach(([field, colIndex]) => {
        if (colIndex !== undefined && row[colIndex]) {
          mapped[field] = row[colIndex];
        }
      });
      return mapped;
    });

    const result: CsvAnalysisResult = {
      mappings,
      confidence: aiResult.confidence || 0.8,
      recommendations,
      preview,
      aiEnhancements
    };

    console.log('🧠 AI CSV Analysis Result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI CSV Analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      mappings: {},
      confidence: 0,
      recommendations: ['❌ AI analysis failed - falling back to basic pattern matching'],
      preview: [],
      aiEnhancements: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});