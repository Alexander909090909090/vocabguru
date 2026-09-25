// Calvern word-profile schema: the single definition of how a word is broken down.
// Pure TypeScript (no Deno/Node APIs) so both the edge function and the React app import it.

export const CALVERN_SCHEMA_VERSION = 1;

export const MORPHEME_KINDS = ["prefix", "root", "suffix", "combining_form", "infix"] as const;
export type MorphemeKind = (typeof MORPHEME_KINDS)[number];

export interface CalvernMorpheme {
  kind: MorphemeKind;
  form: string;            // bare form, no hyphens: "super", "flu", "ous"
  meaning: string;         // what it means inside this word
  origin_language: string; // "Latin", "Greek", "Old English"…
  source_form: string;     // form in the source language: "super", "fluere", "-ōsus"
}

export interface CalvernProfile {
  word: string;
  is_real_word: boolean;
  morphemes: CalvernMorpheme[];   // in order of appearance in the word
  literal_meaning: string;         // meaning assembled from the morphemes
  memory_hook: string;             // analogy that ties the parts to the meaning
  etymology: {
    language_of_origin: string;
    historical_origins: string;
    word_evolution: string;
    cultural_variations: string;   // regional / cultural differences in use; "" if none
    path: { language: string; form: string; gloss: string }[]; // oldest → modern
    related_words: { word: string; shared_morpheme: string }[];
  };
  definitions: {
    primary: string;
    standard: string[];
    specialized: { domain: string; text: string }[];
  };
  word_forms: { part_of_speech: string; form: string }[];
  word_forms_note: string;
  analysis: {
    parts_of_speech: { part_of_speech: string; example: string }[];
    collocations: string[];
    synonyms: string[];
    antonyms: string[];
    contextual_usage: { context: string; example: string }[]; // registers, figurative use, idioms
    cultural_significance: string;                           // "" if none
    pronunciation: { ipa: string[]; syllables: string };
  };
  example: string;
}

// ---------------------------------------------------------------------------
// JSON Schema handed to the model (OpenAI-compatible structured output).

const str = { type: "string" } as const;
const strList = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});

export const CALVERN_JSON_SCHEMA = obj({
  word: str,
  is_real_word: { type: "boolean" },
  morphemes: {
    type: "array",
    items: obj({
      kind: { type: "string", enum: [...MORPHEME_KINDS] },
      form: str,
      meaning: str,
      origin_language: str,
      source_form: str,
    }),
  },
  literal_meaning: str,
  memory_hook: str,
  etymology: obj({
    language_of_origin: str,
    historical_origins: str,
    word_evolution: str,
    cultural_variations: str,
    path: { type: "array", items: obj({ language: str, form: str, gloss: str }) },
    related_words: { type: "array", items: obj({ word: str, shared_morpheme: str }) },
  }),
  definitions: obj({
    primary: str,
    standard: strList,
    specialized: { type: "array", items: obj({ domain: str, text: str }) },
  }),
  word_forms: { type: "array", items: obj({ part_of_speech: str, form: str }) },
  word_forms_note: str,
  analysis: obj({
    parts_of_speech: { type: "array", items: obj({ part_of_speech: str, example: str }) },
    collocations: strList,
    synonyms: strList,
    antonyms: strList,
    contextual_usage: { type: "array", items: obj({ context: str, example: str }) },
    cultural_significance: str,
    pronunciation: obj({ ipa: strList, syllables: str }),
  }),
  example: str,
});

// Persona shared by every Calvern surface (breakdown + chat). See docs/CALVERN_DIRECTIVE.md.
export const CALVERN_PERSONA = `You are Calvern, a linguistic guide created by Alexander for the VocabGuru app.
You teach people to understand any English word from its smallest meaningful parts: prefix, root and suffix,
their origins, and how they combine into the modern meaning. You speak with precision and an elevated but clear
vernacular, adapt to the learner's level, and prefer accuracy to expansiveness: when evidence is uncertain,
you say so rather than invent.`;

