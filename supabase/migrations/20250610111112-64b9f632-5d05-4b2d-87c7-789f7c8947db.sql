
-- Create comprehensive word profiles table
CREATE TABLE public.word_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  language_origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Morpheme breakdown
  prefix_text TEXT,
  prefix_meaning TEXT,
  root_text TEXT NOT NULL,
  root_meaning TEXT,
  suffix_text TEXT,
  suffix_meaning TEXT,
  
  -- Etymology details
  historical_origin TEXT,
  word_evolution TEXT,
  cultural_variations TEXT,
  
  -- Definitions (JSON array)
  definitions JSONB DEFAULT '[]'::jsonb,
  
  -- Word forms
  noun_form TEXT,
  verb_form TEXT,
  adjective_form TEXT,
  adverb_form TEXT,
  
  -- Usage information
  common_collocations JSONB DEFAULT '[]'::jsonb,
  contextual_usage TEXT,
  sentence_structure TEXT,
  example_sentence TEXT,
  
  -- Synonyms and antonyms
  synonyms JSONB DEFAULT '[]'::jsonb,
  antonyms JSONB DEFAULT '[]'::jsonb,
  
  -- Additional metadata
  frequency_score INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'intermediate',
  is_featured BOOLEAN DEFAULT false,
  
  UNIQUE(word)
);

-- Create webhook logs table for tracking incoming data
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'calvin', 'zapier', etc.
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  error_message TEXT,
  word_profile_id UUID REFERENCES public.word_profiles(id)
);

-- Create indexes for better performance
CREATE INDEX idx_word_profiles_word ON public.word_profiles(word);
CREATE INDEX idx_word_profiles_language_origin ON public.word_profiles(language_origin);
CREATE INDEX idx_word_profiles_part_of_speech ON public.word_profiles(part_of_speech);
CREATE INDEX idx_word_profiles_featured ON public.word_profiles(is_featured);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);

-- Enable Row Level Security
ALTER TABLE public.word_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to word profiles
CREATE POLICY "Word profiles are publicly readable" 
  ON public.word_profiles 
  FOR SELECT 
  USING (true);

-- Create policies for webhook logs (admin only for now)
CREATE POLICY "Webhook logs are admin only" 
  ON public.webhook_logs 
  FOR ALL 
  USING (false);

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
