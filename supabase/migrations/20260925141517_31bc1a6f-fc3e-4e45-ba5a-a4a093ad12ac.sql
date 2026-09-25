-- Calvern P1: word status + quarantine, popularity, images, retry tracking, and the word queue.
-- Non-destructive. Nothing is deleted; bad rows are set aside with a reason.

-- 1. word_profiles: lifecycle and feed columns -----------------------------------

ALTER TABLE public.word_profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS quarantine_reason text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_credit text,
  ADD COLUMN IF NOT EXISTS lookup_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS regen_attempts smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_regen_error text;

DO $$ BEGIN
  ALTER TABLE public.word_profiles
    ADD CONSTRAINT word_profiles_status_check CHECK (status IN ('active', 'quarantined'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS word_profiles_backfill_idx
  ON public.word_profiles (status, schema_version, lookup_count DESC);
CREATE INDEX IF NOT EXISTS word_profiles_popular_idx
  ON public.word_profiles (lookup_count DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS word_profiles_recent_idx
  ON public.word_profiles (created_at DESC) WHERE status = 'active';

-- Known junk from the audit: web code stored as definitions.
UPDATE public.word_profiles
SET status = 'quarantined', quarantine_reason = 'HTML in stored definition'
WHERE status = 'active' AND definitions->>'primary' LIKE '%<%';

-- 2. Word queue (imports now; neighbours of saved words in P2) -------------------

CREATE TABLE IF NOT EXISTS public.word_queue (
  word text PRIMARY KEY CHECK (word = lower(btrim(word))),
  source text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'rejected', 'failed')),
  attempts smallint NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
CREATE INDEX IF NOT EXISTS word_queue_pending_idx ON public.word_queue (created_at) WHERE status = 'pending';
ALTER TABLE public.word_queue ENABLE ROW LEVEL SECURITY; -- service role only

-- 3. Functions (service role only) -------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_word_lookup(p_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE word_profiles SET lookup_count = lookup_count + 1, last_viewed_at = now() WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.quarantine_word(p_word text, p_reason text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE word_profiles SET status = 'quarantined', quarantine_reason = p_reason
  WHERE lower(btrim(word)) = lower(btrim(p_word));
$$;

CREATE OR REPLACE FUNCTION public.note_regen_failure(p_word text, p_error text, p_max_attempts integer) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE word_profiles SET
    regen_attempts = regen_attempts + 1,
    last_regen_error = p_error,
    status = CASE WHEN regen_attempts + 1 >= p_max_attempts THEN 'quarantined' ELSE status END,
    quarantine_reason = CASE WHEN regen_attempts + 1 >= p_max_attempts
                             THEN 'regeneration failed: ' || p_error ELSE quarantine_reason END
  WHERE lower(btrim(word)) = lower(btrim(p_word));
$$;

-- A successful save always reactivates the word and clears retry state.
CREATE OR REPLACE FUNCTION public.save_calvern_profile(
  p_word text, p_profile jsonb, p_legacy jsonb, p_schema_version integer, p_source text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
      word = v_word, profile = p_profile, schema_version = p_schema_version, source = p_source,
      morpheme_breakdown = p_legacy->'morpheme_breakdown', etymology = p_legacy->'etymology',
      definitions = p_legacy->'definitions', word_forms = p_legacy->'word_forms', analysis = p_legacy->'analysis',
      status = 'active', quarantine_reason = NULL, regen_attempts = 0, last_regen_error = NULL,
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

  -- Close the loop for queued words.
  UPDATE word_queue SET status = 'done', processed_at = now() WHERE word = v_word AND status <> 'done';

  RETURN v_word_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_word_lookup(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.quarantine_word(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.note_regen_failure(text, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_calvern_profile(text, jsonb, jsonb, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_word_lookup(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.quarantine_word(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.note_regen_failure(text, text, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_calvern_profile(text, jsonb, jsonb, integer, text) TO service_role;

-- 4. Seed the queue with the Airtable list (words already stored are regenerated via the stale path) --

INSERT INTO public.word_queue (word, source)
SELECT v.word, 'airtable'
FROM (VALUES
  ('abundant'),
  ('abysmal'),
  ('abyss'),
  ('adeptly'),
  ('adequacy'),
  ('adroit'),
  ('affidavit'),
  ('allophone'),
  ('anaphora'),
  ('anonymous'),
  ('antithesis'),
  ('arcane'),
  ('artifact'),
  ('ascertain'),
  ('aseptique'),
  ('assortment'),
  ('auspicious'),
  ('autocracy'),
  ('axiomatically'),
  ('begotten'),
  ('bellicose'),
  ('belligerent'),
  ('berated'),
  ('biochar'),
  ('biodiversity'),
  ('biopharmaceutique'),
  ('biosimotics'),
  ('bomb'),
  ('bombastic'),
  ('boundary'),
  ('brash'),
  ('buffoon'),
  ('bygone'),
  ('cacophony'),
  ('cape'),
  ('centrifuge'),
  ('chaos'),
  ('cognition'),
  ('collective'),
  ('commend'),
  ('comparative'),
  ('condemnation'),
  ('consensus'),
  ('contentious'),
  ('context'),
  ('deciphering'),
  ('decoding'),
  ('deconstruct'),
  ('decorum'),
  ('demean'),
  ('democracy'),
  ('denigrate'),
  ('denote'),
  ('designation'),
  ('designed'),
  ('diachronic'),
  ('dialect'),
  ('diamond'),
  ('diglossia'),
  ('diplomacy'),
  ('disagreeable'),
  ('disapprobation'),
  ('disapprocated'),
  ('discourse'),
  ('disparage'),
  ('disposition'),
  ('disproportionate'),
  ('drivel'),
  ('dubious'),
  ('dynamic'),
  ('dysbiosis'),
  ('dysregulation'),
  ('electromagnetism'),
  ('elicit'),
  ('encapsulate'),
  ('enriching'),
  ('epistrophe'),
  ('epitome'),
  ('errant'),
  ('erroneous'),
  ('esoteric'),
  ('evaluation'),
  ('exceed'),
  ('extrapolate'),
  ('factionalism'),
  ('fallacy'),
  ('fallible'),
  ('ferromagnetism'),
  ('fetter'),
  ('flame'),
  ('flow'),
  ('formidable'),
  ('fostering'),
  ('frivolity'),
  ('frivolous'),
  ('gargantuan'),
  ('grammar'),
  ('grapheme'),
  ('grow'),
  ('heterodox'),
  ('heterogeneus'),
  ('homogenous'),
  ('homograph'),
  ('horizontal'),
  ('hypernym'),
  ('idiomatic'),
  ('idiosyncratic'),
  ('immoderate'),
  ('impeccable'),
  ('imperfect'),
  ('imperial'),
  ('impinge'),
  ('implicatures'),
  ('imprudently'),
  ('inadvertently'),
  ('inclination'),
  ('indicate'),
  ('indiciaire'),
  ('indictments'),
  ('indigenous'),
  ('indomitable'),
  ('inept'),
  ('inerrant'),
  ('infallible'),
  ('inordinate'),
  ('integration'),
  ('latin'),
  ('learn'),
  ('let'),
  ('levity'),
  ('lexicon'),
  ('life'),
  ('misunderstanding'),
  ('mitigate'),
  ('mockery'),
  ('modicum'),
  ('morpheme'),
  ('myopic'),
  ('omit'),
  ('omniscient'),
  ('opulent'),
  ('palindrome'),
  ('paramount'),
  ('pen'),
  ('penumbra'),
  ('performance'),
  ('perpetuity'),
  ('petulant'),
  ('phoneme'),
  ('phonology'),
  ('photosynthesis'),
  ('phycologist'),
  ('platitude'),
  ('polychromatic'),
  ('pragmatic'),
  ('pragmatics'),
  ('presuppose'),
  ('presupposition'),
  ('proliferate'),
  ('pugnacious'),
  ('quantum'),
  ('quarrelsome'),
  ('redacted'),
  ('relic'),
  ('reluctant'),
  ('repertoire'),
  ('reproach'),
  ('republic'),
  ('reputation'),
  ('requisition'),
  ('robust'),
  ('sacrosanct'),
  ('semantics'),
  ('send'),
  ('sequentially'),
  ('serendipity'),
  ('sesquipedalian'),
  ('sociolinguistics'),
  ('solemnities'),
  ('solstice'),
  ('spew'),
  ('splendid'),
  ('summer solstice'),
  ('superfluous'),
  ('synchronic'),
  ('syntax'),
  ('tantamount'),
  ('technocracy'),
  ('tedious'),
  ('tempestuous'),
  ('tenuous'),
  ('trenchant'),
  ('trepidation'),
  ('trite'),
  ('truculent'),
  ('tumultuous'),
  ('typology'),
  ('ubiquitous'),
  ('uncertain'),
  ('unconsequential'),
  ('undoubtedly'),
  ('unerring'),
  ('vector'),
  ('vehemently'),
  ('verbatim'),
  ('vertical')
) AS v(word)
WHERE NOT EXISTS (SELECT 1 FROM public.word_profiles wp WHERE lower(btrim(wp.word)) = v.word)
ON CONFLICT (word) DO NOTHING;