export const CALVERN_SYSTEM_PROMPT = `${CALVERN_PERSONA}

Task: produce the word profile for the given word, following the JSON schema exactly.

Rules:
- morphemes: every meaningful unit, in order. Use "root" for each base (a word may have several roots),
  "combining_form" for Greek/Latin forms like "bio", "graph", "logy". Write "form" bare, without hyphens,
  as it appears in the word (e.g. "flu" in "superfluous"). "source_form" is the form in the source language
  (e.g. "fluere", "-ōsus"). Do not invent morphemes: a word with no internal structure has one root.
- literal_meaning: combine the morpheme meanings into one phrase ("flowing over, beyond").
- memory_hook: one sentence of analogy or imagery linking the parts to the modern meaning.
- etymology.path: oldest form first, ending with the modern English word. cultural_variations only if real.
- related_words: real English words that share a morpheme with this word, naming the shared morpheme.
- definitions: primary is one sentence. standard lists the distinct senses, most common first, as many as
  genuinely exist (never pad). specialized is for field-specific senses (law, medicine, grammar…).
- word_forms: only forms that exist, each labelled precisely ("plural", "past tense", "past participle",
  "present participle", "comparative", "superlative", "adverb", "noun"…). Caveats go in word_forms_note.
- analysis.parts_of_speech: each role the word plays, with an example sentence.
- analysis.contextual_usage: 2–4 contexts (formal, casual, figurative, idiomatic, technical) with examples.
- analysis.cultural_significance: notable literary, historical or cultural connections, or "".
- pronunciation.ipa: UK then US if they differ. syllables uses hyphens ("su-per-flu-ous").
- Every example sentence must use the word naturally.
- If the input is a misspelling of a real word, analyse the intended word and set "word" to it.
- If the input is not a real English word, set is_real_word to false and leave other fields empty.`;

// ---------------------------------------------------------------------------
// Normalisation + validation. Everything the model returns passes through here
// before it is stored, so the database only ever holds clean, consistent rows.

