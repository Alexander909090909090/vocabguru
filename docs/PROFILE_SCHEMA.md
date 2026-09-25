# Word Profile Schema (v2)

Every word has exactly one profile, produced by Calvern and checked before it is stored.
Source of truth: `supabase/functions/_shared/calvern.ts`. Bump `CALVERN_SCHEMA_VERSION` when it changes;
older profiles are then regenerated automatically (when viewed, and by the backfill job).

## Core: what the word is

| Field | Meaning |
|---|---|
| `word` | The word (spelling corrected if within 2 letters) |
| `frequency` | common · uncommon · rare |
| `difficulty` | 1 (everyday) – 5 (specialist) |
| `morphemes[]` | Ordered parts: kind (prefix / root / suffix / combining form / infix), form, meaning, origin language, source form |
| `literal_meaning` | The parts combined ("flowing over, beyond") |
| `memory_hook` | One analogy tying parts to meaning |
| `definitions.primary` | The core meaning, one sentence |
| `definitions.senses[]` | Sense inventory, up to 10, most common first. Each: part of speech, definition, **relation to the core** (core, extended, metaphorical, metonymic, specialized, figurative, idiomatic, archaic), domain, register, example |
| `analysis.pronunciation` | IPA (UK, US), syllables |

## History: where the word came from

| Field | Meaning |
|---|---|
| `etymology.language_of_origin` · `first_attested` | Source language; earliest English use |
| `etymology.path[]` | Timeline, oldest first: period · language · form · meaning |
| `etymology.sense_history[]` | How the meaning changed: period · meaning · **type of change** (origin, broadening, narrowing, amelioration, pejoration, metaphor, metonymy, shift) |
| `etymology.historical_origins` · `word_evolution` · `cultural_variations` | Narrative |
| `etymology.related_words[]` | Words sharing a morpheme, and which one |
| `etymology.certainty` | established · probable · uncertain |

## Periphery: how the word lives

| Field | Meaning |
|---|---|
| `connotation` | Valence, register, the judgement it carries |
| `semantic_web[]` | Links: analogy, antithesis, broader, narrower, part_of, associated, each with a note |
| `word_forms[]` | Inflections and derivations, labelled |
| `analysis.parts_of_speech[]` | Each role, with an example |
| `analysis.contextual_usage[]` | Formal, figurative, idiomatic, technical use, with examples |
| `analysis.collocations` · `synonyms` · `antonyms` | Lists |
| `analysis.cultural_significance` | Literary or historical connections |
| `sound_symbolism` | Only genuine phonaesthemes (gl- in glow, glint) |
| `example` | One natural sentence |
| `image_scene` · `image_keywords` | A photographable scene and 2–4 search phrases for its picture |

## Rules
- Lists hold only what genuinely exists; empty sections are hidden, never filled with placeholders.
- A profile is rejected if it lacks morphemes, a root, a primary definition, at least one sense, a language of origin, an etymology path or an example.
