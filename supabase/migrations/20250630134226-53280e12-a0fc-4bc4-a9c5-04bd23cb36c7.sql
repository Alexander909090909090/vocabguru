
-- Phase 1: Enhanced Schema Validation and Data Quality
-- Add data quality tracking to existing word_profiles table
ALTER TABLE public.word_profiles ADD COLUMN IF NOT EXISTS quality_score NUMERIC DEFAULT 0;
ALTER TABLE public.word_profiles ADD COLUMN IF NOT EXISTS completeness_score NUMERIC DEFAULT 0;
ALTER TABLE public.word_profiles ADD COLUMN IF NOT EXISTS last_enrichment_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.word_profiles ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';
ALTER TABLE public.word_profiles ADD COLUMN IF NOT EXISTS data_sources JSONB DEFAULT '[]'::jsonb;

-- Create data quality audit table
CREATE TABLE IF NOT EXISTS public.data_quality_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id),
  audit_type TEXT NOT NULL,
  quality_score NUMERIC NOT NULL,
  missing_fields JSONB DEFAULT '[]'::jsonb,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enrichment queue for background processing
CREATE TABLE IF NOT EXISTS public.enrichment_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id),
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create API source tracking table
CREATE TABLE IF NOT EXISTS public.api_source_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id),
  source_name TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_profiles_quality_score ON public.word_profiles(quality_score);
CREATE INDEX IF NOT EXISTS idx_word_profiles_enrichment_status ON public.word_profiles(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_status ON public.enrichment_queue(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_queue_priority ON public.enrichment_queue(priority DESC);

-- Function to calculate data completeness score
CREATE OR REPLACE FUNCTION calculate_word_completeness(word_data JSONB, definitions_data JSONB, etymology_data JSONB, analysis_data JSONB)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  max_score NUMERIC := 100;
BEGIN
  -- Essential fields (40 points)
  IF word_data ? 'word' AND word_data->>'word' != '' THEN score := score + 15; END IF;
  IF definitions_data ? 'primary' AND definitions_data->>'primary' != '' THEN score := score + 15; END IF;
  IF etymology_data ? 'language_of_origin' AND etymology_data->>'language_of_origin' != '' THEN score := score + 10; END IF;
  
  -- Morpheme breakdown (25 points)
  IF word_data ? 'root' THEN score := score + 10; END IF;
  IF word_data->'root' ? 'meaning' AND word_data->'root'->>'meaning' != '' THEN score := score + 8; END IF;
  IF word_data ? 'prefix' OR word_data ? 'suffix' THEN score := score + 7; END IF;
  
  -- Definitions richness (20 points)
  IF definitions_data ? 'standard' AND jsonb_array_length(definitions_data->'standard') > 1 THEN score := score + 10; END IF;
  IF definitions_data ? 'contextual' AND jsonb_array_length(definitions_data->'contextual') > 0 THEN score := score + 10; END IF;
  
  -- Analysis depth (15 points)
  IF analysis_data ? 'synonyms' AND jsonb_array_length(analysis_data->'synonyms') > 0 THEN score := score + 5; END IF;
  IF analysis_data ? 'usage_examples' AND jsonb_array_length(analysis_data->'usage_examples') > 0 THEN score := score + 5; END IF;
  IF analysis_data ? 'common_collocations' AND analysis_data->>'common_collocations' != '' THEN score := score + 5; END IF;
  
  RETURN ROUND((score / max_score) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to identify missing fields
CREATE OR REPLACE FUNCTION identify_missing_fields(word_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  profile RECORD;
  missing_fields JSONB := '[]'::jsonb;
BEGIN
  SELECT * INTO profile FROM public.word_profiles WHERE id = word_profile_id;
  
  IF profile.definitions->>'primary' IS NULL OR profile.definitions->>'primary' = '' THEN
    missing_fields := missing_fields || '["primary_definition"]'::jsonb;
  END IF;
  
  IF profile.morpheme_breakdown->'root'->>'meaning' IS NULL OR profile.morpheme_breakdown->'root'->>'meaning' = '' THEN
    missing_fields := missing_fields || '["root_meaning"]'::jsonb;
  END IF;
  
  IF profile.etymology->>'language_of_origin' IS NULL OR profile.etymology->>'language_of_origin' = '' THEN
    missing_fields := missing_fields || '["language_origin"]'::jsonb;
  END IF;
  
  IF profile.analysis->>'parts_of_speech' IS NULL OR profile.analysis->>'parts_of_speech' = '' THEN
    missing_fields := missing_fields || '["parts_of_speech"]'::jsonb;
  END IF;
  
  IF NOT (profile.analysis ? 'synonyms') OR jsonb_array_length(profile.analysis->'synonyms') = 0 THEN
    missing_fields := missing_fields || '["synonyms"]'::jsonb;
  END IF;
  
  IF NOT (profile.analysis ? 'usage_examples') OR jsonb_array_length(profile.analysis->'usage_examples') = 0 THEN
    missing_fields := missing_fields || '["usage_examples"]'::jsonb;
  END IF;
  
  RETURN missing_fields;
END;
$$ LANGUAGE plpgsql;

-- Function to queue word for enrichment
CREATE OR REPLACE FUNCTION queue_word_for_enrichment(word_profile_id UUID, enrichment_priority INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.enrichment_queue (word_profile_id, priority)
  VALUES (word_profile_id, enrichment_priority)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically queue words with low quality scores
CREATE OR REPLACE FUNCTION auto_queue_low_quality_words()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quality_score < 70 OR NEW.completeness_score < 80 THEN
    PERFORM queue_word_for_enrichment(NEW.id, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_queue_low_quality_words
  AFTER INSERT OR UPDATE ON public.word_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_low_quality_words();

-- Update existing word profiles with initial quality scores
UPDATE public.word_profiles 
SET 
  completeness_score = calculate_word_completeness(
    morpheme_breakdown, 
    definitions, 
    etymology, 
    analysis
  ),
  quality_score = LEAST(
    calculate_word_completeness(morpheme_breakdown, definitions, etymology, analysis),
    100
  ),
  enrichment_status = CASE 
    WHEN calculate_word_completeness(morpheme_breakdown, definitions, etymology, analysis) >= 80 THEN 'complete'
    ELSE 'pending'
  END
WHERE quality_score IS NULL;
