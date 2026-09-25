CREATE TABLE IF NOT EXISTS public.word_profiles_duplicates_backup (
  id uuid,
  word text,
  created_at timestamptz,
  updated_at timestamptz,
  morpheme_breakdown jsonb,
  etymology jsonb,
  definitions jsonb,
  word_forms jsonb,
  analysis jsonb,
  quality_score numeric,
  completeness_score numeric,
  last_enrichment_at timestamptz,
  enrichment_status text,
  data_sources jsonb,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.word_profiles_duplicates_backup TO service_role;

ALTER TABLE public.word_profiles_duplicates_backup ENABLE ROW LEVEL SECURITY;