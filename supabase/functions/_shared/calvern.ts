// Calvern word-profile schema: the single definition of how a word is broken down.
// Pure TypeScript (no Deno/Node APIs) so both the edge function and the React app import it.

export const CALVERN_SCHEMA_VERSION = 2;

export const SEMANTIC_RELATIONS = ["analogy", "antithesis", "broader", "narrower", "part_of", "associated"] as const;
// How each sense relates to the core meaning (lexical semantics).
export const SENSE_RELATIONS = [
  "core", "extended", "metaphorical", "metonymic", "specialized", "figurative", "idiomatic", "archaic",
] as const;
export type SenseRelation = (typeof SENSE_RELATIONS)[number];
// Types of semantic change across the word's history.
export const SEMANTIC_CHANGES = [
  "origin", "broadening", "narrowing", "amelioration", "pejoration", "metaphor", "metonymy", "shift",
] as const;
export type SemanticChange = (typeof SEMANTIC_CHANGES)[number];
const FREQUENCIES = ["common", "uncommon", "rare"] as const;
export type SemanticRelation = (typeof SEMANTIC_RELATIONS)[number];
const VALENCES = ["positive", "neutral", "negative", "mixed"] as const;

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
  frequency: (typeof FREQUENCIES)[number];
  difficulty: number;              // 1 (everyday) – 5 (specialist)
  morphemes: CalvernMorpheme[];   // in order of appearance in the word
  literal_meaning: string;         // meaning assembled from the morphemes
  memory_hook: string;             // analogy that ties the parts to the meaning
  image_scene: string;             // concrete visual scene of the word in use
  image_keywords: string[];        // 2–4 short photo-search phrases drawn from the scene, e.g. "reading glasses"
  connotation: { valence: (typeof VALENCES)[number]; register: string; note: string };
  semantic_web: { relation: SemanticRelation; term: string; note: string }[];
  sound_symbolism: string;         // only genuine phonaesthemes (e.g. "gl-" in glow, glint); "" if none
  etymology: {
    language_of_origin: string;
    first_attested: string;         // earliest recorded English use, e.g. "late 14th century"
    historical_origins: string;
    word_evolution: string;
    cultural_variations: string;   // regional / cultural differences in use; "" if none
    path: { period: string; language: string; form: string; gloss: string }[]; // oldest → modern
    sense_history: { period: string; sense: string; change: SemanticChange }[]; // how the meaning shifted
    related_words: { word: string; shared_morpheme: string }[];
    certainty: "established" | "probable" | "uncertain";
  };
  definitions: {
    primary: string;
    senses: {
      part_of_speech: string;
      definition: string;
      relation: SenseRelation;     // how this sense relates to the core meaning
      domain: string;              // "general", "law", "medicine", "music"…
      register: string;            // "neutral", "formal", "informal", "literary", "slang"…
      example: string;
    }[];
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
  // Computed by code, never by the model.
  quality: ProfileQuality;
}

export interface ProfileQuality {
  depth: number; // 0–100
  layers: { morphology: number; senses: number; history: number; web: number; usage: number; sound: number };
  fingerprint: string; // SHA-256 of the profile content, set when stored
}

// Minimum depth a profile must reach; below it the pipeline regenerates (up to its attempt limit).
export const MIN_DEPTH = 70;

const ratio = (n: number, target: number) => Math.min(n / target, 1);

