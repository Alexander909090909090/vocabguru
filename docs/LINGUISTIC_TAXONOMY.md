# Linguistic Taxonomy

The reference model for how VocabGuru classifies language, and how each class looks on screen.
Colors live in `src/lib/taxonomy.ts`; this document is the reasoning behind them.
Column **App** marks what profiles capture today (✅), what is planned (◐), and what is deliberately left out (—).

Principle: **color = category you scan for; badge = sub-type you read.** A new sub-type never gets a new
color when a badge on its parent color says the same thing. This keeps the palette small enough to learn.

## 1. Morphology: the parts of a word

| Class | Definition | Example | Color | App |
|---|---|---|---|---|
| Prefix | Bound morpheme before the base | **un**-, **super**- | sky | ✅ |
| Root | Core carrying the lexical meaning | **flu** (flow), **vol** (will) | violet | ✅ |
| Combining form | Greek/Latin element that combines like a root | **bio**-, -**cracy**, -**logy** | fuchsia | ✅ |
| Infix | Morpheme inserted inside the base | abso-**bloody**-lutely | amber | ✅ |
| Suffix | Bound morpheme after the base | -**ous**, -**ness** | emerald | ✅ |
| Circumfix | Parts on both sides (rare in English) | **en**light**en** | amber | — |

**Sub-types (badges, not new colors):**

| Sub-type | Applies to | Meaning | App |
|---|---|---|---|
| Free / bound | roots | Can it stand alone? (*act* free; *vol* bound) | ◐ |
| Derivational | affixes | Makes a new word, often a new part of speech (-ness, -ize) | ◐ |
| Inflectional | suffixes | Marks grammar only: plural, tense, comparison (-s, -ed, -er) | ◐ |
| Class-changing | derivational affixes | Changes part of speech (adjective → noun: kind → kind**ness**) | ◐ |
| Allomorph | any | Variant forms of one morpheme: *vol / volit / volunt*; *in- / im- / il- / ir-* | ◐ |

## 2. Word formation: how the word was made

| Process | Example | App |
|---|---|---|
| Derivation (affixation) | happy → unhappiness | ◐ |
| Compounding | blackboard, well-being | ◐ |
| Conversion (zero derivation) | a *run* → to *run* | ◐ |
| Blending | brunch, smog | ◐ |
| Clipping | advertisement → ad | ◐ |
| Back-formation | editor → edit | ◐ |
| Acronym / initialism | laser, NATO | ◐ |
| Borrowing (loanword) | ballet (French), tsunami (Japanese) | ✅ via etymology path |
| Calque (loan translation) | *skyscraper* → German *Wolkenkratzer* | ◐ |
| Eponym | sandwich, boycott | ◐ |
| Onomatopoeia | buzz, sizzle | ◐ |

## 3. Parts of speech

| Class | Color | App |
|---|---|---|
| Noun | orange | ✅ |
| Verb | rose | ✅ |
| Adjective | yellow | ✅ |
| Adverb | lime | ✅ |
| Pronoun, preposition, conjunction, determiner, interjection | slate (label shows which) | ✅ |

## 4. Senses: how each meaning relates to the core

| Type | Definition | Color family | App |
|---|---|---|---|
| Core | Central meaning | blue | ✅ |
| Extended | Widened from the core | cyan | ✅ |
| Specialized | Field-specific | indigo | ✅ |
| Metaphorical | By resemblance | pink | ✅ |
| Metonymic | By association or contiguity (*the Crown* = monarchy) | purple | ✅ |
| Figurative | Other non-literal | rose | ✅ |
| Idiomatic | Only inside a fixed phrase | red | ✅ |
| Archaic | No longer common | stone | ✅ |

Literal senses are blues and figurative senses are pinks, so the split reads at a glance.

## 5. Lexical relations: how words relate to other words

| Relation | Definition | Example | Color | App |
|---|---|---|---|---|
| Synonymy | Same or near meaning | big / large | list | ✅ |
| Antonymy: gradable | Opposites on a scale | hot / cold | list | ◐ badge |
| Antonymy: complementary | Either/or | alive / dead | list | ◐ badge |
| Antonymy: converse | Reversed roles | buy / sell | list | ◐ badge |
| Hypernymy (broader) | Category above | *colour* for red | indigo | ✅ |
| Hyponymy (narrower) | Kinds below | *scarlet* for red | sky | ✅ |
| Meronymy (part of) | Part–whole | wheel / car | amber | ✅ |
| Analogy | Works like | | teal | ✅ |
| Antithesis | Stands against | | red | ✅ |
| Association | Commonly evoked | | lime | ✅ |
| Troponymy | Manner of a verb | whisper → speak | — | — |

**Related words (word family)** carry the color of the morpheme they share. Planned: a relation badge on each:
*derived* (same root, new word: voluntary), *inflected* (volitions), *compound*, *cognate* (other language:
French *volonté*), *doublet* (same source, different path: *fragile / frail*).

## 6. Semantic change: how meaning moved over time

| Type | Definition | Example | Color | App |
|---|---|---|---|---|
| Origin | Earliest recorded meaning | | gold | ✅ |
| Broadening | Meaning widened | *holiday* (holy day → any break) | green | ✅ |
| Narrowing | Meaning narrowed | *meat* (any food → flesh) | orange | ✅ |
| Amelioration | Became more positive | *nice* (foolish → pleasant) | emerald | ✅ |
| Pejoration | Became more negative | *silly* (blessed → foolish) | red | ✅ |
| Metaphor | Shift by resemblance | *grasp* an idea | pink | ✅ |
| Metonymy | Shift by association | *board* (table → committee) | purple | ✅ |
| Shift | Other change | | blue | ✅ |

## 7. Register and domain

| Register | Color | Domain (subject area) |
|---|---|---|
| Formal · literary · technical | indigo · violet · cyan | Each subject (politics, law, biology…) keeps one stable color from a fixed palette. |
| Informal · colloquial · slang | orange · amber · red | |
| Archaic | stone | |

## 8. Sound

| Element | App |
|---|---|
| IPA, UK and US | ✅ |
| Syllables | ✅ |
| Stress pattern | ◐ |
| Phonaesthemes (gl- in glow, glint) | ✅ only when genuine |

## Roadmap (mapped from recommendations)

| # | Addition | Schema change | UI | Cost |
|---|---|---|---|---|
| 1 | **Morpheme pages**: every word sharing a prefix, root or suffix | none (data exists in `word_morphemes`) | new page `/m/:form` | small |
| 2 | **Morpheme sub-types + allomorphs** | `morphemes[].subtype`, `allomorphs[]` | badge on each morpheme card | small |
| 3 | **Word-formation process** | `formation` (one of section 2) | one chip in the header | tiny |
| 4 | **Related-word relation** (derived, inflected, compound, cognate, doublet) | `related_words[].relation` | badge | tiny |
| 5 | **Cognates across languages** | `cognates[]` {language, form, meaning} | etymology sub-section | small |
| 6 | **Cited first use** | `first_citation` {quote, source, year, certainty} | etymology line | small |

Items 2–6 are schema v3: one bump, one regeneration, all words upgraded together.

