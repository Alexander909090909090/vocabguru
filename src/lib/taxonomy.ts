// VocabGuru color taxonomy: the single definition of how linguistic categories look.
// Every chip on the word page reads from here, and the legend renders from here, so colors never drift.

export interface TaxonomyEntry {
  label: string;
  hint: string;
  className: string; // chip classes: tinted background, readable text, matching border
}

export type TaxonomyGroup = Record<string, TaxonomyEntry>;


// Tailwind only ships classes it can see literally, so each chip string is spelled out below.
export const MORPHEME: TaxonomyGroup = {
  prefix: { label: "Prefix", hint: "Attached before the root", className: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  root: { label: "Root", hint: "The core carrying the meaning", className: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
  combining_form: { label: "Combining form", hint: "Greek/Latin building block (bio-, -graph)", className: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40" },
  infix: { label: "Infix", hint: "Inserted inside the root", className: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  suffix: { label: "Suffix", hint: "Attached after the root", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
};

export const PART_OF_SPEECH: TaxonomyGroup = {
  noun: { label: "Noun", hint: "Thing, person, idea", className: "bg-orange-500/15 text-orange-300 border-orange-500/40" },
  verb: { label: "Verb", hint: "Action or state", className: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
  adjective: { label: "Adjective", hint: "Describes a noun", className: "bg-yellow-500/15 text-yellow-200 border-yellow-500/40" },
  adverb: { label: "Adverb", hint: "Describes a verb, adjective or clause", className: "bg-lime-500/15 text-lime-300 border-lime-500/40" },
  other: { label: "Other", hint: "Pronoun, preposition, conjunction, interjection…", className: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
};

// Literal senses in blue tones, figurative in pink tones, historical in grey.
export const SENSE_RELATION: TaxonomyGroup = {
  core: { label: "Core", hint: "The central meaning", className: "bg-blue-500/20 text-blue-200 border-blue-400/50" },
  extended: { label: "Extended", hint: "Widened from the core", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40" },
  specialized: { label: "Specialized", hint: "A field-specific meaning", className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40" },
  metaphorical: { label: "Metaphorical", hint: "Meaning by resemblance", className: "bg-pink-500/15 text-pink-300 border-pink-500/40" },
  metonymic: { label: "Metonymic", hint: "Meaning by association or contiguity", className: "bg-purple-500/15 text-purple-300 border-purple-500/40" },
  figurative: { label: "Figurative", hint: "Non-literal use", className: "bg-rose-400/15 text-rose-200 border-rose-400/40" },
  idiomatic: { label: "Idiomatic", hint: "Only within a fixed phrase", className: "bg-red-500/15 text-red-300 border-red-500/40" },
  archaic: { label: "Archaic", hint: "No longer in common use", className: "bg-stone-500/15 text-stone-300 border-stone-500/40" },
};

export const SEMANTIC_RELATION: TaxonomyGroup = {
  analogy: { label: "Analogy", hint: "Works like", className: "bg-teal-500/15 text-teal-300 border-teal-500/40" },
  antithesis: { label: "Antithesis", hint: "Stands against", className: "bg-red-500/15 text-red-300 border-red-500/40" },
  broader: { label: "Broader", hint: "Category it belongs to", className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40" },
  narrower: { label: "Narrower", hint: "Kinds of it", className: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  part_of: { label: "Part of", hint: "Whole it belongs to", className: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  associated: { label: "Associated", hint: "Commonly evoked", className: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
};

export const SEMANTIC_CHANGE: TaxonomyGroup = {
  origin: { label: "Origin", hint: "Earliest recorded meaning", className: "bg-yellow-600/15 text-yellow-300 border-yellow-600/40" },
  broadening: { label: "Broadening", hint: "Meaning widened", className: "bg-green-500/15 text-green-300 border-green-500/40" },
  narrowing: { label: "Narrowing", hint: "Meaning narrowed", className: "bg-orange-500/15 text-orange-300 border-orange-500/40" },
  amelioration: { label: "Amelioration", hint: "Became more positive", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  pejoration: { label: "Pejoration", hint: "Became more negative", className: "bg-red-500/15 text-red-300 border-red-500/40" },
  metaphor: { label: "Metaphor", hint: "Shifted by resemblance", className: "bg-pink-500/15 text-pink-300 border-pink-500/40" },
  metonymy: { label: "Metonymy", hint: "Shifted by association", className: "bg-purple-500/15 text-purple-300 border-purple-500/40" },
  shift: { label: "Shift", hint: "Other change", className: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
};

// Register: how formal or specialised the language is.
export const REGISTER: TaxonomyGroup = {
  formal: { label: "Formal", hint: "Careful, official or academic language", className: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40" },
  literary: { label: "Literary", hint: "Found mainly in writing and literature", className: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
  technical: { label: "Technical", hint: "Specialist or scientific language", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40" },
  informal: { label: "Informal", hint: "Everyday conversation", className: "bg-orange-500/15 text-orange-300 border-orange-500/40" },
  colloquial: { label: "Colloquial", hint: "Casual spoken language", className: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  slang: { label: "Slang", hint: "Very informal, group-specific", className: "bg-red-500/15 text-red-300 border-red-500/40" },
  archaic: { label: "Archaic", hint: "Old-fashioned, rarely used now", className: "bg-stone-500/15 text-stone-300 border-stone-500/40" },
};

export const OUTLINE_CHIP = "border-border text-muted-foreground bg-transparent";

// Domains (politics, law, biology…) are open-ended, so each name gets a stable color from this palette:
// the same domain is always the same color on every page.
const DOMAIN_PALETTE = [
  "bg-teal-500/15 text-teal-300 border-teal-500/40",
  "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "bg-lime-500/15 text-lime-300 border-lime-500/40",
  "bg-pink-500/15 text-pink-300 border-pink-500/40",
  "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40",
  "bg-blue-500/15 text-blue-300 border-blue-500/40",
];

export function domainEntry(domain: string): TaxonomyEntry {
  const key = domain.toLowerCase().trim();
  const hash = [...key].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);
  return { label: domain, hint: "Field or subject area", className: DOMAIN_PALETTE[hash % DOMAIN_PALETTE.length] };
}

// Usage contexts reuse the register and sense-type colors when they name one ("formal", "figurative"…).
export function contextEntry(context: string): TaxonomyEntry {
  const words = context.toLowerCase().split(/[^a-z]+/);
  for (const w of words) {
    if (REGISTER[w]) return { ...REGISTER[w], label: context };
    if (SENSE_RELATION[w]) return { ...SENSE_RELATION[w], label: context };
  }
  return { ...domainEntry(context), hint: "Context of use" };
}

// Related words take the color of the morpheme they share, so word families read at a glance.
export function sharedMorphemeEntry(shared: string, morphemes: { kind: string; form: string }[]): TaxonomyEntry {
  const bare = shared.toLowerCase().replace(/^-+|-+$/g, "");
  const match = morphemes.find((m) => m.form.toLowerCase() === bare || bare.includes(m.form.toLowerCase()));
  return match ? entry(MORPHEME, match.kind) : { label: shared, hint: "", className: OUTLINE_CHIP };
}

export const LEGEND: { title: string; group: TaxonomyGroup }[] = [
  { title: "Morphemes", group: MORPHEME },
  { title: "Parts of speech", group: PART_OF_SPEECH },
  { title: "Sense types", group: SENSE_RELATION },
  { title: "Semantic web", group: SEMANTIC_RELATION },
  { title: "Meaning change", group: SEMANTIC_CHANGE },
  { title: "Register", group: REGISTER },
];

const POS_ALIASES: Record<string, string> = { n: "noun", v: "verb", adj: "adjective", adv: "adverb" };

export function partOfSpeechEntry(pos: string): TaxonomyEntry {
  const key = pos.toLowerCase().split(/[\s,(]/)[0];
  return PART_OF_SPEECH[POS_ALIASES[key] ?? key] ?? { ...PART_OF_SPEECH.other, label: pos };
}

export function registerEntry(register: string): TaxonomyEntry {
  return REGISTER[register.toLowerCase()] ?? { ...domainEntry(register), hint: "Register" };
}

export function entry(group: TaxonomyGroup, key: string): TaxonomyEntry {
  return group[key] ?? { label: key, hint: "", className: OUTLINE_CHIP };
}

