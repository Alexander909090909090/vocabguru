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