const WORD_PATTERN = /^[a-z][a-z'\- ]{0,44}$/;

export function normalizeWord(input: string): string | null {
  const word = input.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
  return WORD_PATTERN.test(word) ? word : null;
}

const clean = (v: unknown): string => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

function cleanList(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = clean(item);
    const key = s.toLowerCase();
    if (s && !seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out.slice(0, max);
}

// Safe property access on untrusted model output.
const at = (v: unknown, key: string): unknown =>
  v !== null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined;

function cleanObjects<T extends Record<string, string>>(v: unknown, keys: (keyof T & string)[], max = 12): T[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of v) {
    const row = Object.fromEntries(keys.map((k) => [k, clean(at(item, k))])) as T;
    const key = keys.map((k) => row[k].toLowerCase()).join("|");
    if (keys.every((k) => row[k]) && !seen.has(key)) {
      seen.add(key);
      out.push(row);
    }
  }
  return out.slice(0, max);
}

// Edit distance, used to accept Calvern's spelling corrections ("recieve" → "receive") but nothing further.
export function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

const MAX_CORRECTION_DISTANCE = 2;

export type ValidationResult =
  | { ok: true; profile: CalvernProfile }
  | { ok: false; reason: "not_a_word" | "invalid"; errors: string[] };

export function validateProfile(raw: unknown, requestedWord: string): ValidationResult {
  if (at(raw, "is_real_word") === false) return { ok: false, reason: "not_a_word", errors: [] };

  const answered = normalizeWord(clean(at(raw, "word"))) ?? "";
  const word = answered && editDistance(answered, requestedWord) <= MAX_CORRECTION_DISTANCE ? answered : requestedWord;

  const rawMorphemes = at(raw, "morphemes");
  const morphemes: CalvernMorpheme[] = (Array.isArray(rawMorphemes) ? rawMorphemes : [])
    .map((m) => ({
      kind: clean(at(m, "kind")).toLowerCase() as MorphemeKind,
      form: clean(at(m, "form")).toLowerCase().replace(/^-+|-+$/g, ""),
      meaning: clean(at(m, "meaning")),
      origin_language: clean(at(m, "origin_language")),
      source_form: clean(at(m, "source_form")),
    }))
    .filter((m) => m.form && m.meaning);

  const ety = at(raw, "etymology");
  const defs = at(raw, "definitions");
  const ana = at(raw, "analysis");
  const pron = at(ana, "pronunciation");

  const profile: CalvernProfile = {
    word,
    is_real_word: true,
    morphemes,
    literal_meaning: clean(at(raw, "literal_meaning")),
    memory_hook: clean(at(raw, "memory_hook")),
    etymology: {
      language_of_origin: clean(at(ety, "language_of_origin")),
      historical_origins: clean(at(ety, "historical_origins")),
      word_evolution: clean(at(ety, "word_evolution")),
      cultural_variations: clean(at(ety, "cultural_variations")),
      path: cleanObjects(at(ety, "path"), ["language", "form", "gloss"], 8),
      related_words: cleanObjects(at(ety, "related_words"), ["word", "shared_morpheme"], 10),
    },
    definitions: {
      primary: clean(at(defs, "primary")),
      standard: cleanList(at(defs, "standard"), 8),
      specialized: cleanObjects(at(defs, "specialized"), ["domain", "text"], 5),
    },
    word_forms: cleanObjects(at(raw, "word_forms"), ["part_of_speech", "form"], 12),
    word_forms_note: clean(at(raw, "word_forms_note")),
    analysis: {
      parts_of_speech: cleanObjects(at(ana, "parts_of_speech"), ["part_of_speech", "example"], 6),
      collocations: cleanList(at(ana, "collocations"), 10),
      synonyms: cleanList(at(ana, "synonyms"), 10),
      antonyms: cleanList(at(ana, "antonyms"), 10),
      contextual_usage: cleanObjects(at(ana, "contextual_usage"), ["context", "example"], 6),
      cultural_significance: clean(at(ana, "cultural_significance")),
      pronunciation: {
        ipa: cleanList(at(pron, "ipa"), 3),
        syllables: clean(at(pron, "syllables")),
      },
    },
    example: clean(at(raw, "example")),
  };

  const errors: string[] = [];
  if (answered !== word) errors.push(`model answered for "${answered}"`);
  if (morphemes.length === 0) errors.push("no morphemes");
  if (morphemes.some((m) => !MORPHEME_KINDS.includes(m.kind))) errors.push("unknown morpheme kind");
  if (!morphemes.some((m) => m.kind === "root" || m.kind === "combining_form")) errors.push("no root");
  if (!profile.definitions.primary) errors.push("no primary definition");
  if (!profile.etymology.language_of_origin) errors.push("no language of origin");
  if (!profile.example) errors.push("no example");

  return errors.length ? { ok: false, reason: "invalid", errors } : { ok: true, profile };
}

// ---------------------------------------------------------------------------
// Legacy column projection, so screens that read the old jsonb columns keep working.

export function toLegacyColumns(p: CalvernProfile) {
  const join = (kind: MorphemeKind[]) => {
    const parts = p.morphemes.filter((m) => kind.includes(m.kind));
    return parts.length
      ? { text: parts.map((m) => m.form).join(" + "), meaning: parts.map((m) => m.meaning).join("; ") }
      : undefined;
  };
  const posList = p.analysis.parts_of_speech.map((x) => x.part_of_speech);

  return {
    morpheme_breakdown: {
      prefix: join(["prefix"]),
      root: join(["root", "combining_form", "infix"]),
      suffix: join(["suffix"]),
      phonetic: p.analysis.pronunciation.ipa[0],
    },
    etymology: {
      historical_origins: p.etymology.historical_origins,
      language_of_origin: p.etymology.language_of_origin,
      word_evolution: p.etymology.word_evolution,
      cultural_variations: p.etymology.cultural_variations,
    },
    definitions: {
      primary: p.definitions.primary,
      standard: p.definitions.standard,
      contextual: p.definitions.specialized.map((s) => `${s.domain}: ${s.text}`),
    },
    word_forms: {
      base_form: p.word,
      other_inflections: p.word_forms.map((f) => `${f.part_of_speech}: ${f.form}`),
    },
    analysis: {
      parts_of_speech: posList.join(", "),
      collocations: p.analysis.collocations,
      synonyms: p.analysis.synonyms,
      antonyms: p.analysis.antonyms,
      example_sentence: p.example,
      usage_examples: p.analysis.parts_of_speech.map((x) => x.example),
    },
  };
}