// Depth Score: measures completeness against the schema's targets, layer by layer.
export function scoreDepth(p: Omit<CalvernProfile, "quality">): Omit<ProfileQuality, "fingerprint"> {
  const ms = p.morphemes;
  const morphology =
    (ms.length ? ms.filter((m) => m.meaning && m.origin_language && m.source_form).length / ms.length : 0) * 20 +
    (p.literal_meaning ? 5 : 0);

  // Rare specialist words honestly have few senses; they are not penalised for it.
  const senseTarget = p.frequency === "rare" && p.difficulty >= 4 ? 2 : 5;
  const senses = p.definitions.senses;
  const relationKinds = new Set(senses.map((x) => x.relation)).size;
  const sensesScore = ratio(senses.length, senseTarget) * 14 + (relationKinds >= 2 || senseTarget === 2 ? 6 : 0);

  const e = p.etymology;
  const history = ratio(e.path.length, 3) * 8 + ratio(e.sense_history.length, 2) * 8 + (e.first_attested ? 4 : 0);

  const web = ratio(p.semantic_web.length, 5) * 9 + ratio(e.related_words.length, 3) * 6;

  const a = p.analysis;
  const exampled = senses.length ? senses.filter((x) => x.example).length / senses.length : 0;
  const usage =
    ratio(a.contextual_usage.length, 3) * 4 + ratio(a.collocations.length, 3) * 4 +
    ratio(p.word_forms.length, 2) * 3 + exampled * 4;

  const sound = (a.pronunciation.ipa.length ? 3 : 0) + (a.pronunciation.syllables ? 2 : 0);

  const layers = {
    morphology: Math.round(morphology),
    senses: Math.round(sensesScore),
    history: Math.round(history),
    web: Math.round(web),
    usage: Math.round(usage),
    sound,
  };
  return { depth: Object.values(layers).reduce((x, y) => x + y, 0), layers };
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
  frequency: { type: "string", enum: [...FREQUENCIES] },
  difficulty: { type: "integer", enum: [1, 2, 3, 4, 5] },
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
  image_scene: str,
  image_keywords: strList,
  connotation: obj({ valence: { type: "string", enum: [...VALENCES] }, register: str, note: str }),
  semantic_web: {
    type: "array",
    items: obj({ relation: { type: "string", enum: [...SEMANTIC_RELATIONS] }, term: str, note: str }),
  },
  sound_symbolism: str,
  etymology: obj({
    language_of_origin: str,
    first_attested: str,
    historical_origins: str,
    word_evolution: str,
    cultural_variations: str,
    path: { type: "array", items: obj({ period: str, language: str, form: str, gloss: str }) },
    sense_history: {
      type: "array",
      items: obj({ period: str, sense: str, change: { type: "string", enum: [...SEMANTIC_CHANGES] } }),
    },
    related_words: { type: "array", items: obj({ word: str, shared_morpheme: str }) },
    certainty: { type: "string", enum: ["established", "probable", "uncertain"] },
  }),
  definitions: obj({
    primary: str,
    senses: {
      type: "array",
      items: obj({
        part_of_speech: str,
        definition: str,
        relation: { type: "string", enum: [...SENSE_RELATIONS] },
        domain: str,
        register: str,
        example: str,
      }),
    },
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
- image_scene: one concrete, photographable scene that someone would describe with this word, inferred from its
  meaning (quotidian → "a kettle heating in a quiet kitchen on an ordinary morning"). No text in the scene.
- image_keywords: 2–4 short, concrete photo-search phrases of one or two words taken from the scene, most
  representative first (quotidian → "kettle", "morning kitchen", "commute").
- connotation: valence, register (formal, neutral, informal, literary, technical, slang) and the value or
  judgement the word carries.
- semantic_web: 4–10 edges to other words or ideas: analogy (works like), antithesis (opposes), broader
  (category it belongs to), narrower (kinds of it), part_of (whole it belongs to), associated (commonly
  evoked). Each with a short note.
- sound_symbolism: only if the word contains an established phonaestheme; otherwise "". Never invent
  meanings for individual letters.
- etymology.path: every stage the word passed through, oldest first, ending with modern English. Each stage has
  a period (century or era, e.g. "Classical Latin", "c. 1300"), the language (be specific: "Old French",
  "Yoruba", "Proto-Indo-European"), the form in that language and its gloss. Include borrowings through
  intermediate languages. first_attested is the earliest recorded English use.
- etymology.sense_history: how the meaning shifted, oldest first, each with a period and the type of change
  (origin, broadening, narrowing, amelioration, pejoration, metaphor, metonymy, shift).
- etymology.certainty: "established" when dictionaries agree, "probable" or "uncertain" otherwise.
  cultural_variations only if real.
- related_words: real English words that share a morpheme with this word, naming the shared morpheme.
- frequency: how common the word is in modern English. difficulty: 1 (everyday) to 5 (specialist).
- definitions.primary: the core meaning in one sentence.
- definitions.senses: the word's sense inventory, up to 10, most common first. Cover the core sense and its
  extensions: metaphorical, metonymic, specialized (field-specific), figurative and idiomatic uses, and
  notable archaic senses. Aim for 5 or more when the word genuinely supports them; never invent senses.
  Each sense has its part of speech, a precise definition, its relation to the core meaning, its domain
  ("general" if none), register ("neutral" if none) and a natural example sentence.
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

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function oneOf<T extends string>(allowed: readonly T[], v: unknown, fallback: T): T {
  const s = clean(v).toLowerCase() as T;
  return allowed.includes(s) ? s : fallback;
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

const CERTAINTY = ["established", "probable", "uncertain"] as const;
type Certainty = (typeof CERTAINTY)[number];

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

  const rawSenses = at(defs, "senses");
  const senses = (Array.isArray(rawSenses) ? rawSenses : [])
    .map((x) => ({
      part_of_speech: clean(at(x, "part_of_speech")),
      definition: clean(at(x, "definition")),
      relation: oneOf(SENSE_RELATIONS, at(x, "relation"), "extended"),
      domain: clean(at(x, "domain")) || "general",
      register: clean(at(x, "register")) || "neutral",
      example: clean(at(x, "example")),
    }))
    .filter((x, i, all) => x.definition && all.findIndex((y) => y.definition.toLowerCase() === x.definition.toLowerCase()) === i)
    .slice(0, 10);

  const rawDifficulty = Number(at(raw, "difficulty"));

  const profile: CalvernProfile = {
    word,
    is_real_word: true,
    frequency: oneOf(FREQUENCIES, at(raw, "frequency"), "uncommon"),
    difficulty: Number.isInteger(rawDifficulty) ? Math.min(Math.max(rawDifficulty, 1), 5) : 3,
    morphemes,
    literal_meaning: clean(at(raw, "literal_meaning")),
    memory_hook: clean(at(raw, "memory_hook")),
    image_scene: clean(at(raw, "image_scene")),
    image_keywords: cleanList(at(raw, "image_keywords"), 4),
    connotation: {
      valence: VALENCES.includes(clean(at(at(raw, "connotation"), "valence")) as (typeof VALENCES)[number])
        ? (clean(at(at(raw, "connotation"), "valence")) as (typeof VALENCES)[number])
        : "neutral",
      register: clean(at(at(raw, "connotation"), "register")),
      note: clean(at(at(raw, "connotation"), "note")),
    },
    semantic_web: cleanObjects<{ relation: SemanticRelation; term: string; note: string }>(
      at(raw, "semantic_web"),
      ["relation", "term", "note"],
      10,
    ).filter((e) => SEMANTIC_RELATIONS.includes(e.relation)),
    sound_symbolism: clean(at(raw, "sound_symbolism")),
    etymology: {
      language_of_origin: clean(at(ety, "language_of_origin")),
      first_attested: clean(at(ety, "first_attested")),
      historical_origins: clean(at(ety, "historical_origins")),
      word_evolution: clean(at(ety, "word_evolution")),
      cultural_variations: clean(at(ety, "cultural_variations")),
      path: cleanObjects(at(ety, "path"), ["period", "language", "form", "gloss"], 10),
      sense_history: asArray(at(ety, "sense_history"))
        .map((x) => ({
          period: clean(at(x, "period")),
          sense: clean(at(x, "sense")),
          change: oneOf(SEMANTIC_CHANGES, at(x, "change"), "shift"),
        }))
        .filter((h) => h.period && h.sense)
        .slice(0, 8),
      related_words: cleanObjects(at(ety, "related_words"), ["word", "shared_morpheme"], 10),
      certainty: CERTAINTY.includes(clean(at(ety, "certainty")) as Certainty)
        ? (clean(at(ety, "certainty")) as Certainty)
        : "uncertain",
    },
    definitions: {
      primary: clean(at(defs, "primary")),
      senses,
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
    quality: { depth: 0, layers: { morphology: 0, senses: 0, history: 0, web: 0, usage: 0, sound: 0 }, fingerprint: "" },
  };

  profile.quality = { ...scoreDepth(profile), fingerprint: "" };

  const errors: string[] = [];
  if (answered !== word) errors.push(`model answered for "${answered}"`);
  if (morphemes.length === 0) errors.push("no morphemes");
  if (morphemes.some((m) => !MORPHEME_KINDS.includes(m.kind))) errors.push("unknown morpheme kind");
  if (!morphemes.some((m) => m.kind === "root" || m.kind === "combining_form")) errors.push("no root");
  if (!profile.definitions.primary) errors.push("no primary definition");
  if (profile.definitions.senses.length === 0) errors.push("no senses");
  if (!profile.etymology.language_of_origin) errors.push("no language of origin");
  if (profile.etymology.path.length === 0) errors.push("no etymology path");
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
      standard: p.definitions.senses.filter((x) => x.domain === "general").map((x) => x.definition),
      contextual: p.definitions.senses.filter((x) => x.domain !== "general").map((x) => `${x.domain}: ${x.definition}`),
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

