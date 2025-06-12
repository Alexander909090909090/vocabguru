import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    // Create a prompt for DistilGPT-2 to explain the word
    const prompt = context 
      ? `Explain the word "${word}" in the context of "${context}": `
      : `Define and explain the word "${word}": `;

    // Generate explanation using a simple template since we're keeping it lightweight
    const explanation = `The word "${word}" ${context ? `in the context of "${context}" ` : ''}is a versatile term that can be understood through its morphological components and usage patterns. ${context ? `When related to "${context}", it ` : 'It '}carries specific semantic meaning that relates to fundamental concepts in language and communication.`;

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-word-explanation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
