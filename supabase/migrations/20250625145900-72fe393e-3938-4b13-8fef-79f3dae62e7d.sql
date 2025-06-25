
-- Enhanced database schema for comprehensive linguistic analysis
-- Add comprehensive linguistic analysis tables

-- Table for storing morphological components with detailed analysis
CREATE TABLE public.morphological_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK (component_type IN ('prefix', 'root', 'suffix', 'infix')),
  text TEXT NOT NULL,
  meaning TEXT,
  origin_language TEXT,
  allomorphs JSONB DEFAULT '[]'::jsonb,
  boundary_position INTEGER,
  semantic_function TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for etymology chains and historical development
CREATE TABLE public.etymology_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  language_family TEXT,
  source_language TEXT,
  borrowed_from TEXT,
  first_attestation_date TEXT,
  semantic_evolution TEXT,
  borrowing_path JSONB DEFAULT '[]'::jsonb,
  historical_forms JSONB DEFAULT '[]'::jsonb,
  cognates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for phonetic and phonological data
CREATE TABLE public.phonetic_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  ipa_transcription TEXT,
  phonemes JSONB DEFAULT '[]'::jsonb,
  syllable_structure TEXT,
  stress_pattern TEXT,
  syllable_count INTEGER,
  rhyme_scheme TEXT,
  sound_changes JSONB DEFAULT '[]'::jsonb,
  regional_pronunciations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for semantic relationships and fields
CREATE TABLE public.semantic_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  semantic_field TEXT,
  conceptual_domain TEXT,
  connotation TEXT CHECK (connotation IN ('positive', 'negative', 'neutral')),
  register_level TEXT CHECK (register_level IN ('formal', 'informal', 'technical', 'colloquial', 'academic')),
  frequency_score DECIMAL(10,6),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  cultural_context TEXT,
  social_associations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for word relationships (synonyms, antonyms, etc.)
CREATE TABLE public.word_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_word_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  target_word_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('synonym', 'antonym', 'hypernym', 'hyponym', 'meronym', 'holonym', 'cognate')),
  strength DECIMAL(3,2) DEFAULT 0.5,
  context TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_word_id, target_word_id, relationship_type)
);

-- Table for usage contexts and examples
CREATE TABLE public.usage_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  context_type TEXT CHECK (context_type IN ('formal', 'informal', 'academic', 'technical', 'literary', 'colloquial')),
  example_sentence TEXT NOT NULL,
  source TEXT,
  frequency_score DECIMAL(10,6),
  regional_usage TEXT,
  time_period TEXT,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for linguistic analysis metadata and quality scores
CREATE TABLE public.linguistic_analysis_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_profile_id UUID REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  analysis_version TEXT DEFAULT '1.0',
  processing_models JSONB DEFAULT '[]'::jsonb,
  confidence_scores JSONB DEFAULT '{}'::jsonb,
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  analysis_duration_ms INTEGER,
  completeness_score DECIMAL(5,2),
  accuracy_score DECIMAL(5,2),
  last_enrichment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  enrichment_source TEXT DEFAULT 'comprehensive_pipeline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_morphological_components_word_profile ON public.morphological_components(word_profile_id);
