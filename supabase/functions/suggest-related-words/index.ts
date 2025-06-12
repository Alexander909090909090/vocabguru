
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
    const { meaning } = await req.json();
    
    // For now, we'll use a simple word association approach
    // In a production environment, you'd integrate with Hugging Face DistilGPT-2
    const suggestions = await generateWordSuggestions(meaning);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in suggest-related-words:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateWordSuggestions(meaning: string): Promise<string[]> {
  // Simple word associations - in production, use DistilGPT-2
  const associations: { [key: string]: string[] } = {
    'fast': ['rapid', 'quick', 'swift', 'speedy', 'hasty', 'brisk', 'fleet'],
    'abundant': ['plentiful', 'copious', 'ample', 'rich', 'prolific', 'bountiful'],
    'beautiful': ['gorgeous', 'stunning', 'lovely', 'attractive', 'elegant', 'graceful'],
    'strong': ['powerful', 'robust', 'mighty', 'sturdy', 'intense', 'vigorous'],
    'small': ['tiny', 'minute', 'petite', 'compact', 'miniature', 'diminutive'],
    'large': ['huge', 'enormous', 'massive', 'gigantic', 'immense', 'colossal']
  };

  const lowerMeaning = meaning.toLowerCase();
  
  // Direct match
  if (associations[lowerMeaning]) {
    return associations[lowerMeaning];
  }
  
  // Partial match
  for (const [key, values] of Object.entries(associations)) {
    if (lowerMeaning.includes(key) || key.includes(lowerMeaning)) {
      return values;
    }
  }
  
  // Default suggestions
  return ['explore', 'discover', 'learn', 'understand', 'analyze'];
}
