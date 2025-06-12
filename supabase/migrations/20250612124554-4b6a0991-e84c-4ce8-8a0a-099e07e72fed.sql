
-- Drop the existing word_profiles table if it exists to recreate with new schema
DROP TABLE IF EXISTS public.word_profiles CASCADE;

-- Create comprehensive word_profiles table matching the detailed template
CREATE TABLE public.word_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Morpheme Breakdown (JSON)
  morpheme_breakdown JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "prefix": {"text": "", "meaning": "", "origin": ""},
  --   "root": {"text": "", "meaning": ""},
  --   "suffix": {"text": "", "meaning": "", "origin": ""}
  -- }
  
  -- Etymology (JSON)
  etymology JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "historical_origins": "",
  --   "language_of_origin": "",
  --   "word_evolution": "",
  --   "cultural_regional_variations": ""
  -- }
  
  -- Definitions (JSON)
  definitions JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "primary": "",
  --   "standard": ["", "", ""],
  --   "extended": ["", ""],
  --   "contextual": "",
  --   "specialized": ""
  -- }
  
  -- Word Forms & Inflections (JSON)
  word_forms JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "base_form": "",
  --   "verb_tenses": {
  --     "present": "", "past": "", "future": "",
  --     "present_participle": "", "past_participle": "", "other": ""
  --   },
  --   "noun_forms": {"singular": "", "plural": ""},
  --   "adjective_forms": {"positive": "", "comparative": "", "superlative": ""},
  --   "adverb_form": "",
  --   "other_inflections": ""
  -- }
  
  -- Analysis of the Word (JSON)
  analysis JSONB DEFAULT '{}'::jsonb
  -- Structure: {
  --   "parts_of_speech": "",
  --   "tenses_voice_mood": "",
  --   "articles_determiners": "",
  --   "sentence_positions": "",
  --   "sentence_structure": "",
  --   "contextual_usage": "",
  --   "synonyms_antonyms": "",
  --   "common_collocations": "",
  --   "cultural_historical_significance": "",
  --   "example": ""
  -- }
);

-- Create indexes for better performance
CREATE INDEX idx_word_profiles_word ON public.word_profiles(word);
CREATE INDEX idx_word_profiles_morpheme_breakdown ON public.word_profiles USING GIN(morpheme_breakdown);
CREATE INDEX idx_word_profiles_etymology ON public.word_profiles USING GIN(etymology);
CREATE INDEX idx_word_profiles_definitions ON public.word_profiles USING GIN(definitions);
CREATE INDEX idx_word_profiles_word_forms ON public.word_profiles USING GIN(word_forms);
CREATE INDEX idx_word_profiles_analysis ON public.word_profiles USING GIN(analysis);

-- Enable Row Level Security
ALTER TABLE public.word_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Word profiles are publicly readable" 
  ON public.word_profiles 
  FOR SELECT 
  USING (true);

-- Create policy for authenticated write access (for admin/import operations)
CREATE POLICY "Authenticated users can manage word profiles" 
  ON public.word_profiles 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
CREATE TRIGGER trigger_word_profiles_updated_at
  BEFORE UPDATE ON public.word_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