CREATE INDEX idx_morphological_components_type ON public.morphological_components(component_type);
CREATE INDEX idx_etymology_chains_word_profile ON public.etymology_chains(word_profile_id);
CREATE INDEX idx_etymology_chains_language ON public.etymology_chains(source_language);
CREATE INDEX idx_phonetic_data_word_profile ON public.phonetic_data(word_profile_id);
CREATE INDEX idx_semantic_relationships_word_profile ON public.semantic_relationships(word_profile_id);
CREATE INDEX idx_semantic_relationships_field ON public.semantic_relationships(semantic_field);
CREATE INDEX idx_word_relationships_source ON public.word_relationships(source_word_id);
CREATE INDEX idx_word_relationships_target ON public.word_relationships(target_word_id);
CREATE INDEX idx_word_relationships_type ON public.word_relationships(relationship_type);
CREATE INDEX idx_usage_contexts_word_profile ON public.usage_contexts(word_profile_id);
CREATE INDEX idx_usage_contexts_type ON public.usage_contexts(context_type);
CREATE INDEX idx_linguistic_metadata_word_profile ON public.linguistic_analysis_metadata(word_profile_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER handle_morphological_components_updated_at
  BEFORE UPDATE ON public.morphological_components
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_etymology_chains_updated_at
  BEFORE UPDATE ON public.etymology_chains
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_phonetic_data_updated_at
  BEFORE UPDATE ON public.phonetic_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_semantic_relationships_updated_at
  BEFORE UPDATE ON public.semantic_relationships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_linguistic_metadata_updated_at
  BEFORE UPDATE ON public.linguistic_analysis_metadata
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS policies for security
ALTER TABLE public.morphological_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etymology_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phonetic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semantic_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linguistic_analysis_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read access for all users, admin-only write)
CREATE POLICY "Allow read access to morphological components" ON public.morphological_components FOR SELECT USING (true);
CREATE POLICY "Allow read access to etymology chains" ON public.etymology_chains FOR SELECT USING (true);
CREATE POLICY "Allow read access to phonetic data" ON public.phonetic_data FOR SELECT USING (true);
CREATE POLICY "Allow read access to semantic relationships" ON public.semantic_relationships FOR SELECT USING (true);
CREATE POLICY "Allow read access to word relationships" ON public.word_relationships FOR SELECT USING (true);
CREATE POLICY "Allow read access to usage contexts" ON public.usage_contexts FOR SELECT USING (true);
CREATE POLICY "Allow read access to linguistic metadata" ON public.linguistic_analysis_metadata FOR SELECT USING (true);

-- Create database function for comprehensive word analysis
CREATE OR REPLACE FUNCTION public.get_comprehensive_word_analysis(word_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'word_profile', wp.*,
    'morphological_components', COALESCE(morphological.components, '[]'::json),
    'etymology_chain', COALESCE(etymology.chain, '{}'::json),
    'phonetic_data', COALESCE(phonetic.data, '{}'::json),
    'semantic_relationships', COALESCE(semantic.relationships, '[]'::json),
    'word_relationships', COALESCE(relationships.data, '[]'::json),
    'usage_contexts', COALESCE(usage.contexts, '[]'::json),
    'analysis_metadata', COALESCE(metadata.data, '{}'::json)
  ) INTO result
  FROM public.word_profiles wp
  LEFT JOIN (
    SELECT word_profile_id, json_agg(mc.*) as components
    FROM public.morphological_components mc
    WHERE mc.word_profile_id = word_id
    GROUP BY word_profile_id
  ) morphological ON wp.id = morphological.word_profile_id
  LEFT JOIN (
    SELECT word_profile_id, row_to_json(ec.*) as chain
    FROM public.etymology_chains ec
    WHERE ec.word_profile_id = word_id
    LIMIT 1
  ) etymology ON wp.id = etymology.word_profile_id
  LEFT JOIN (
    SELECT word_profile_id, row_to_json(pd.*) as data
    FROM public.phonetic_data pd
    WHERE pd.word_profile_id = word_id
    LIMIT 1
  ) phonetic ON wp.id = phonetic.word_profile_id
  LEFT JOIN (
    SELECT word_profile_id, json_agg(sr.*) as relationships
    FROM public.semantic_relationships sr
    WHERE sr.word_profile_id = word_id
    GROUP BY word_profile_id
  ) semantic ON wp.id = semantic.word_profile_id
  LEFT JOIN (
    SELECT source_word_id, json_agg(
      json_build_object(
        'relationship_type', wr.relationship_type,
        'target_word', target_wp.word,
        'strength', wr.strength,
        'context', wr.context,
        'confidence_score', wr.confidence_score
      )
    ) as data
    FROM public.word_relationships wr
    LEFT JOIN public.word_profiles target_wp ON wr.target_word_id = target_wp.id
    WHERE wr.source_word_id = word_id
    GROUP BY source_word_id
  ) relationships ON wp.id = relationships.source_word_id
  LEFT JOIN (
    SELECT word_profile_id, json_agg(uc.*) as contexts
    FROM public.usage_contexts uc
    WHERE uc.word_profile_id = word_id
    GROUP BY word_profile_id
  ) usage ON wp.id = usage.word_profile_id
  LEFT JOIN (
    SELECT word_profile_id, row_to_json(lam.*) as data
    FROM public.linguistic_analysis_metadata lam
    WHERE lam.word_profile_id = word_id
    ORDER BY lam.updated_at DESC
    LIMIT 1
  ) metadata ON wp.id = metadata.word_profile_id
  WHERE wp.id = word_id;
  
  RETURN result;
END;
$$;
