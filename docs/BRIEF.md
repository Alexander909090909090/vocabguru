# VocabGuru — Brief

Shared context for every agent (Lovable, Claude Code, Zapier). Read before working; append a brief after.

## Premise
Understand English words morphologically: from a word's smallest parts (prefix, root, suffix) and their origins to its meaning.

## Core loop — "complete" means all five work end to end
1. **Search** any word.
2. **Calvern breaks it down** in the fixed schema (below) — from the database if known, otherwise generated, validated, and stored.
3. **Save** it to the user's library.
4. **Study** it — review and quizzes from the library.
5. **Ask Calvern** follow-up questions about the word.

## Calvern schema (source of truth: `supabase/functions/_shared/calvern.ts`)
Given Word → Morpheme Breakdown (each morpheme: kind, form, meaning, origin language, source form; plus literal meaning and memory hook) → Etymology (origins, language, evolution, path, related words) → Definitions (primary, standard, specialized) → Word Forms & Inflections → Analysis (parts of speech with examples, collocations, synonyms, antonyms, pronunciation) → Example.

## Data rules
- One row per word in `word_profiles` (unique, case-insensitive). The `profile` column is the full Calvern profile; older jsonb columns are derived from it.
- Morphemes are canonical rows in `morphemes`, linked in order via `word_morphemes`. Same morpheme, same row, across all words.
- Nothing is stored unless it passes `validateProfile`. Writes go only through the `calvern-analyze` edge function.
- The user library is `user_word_library` (per user, protected by row-level security).

## Configuration (edge function secrets)
`AI_BASE_URL` (default OpenAI), `AI_API_KEY` (falls back to `OPENAI_API_KEY`), `AI_MODEL` (default `gpt-4o-mini`). Any OpenAI-compatible provider works.

Recommended free, open-weight setup (Groq free tier):
```
AI_BASE_URL = https://api.groq.com/openai/v1
AI_API_KEY  = <key from console.groq.com>
AI_MODEL    = <an open-weight model listed in the Groq console, e.g. a Llama 70B or gpt-oss 120B>
```
Each word is generated once, then served from the database, so free-tier limits cover normal use.

## Seeding
`supabase/seed/legacy_words.txt` holds 206 unique words from the Airtable "Linguistic Dictionary" base (215 records, deduplicated and case-folded).
Load them with `node scripts/seed-calvern.mjs supabase/seed/legacy_words.txt`. Misspellings are corrected; non-English entries are rejected.

## Brief format
```
BRIEF — <topic> — <date>
THESIS:     what exists now
ANTITHESIS: what's wrong or in tension
SYNTHESIS:  the decision
NEXT:       single next action + owner
OPEN:       unresolved questions
```

---

## Briefs

### BRIEF — Calvern core pipeline — 2025-09-25
- **THESIS:** The home search built words from the free dictionary plus hard-coded prefix/suffix matching, and saved them to browser storage. `word_profiles` held 4 dictionary-only rows. The library and study tables that the code queries (`user_word_library`, `user_study_sessions`) did not exist. Calvern lived in Zapier and returned formatted text.
- **ANTITHESIS:** Formatted text can't be stored reliably and browser storage isn't shared, so the database drifted into disorder and never grew.
- **SYNTHESIS:** Calvern now lives inside the app as the `calvern-analyze` edge function with a strict schema, a validator, and an atomic save into `word_profiles`, `morphemes` and `word_morphemes`. Home search opens `/w/:word`, which shows the breakdown with Save to library.
- **NEXT:** Operator: apply migration `20250925000001_calvern_core.sql`, deploy `calvern-analyze`, set `AI_API_KEY`/`AI_MODEL`.
- **OPEN:** Final AI provider and model. Import of the legacy word list. Study (step 4) and chat (step 5) to be moved onto the new profile. Retire the Zapier path and duplicate services.

### BRIEF — Data home and model — 2025-09-25
- **THESIS:** Words live in several Airtable bases, the Supabase backup, and browser storage. There is no chosen AI provider.
- **ANTITHESIS:** Airtable is simple to browse but can't hold private per-user libraries safely, and the app would expose its key. Running a strong model on a phone is too slow and drains the battery.
- **SYNTHESIS:** Supabase stays the single source of truth. Airtable is a one-time import source (206 words). The AI is an open-weight model on Groq's free tier, called from the edge function.
- **NEXT:** Operator: grant GitHub push and Supabase access, create a Groq key. Claude: migrate, deploy, seed, verify in the live app.
- **OPEN:** Whether to keep the non-English entries (aseptique, indiciaire, biopharmaceutique) in a separate French track.

### BRIEF — Core loop live — 2025-09-25
- **THESIS:** Calvern runs in Supabase (Google Gemini free tier, fallback model on overload). `superfluous` generated and stored end to end. The home feed reads profiles from the database. Word queue seeded (190), 3 junk rows quarantined.
- **ANTITHESIS:** Photo search found nothing for long scenes. Definitions were a flat list with no link between senses and the core meaning. Regeneration needed a trigger.
- **SYNTHESIS:** Schema v2: sense inventory (up to 10, each tagged by relation to the core), semantic-change types, frequency and difficulty, photo keywords. Regeneration runs on view and every 15 minutes via GitHub Actions (`calvern-backfill.yml`).
- **NEXT:** Owner: add the `SUPABASE_SERVICE_ROLE_KEY` repository secret. Claude: verify the first backfill batches, then run the cleanup passes.
- **OPEN:** Remove the old enrichment functions and the 10 empty tables. Move the Calvern chat onto the pipeline (P3). Study loop (P4).

## Progress tracker
| Item | Status |
|---|---|
| Duplicates merged, core migration | ✅ |
| Calvern pipeline live (Gemini) | ✅ |
| P1 backend: queue, quarantine, popularity, images | ✅ |
| Home feed from database | ✅ |
| Schema v2 (senses, change types, frequency, difficulty, photo keywords) | ⏳ shipping |
| Backfill trigger (GitHub Action) | ⏳ waiting on repository secret |
| ~627 words regenerated | ⏳ 1 done |
| Cleanup passes (old services, functions, tables) | ⬜ |
| Calvern chat on the pipeline (P3) | ⬜ |
| Study / review loop (P4) | ⬜ |
