-- Calvern core: one clean profile per word, a canonical morpheme inventory,
-- and the per-user library + study tables the app code already expects.
-- Non-destructive: existing rows and columns are kept.

-- 1. word_profiles: one row per word, versioned Calvern profile ----------------

ALTER TABLE public.word_profiles
  ADD COLUMN IF NOT EXISTS profile jsonb,
  ADD COLUMN IF NOT EXISTS schema_version integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'legacy';

COMMENT ON COLUMN public.word_profiles.profile IS
  'Full validated Calvern profile (see supabase/functions/_shared/calvern.ts). Legacy jsonb columns are derived from it.';
COMMENT ON COLUMN public.word_profiles.schema_version IS
  '0 = legacy/dictionary-only row, >=1 = Calvern schema version that produced profile.';

-- Fails loudly if duplicate words already exist, so they can be merged by hand.
CREATE UNIQUE INDEX IF NOT EXISTS word_profiles_word_key
  ON public.word_profiles (lower(btrim(word)));

-- 2. Canonical morphemes ------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.morphemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('prefix', 'root', 'suffix', 'combining_form', 'infix')),
  form text NOT NULL,             -- bare form, no hyphens: 'super', 'flu', 'ous'
  meaning text NOT NULL,          -- canonical gloss, first writer wins
  origin_language text NOT NULL DEFAULT '',
  source_form text,               -- e.g. 'fluere', '-ōsus'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS morphemes_identity_key
  ON public.morphemes (kind, lower(form), lower(origin_language));

CREATE TABLE IF NOT EXISTS public.word_morphemes (
  word_profile_id uuid NOT NULL REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  position smallint NOT NULL,
  morpheme_id uuid NOT NULL REFERENCES public.morphemes(id) ON DELETE RESTRICT,
  gloss text,                     -- meaning of the morpheme inside this word
  PRIMARY KEY (word_profile_id, position)
);

CREATE INDEX IF NOT EXISTS word_morphemes_morpheme_idx ON public.word_morphemes (morpheme_id);

ALTER TABLE public.morphemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_morphemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Morphemes are publicly readable" ON public.morphemes;
CREATE POLICY "Morphemes are publicly readable" ON public.morphemes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Word morphemes are publicly readable" ON public.word_morphemes;
CREATE POLICY "Word morphemes are publicly readable" ON public.word_morphemes FOR SELECT USING (true);
-- Writes happen only through the calvern-analyze edge function (service role).

-- 3. Per-user library (shape matches src/services/userWordLibraryService.ts) --

CREATE TABLE IF NOT EXISTS public.user_word_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id uuid NOT NULL REFERENCES public.word_profiles(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  mastery_level smallint NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  study_count integer NOT NULL DEFAULT 0 CHECK (study_count >= 0),
  last_studied timestamptz,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, word_id)
);

CREATE INDEX IF NOT EXISTS user_word_library_due_idx
  ON public.user_word_library (user_id, next_review_at);

ALTER TABLE public.user_word_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own library" ON public.user_word_library;
CREATE POLICY "Users manage their own library" ON public.user_word_library
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Study sessions (shape matches StudySession in userWordLibraryService.ts) --

CREATE TABLE IF NOT EXISTS public.user_study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('vocabulary', 'quiz', 'review')),
  words_studied uuid[] NOT NULL DEFAULT '{}',
  correct_answers integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  session_duration integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  notes text
);

ALTER TABLE public.user_study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own study sessions" ON public.user_study_sessions;
CREATE POLICY "Users manage their own study sessions" ON public.user_study_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Atomic save of a Calvern profile ------------------------------------------
-- Called only by the calvern-analyze edge function. Writes the word row, its
-- canonical morphemes and the ordered word->morpheme links in one transaction.

CREATE OR REPLACE FUNCTION public.save_calvern_profile(
  p_word text,
  p_profile jsonb,
  p_legacy jsonb,
  p_schema_version integer,
  p_source text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_word text := lower(btrim(p_word));
  v_word_id uuid;
  v_morpheme jsonb;
  v_morpheme_id uuid;
  v_position smallint := 0;
BEGIN
  SELECT id INTO v_word_id FROM word_profiles WHERE lower(btrim(word)) = v_word;

  IF v_word_id IS NULL THEN
    INSERT INTO word_profiles (word, profile, schema_version, source,
      morpheme_breakdown, etymology, definitions, word_forms, analysis)
    VALUES (v_word, p_profile, p_schema_version, p_source,
      p_legacy->'morpheme_breakdown', p_legacy->'etymology', p_legacy->'definitions',
      p_legacy->'word_forms', p_legacy->'analysis')
    RETURNING id INTO v_word_id;
  ELSE
    UPDATE word_profiles SET
      word = v_word,
      profile = p_profile,
      schema_version = p_schema_version,
      source = p_source,
      morpheme_breakdown = p_legacy->'morpheme_breakdown',
      etymology = p_legacy->'etymology',
      definitions = p_legacy->'definitions',
      word_forms = p_legacy->'word_forms',
      analysis = p_legacy->'analysis',
      updated_at = now()
    WHERE id = v_word_id;
    DELETE FROM word_morphemes WHERE word_profile_id = v_word_id;
  END IF;

  FOR v_morpheme IN SELECT * FROM jsonb_array_elements(p_profile->'morphemes') LOOP
    INSERT INTO morphemes (kind, form, meaning, origin_language, source_form)
    VALUES (v_morpheme->>'kind', v_morpheme->>'form', v_morpheme->>'meaning',
            coalesce(v_morpheme->>'origin_language', ''), v_morpheme->>'source_form')
    ON CONFLICT (kind, lower(form), lower(origin_language)) DO NOTHING;

    SELECT id INTO v_morpheme_id FROM morphemes
    WHERE kind = v_morpheme->>'kind'
      AND lower(form) = lower(v_morpheme->>'form')
      AND lower(origin_language) = lower(coalesce(v_morpheme->>'origin_language', ''));

    INSERT INTO word_morphemes (word_profile_id, position, morpheme_id, gloss)
    VALUES (v_word_id, v_position, v_morpheme_id, v_morpheme->>'meaning');
    v_position := v_position + 1;
  END LOOP;

  RETURN v_word_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_calvern_profile(text, jsonb, jsonb, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_calvern_profile(text, jsonb, jsonb, integer, text) TO service_role;