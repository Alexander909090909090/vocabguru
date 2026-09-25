# VocabGuru Architecture

Built top-down from one invariant. Each rule below either follows from the invariant or is removed.

## 1. Governing invariant

> **Every word has exactly one canonical, validated profile, built from shared morphemes.
> Every interaction either reads that profile or improves it. Nothing enters the system unvalidated.**

Before any change, check:
- **Canon.** Does it read from or write to the single profile, or does it create a second copy of the truth?
- **Propagation.** Is derived data produced in one place (the save function), or patched in by hand elsewhere?
- **Closure.** Does the flow end in a stored, validated state, or leave something open-ended?
- **Subtraction.** Can something be removed instead of added?

## 2. Ontology (what exists)

| Entity | Table | Role |
|---|---|---|
| **Word** | `word_profiles` | One row per word. `profile` (jsonb) is the canonical Calvern profile; every other column is derived. |
| **Morpheme** | `morphemes` | Canonical prefix/root/suffix, shared across all words. |
| **Composition** | `word_morphemes` | Ordered word → morpheme links. |
| **Relation** | `word_relations` *(P2)* | Word → word edges: synonym, antonym, related, derived form, shared morpheme. |
| **Candidate** | `word_queue` *(P2)* | Words discovered but not yet profiled. |
| **Learner state** | `user_word_library` | A user's saved words, mastery and next review date. |
| **Session** | `user_study_sessions` | Completed reviews and quizzes. |
| **Conversation** | `calvern_messages` *(P3)* | Calvern chat history per user. |

Top-down, a word decomposes into morphemes. Bottom-up, morphemes recombine into words. The two meet in `word_morphemes`: every word is explained by its parts, and every part links to every word that uses it.

## 3. Propagation rule (one writer)

`save_calvern_profile()` is the **only** writer of word data. In a single transaction it derives everything from the canonical profile:

```
profile (validated JSON)
  ├─> word_profiles legacy columns   (compatibility for existing screens)
  ├─> morphemes + word_morphemes     (composition)
  ├─> word_relations                 (P2: graph edges)
  └─> word_queue                     (P2: neighbours not yet profiled)
```

No page, service or script writes derived data directly. Changing the schema means changing `calvern.ts` plus this function, and the change reaches everything downstream.

## 4. Loops (every flow closes)

**1. Query loop.** Look up a word.
search / chat mention → profile exists and is current? → return it
                      → otherwise: ground → generate → validate → save → return
- *Update on query:* a profile is **stale** if `schema_version` < current, if it is legacy or dictionary-only, or if it has been flagged. A stale profile is shown immediately, then regenerated in the background (stale-while-revalidate). The first view of any old word upgrades it.

**2. Growth loop.** Keep adding words.
save → neighbours (related words, synonyms, antonyms, derived forms, words sharing a morpheme) → `word_queue`
scheduled worker → takes N per run → same query-loop pipeline → save → more neighbours
- Grows outward from words you actually use, so the repository stays curated rather than a whole-dictionary dump.
- Limited by a daily budget. Words that fail the dictionary check are rejected, never stored.

**3. Grounding.** Reduces hallucination.
Before generating, fetch dictionary evidence (the free Dictionary API or Wiktionary: definitions, phonetics, etymology text) and give it to Calvern. Keep the source reference. The dictionary serves as evidence only; the database remains our own curated store.

**4. Learning loop.**
save → `next_review_at` → review or quiz built from morphemes → result → mastery ± → next review date

**5. Quality loop.**
validation failure or 👎 → flag → regenerate → re-validate → save, or quarantine after N failures

**6. Conversation loop (Calvern chat).**
Calvern uses tools: `lookup_word` (query loop), `save_word` (library), `analyze_text` (sentence or paragraph).
- Word questions return the stored profile, never a separately generated breakdown.
- Sentence and paragraph analysis is conversational. Its words go to `word_queue` (growth loop).

## 5. Structural fixes (subtraction first)

| Remove / replace | Why |
|---|---|
| Zapier "Calvern 3.0" path, `calvern3Integration.ts` | A second, unvalidated brain |
| Naive prefix/suffix splitter (`lib/dictionaryApi.ts`) | Wrong breakdowns; replaced by Calvern |
| `WordsContext` localStorage and hard-coded `data/words.ts` | Shadows the database |
| Overlapping services (`wordProfileService`, `enhanced*`, `unified*`, `wordRepositoryService`, …) | One service: `calvernService` plus library |
| Enrichment edge functions (`ai-word-analysis`, `deep-linguistic-enrichment`, `ai-data-enhancer`, …) | Replaced by `calvern-analyze` |
| Wordnik / Hugging Face / Oxford keys and the Settings API tab | Replaced by grounding plus a single AI provider |
| Placeholder Settings tabs, admin tools shown to users | Open-ended surfaces |
| Unsplash images | Dead service; not part of the premise |
| Legacy jsonb columns | Derived-only now; dropped once every screen reads `profile` |

## 6. Phases

| Phase | Deliverable | Closes loop |
|---|---|---|
| **P0** | Deduplicate, migrate, connect Lovable AI, smoke test | Query (new words) |
| **P1** | All word screens read `profile`; update-on-query; regenerate or quarantine the existing ~440 words | Query (all words), Quality |
| **P2** | `word_relations`, `word_queue`, grounding, scheduled worker | Growth, Grounding |
| **P3** | Calvern chat on the same brain, with tools | Conversation |
| **P4** | Library-based spaced review; morpheme quizzes | Learning |
| **P5** | Subtraction sweep (section 5) | — |

A phase is done only when its loop runs end to end in the live app.
