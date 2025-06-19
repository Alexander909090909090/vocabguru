
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  origin?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { words } = await req.json();
    const wordList = words || [
      'serendipity', 'ephemeral', 'ubiquitous', 'paradigm', 'catalyst',
      'eloquent', 'meticulous', 'resilient', 'innovative', 'profound',
      'sophisticated', 'comprehensive', 'extraordinary', 'magnificent', 'revolutionary'
    ];

    const results = [];

    for (const word of wordList) {
      try {
        // Check if word already exists
        const { data: existing } = await supabase
          .from('word_repository')
          .select('id')
          .eq('word', word.toLowerCase())
          .maybeSingle();

        if (existing) {
          console.log(`Word "${word}" already exists, skipping...`);
          continue;
        }

        // Fetch from Free Dictionary API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
          console.log(`No data found for word: ${word}`);
          continue;
        }

        const data: DictionaryApiResponse[] = await response.json();
        const wordData = data[0];

        if (!wordData) continue;

        // Fetch frequency data from Datamuse
        const datamuse = await fetch(`https://api.datamuse.com/words?sp=${word}&md=f&max=1`);
        const freqData = await datamuse.json();
        const frequency = freqData[0]?.tags?.find((t: string) => t.startsWith('f:'))?.substring(2) || 50;

        // Create comprehensive word entry
        const wordEntry = {
          word: word.toLowerCase(),
          phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text,
          audio_url: wordData.phonetics?.find(p => p.audio)?.audio,
          
          morpheme_data: {
            root: { text: word, meaning: "Base form" }
          },
          
          etymology_data: {
            historical_origins: wordData.origin || "",
            language_of_origin: "English"
          },
          
          definitions_data: {
            primary: wordData.meanings?.[0]?.definitions?.[0]?.definition || "",
            standard: wordData.meanings?.flatMap(m => 
              m.definitions.slice(0, 3).map(d => d.definition)
            ) || [],
            extended: wordData.meanings?.flatMap(m => 
              m.definitions.slice(3, 5).map(d => d.definition)
            ) || []
          },
          
          word_forms_data: {
            base_form: word
          },
          
          analysis_data: {
            parts_of_speech: wordData.meanings?.map(m => m.partOfSpeech).join(", ") || "",
            usage_examples: wordData.meanings?.flatMap(m => 
              m.definitions.map(d => d.example).filter(Boolean)
            ).slice(0, 3) || [],
            synonyms: wordData.meanings?.flatMap(m => 
              m.definitions.flatMap(d => d.synonyms || [])
            ).slice(0, 5) || [],
            antonyms: wordData.meanings?.flatMap(m => 
              m.definitions.flatMap(d => d.antonyms || [])
            ).slice(0, 5) || [],
            example_sentence: wordData.meanings?.[0]?.definitions?.[0]?.example || ""
          },
          
          source_apis: ["free-dictionary", "datamuse"],
          frequency_score: parseInt(frequency) || 50,
          difficulty_level: parseInt(frequency) > 70 ? "easy" : parseInt(frequency) > 40 ? "medium" : "hard"
        };

        // Insert into database
        const { data: inserted, error } = await supabase
          .from('word_repository')
          .insert(wordEntry)
          .select()
          .single();

        if (error) {
          console.error(`Error inserting word "${word}":`, error);
          continue;
        }

        results.push({ word, success: true, id: inserted.id });
        console.log(`Successfully added word: ${word}`);

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing word "${word}":`, error);
        results.push({ word, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${wordList.length} words`,
        results,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in populate-word-repository function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
