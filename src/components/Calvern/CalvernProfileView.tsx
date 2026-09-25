import type { ReactNode } from "react";
import type { CalvernProfile, CalvernMorpheme } from "@/services/calvernService";
import {
  MORPHEME,
  SEMANTIC_CHANGE,
  SEMANTIC_RELATION,
  SENSE_RELATION,
  contextEntry,
  domainEntry,
  entry,
  partOfSpeechEntry,
  registerEntry,
  sharedMorphemeEntry,
} from "@/lib/taxonomy";
import { TaxonomyChip } from "./TaxonomyChip";
import { TaxonomyLegend } from "./TaxonomyLegend";

const hyphenate = (m: CalvernMorpheme) =>
  m.kind === "prefix" ? `${m.form}-` : m.kind === "suffix" ? `-${m.form}` : m.form;

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="glass-card space-y-3 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <p className="leading-relaxed">
      <span className="font-semibold">{label}: </span>
      {children}
    </p>
  );
}

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 border-t border-border/50 pt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

const list = (items: string[]) => (items.length ? items.join(", ") : null);

function DepthMeter({ profile }: { profile: CalvernProfile }) {
  const q = profile.quality;
  if (!q) return null;
  const tone = q.depth >= 85 ? "text-emerald-300" : q.depth >= 70 ? "text-sky-300" : "text-amber-300";
  const layers = Object.entries(q.layers).map(([k, v]) => `${k} ${v}`).join(" · ");
  return (
    <span title={layers} className={`text-xs font-semibold ${tone}`}>
      Depth {q.depth}/100
    </span>
  );
}

// Layout follows the Calvern directive: morphemes → etymology → definitions → forms → analysis → example.
export function CalvernProfileView({ profile }: { profile: CalvernProfile }) {
  const { etymology, definitions, analysis } = profile;

  return (
    <div className="space-y-5">
      <TaxonomyLegend />

      <Section title="Morpheme Breakdown" aside={<DepthMeter profile={profile} />}>
        <div className="flex flex-wrap items-stretch gap-2">
          {profile.morphemes.map((m, i) => (
            <div key={i} className={`min-w-[7rem] rounded-xl border px-4 py-3 ${entry(MORPHEME, m.kind).className}`}>
              <div className="text-xs uppercase tracking-wide opacity-80">{entry(MORPHEME, m.kind).label}</div>
              <div className="text-xl font-bold">{hyphenate(m)}</div>
              <div className="text-sm text-foreground/90">“{m.meaning}”</div>
              <div className="mt-1 text-xs opacity-80">
                {m.origin_language}
                {m.source_form && (
                  <>
                    {" "}
                    · <em>{m.source_form}</em>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {profile.literal_meaning && (
          <p className="text-muted-foreground">
            Literally: <span className="italic text-foreground">{profile.literal_meaning}</span>
          </p>
        )}
        {profile.memory_hook && (
          <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm">{profile.memory_hook}</p>
        )}
      </Section>

      <Section title="Etymology">
        {etymology.certainty !== "established" && (
          <p className="text-xs text-amber-300/90">Etymology {etymology.certainty}; sources disagree or evidence is thin.</p>
        )}
        <Field label="Language of origin">{etymology.language_of_origin}</Field>
        <Field label="First attested">{etymology.first_attested}</Field>
        {etymology.path.length > 0 && (
          <ol className="relative ml-2 space-y-3 border-l border-primary/30">
            {etymology.path.map((step, i) => (
              <li key={i} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary/70" />
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {step.period} · {step.language}
                </div>
                <div>
                  <em className="font-semibold">{step.form}</em>{" "}
                  <span className="text-muted-foreground">“{step.gloss}”</span>
                </div>
              </li>
            ))}
          </ol>
        )}
        <Field label="Historical origins">{etymology.historical_origins}</Field>
        {etymology.sense_history.length > 0 && (
          <Sub title="How the meaning changed">
            <ul className="space-y-1.5 text-sm">
              {etymology.sense_history.map((h, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">{h.period}</span>
                  <TaxonomyChip entry={entry(SEMANTIC_CHANGE, h.change)} />
                  <span>{h.sense}</span>
                </li>
              ))}
            </ul>
          </Sub>
        )}
        <Field label="Word evolution">{etymology.word_evolution}</Field>
        <Field label="Cultural & regional variations">{etymology.cultural_variations}</Field>
        {etymology.related_words.length > 0 && (
          <Sub title="Related words">
            <div className="flex flex-wrap gap-1.5">
              {etymology.related_words.map((r, i) => (
                <span
                  key={i}
                  title={`Shares "${r.shared_morpheme}"`}
                  className={`rounded-full border px-2 py-0.5 text-sm ${sharedMorphemeEntry(r.shared_morpheme, profile.morphemes).className}`}
                >
                  {r.word} <span className="opacity-70">· {r.shared_morpheme}</span>
                </span>
              ))}
            </div>
          </Sub>
        )}
      </Section>

      <Section title="Definitions">
        <p className="text-lg">{definitions.primary}</p>
        {definitions.senses.length > 0 && (
          <ol className="space-y-3">
            {definitions.senses.map((sense, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TaxonomyChip entry={partOfSpeechEntry(sense.part_of_speech)}>{sense.part_of_speech}</TaxonomyChip>
                    <TaxonomyChip entry={entry(SENSE_RELATION, sense.relation)} />
                    {sense.domain !== "general" && <TaxonomyChip entry={domainEntry(sense.domain)} />}
                    {sense.register !== "neutral" && <TaxonomyChip entry={registerEntry(sense.register)} />}
                  </div>
                  <p>{sense.definition}</p>
                  {sense.example && <p className="text-sm italic text-muted-foreground">“{sense.example}”</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {(profile.word_forms.length > 0 || profile.word_forms_note) && (
        <Section title="Word Forms & Inflections">
          <div className="flex flex-wrap gap-2">
            {profile.word_forms.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <TaxonomyChip entry={partOfSpeechEntry(f.part_of_speech)}>{f.part_of_speech}</TaxonomyChip>
                <span className="font-medium">{f.form}</span>
              </span>
            ))}
          </div>
          {profile.word_forms_note && <p className="text-sm text-muted-foreground">{profile.word_forms_note}</p>}
        </Section>
      )}

      <Section title="Analysis of the Word">
        {analysis.parts_of_speech.length > 0 && (
          <div className="space-y-2">
            {analysis.parts_of_speech.map((p, i) => (
              <p key={i} className="flex flex-wrap items-center gap-2">
                <TaxonomyChip entry={partOfSpeechEntry(p.part_of_speech)}>{p.part_of_speech}</TaxonomyChip>
                <span className="italic">“{p.example}”</span>
              </p>
            ))}
          </div>
        )}

        <Sub title="Meaning & associations">
          <Field label="Connotation">
            {[profile.connotation.valence, profile.connotation.register].filter(Boolean).join(" · ")}
            {profile.connotation.note && <span className="text-muted-foreground"> — {profile.connotation.note}</span>}
          </Field>
          {profile.semantic_web.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.semantic_web.map((e, i) => (
                <TaxonomyChip key={i} entry={{ ...entry(SEMANTIC_RELATION, e.relation), hint: e.note }}>
                  <span className="opacity-75">{entry(SEMANTIC_RELATION, e.relation).label}:</span>&nbsp;{e.term}
                </TaxonomyChip>
              ))}
            </div>
          )}
          <Field label="Sound symbolism">{profile.sound_symbolism}</Field>
        </Sub>

        <Sub title="Usage">
          {analysis.contextual_usage.map((c, i) => (
            <p key={i} className="flex flex-wrap items-baseline gap-2">
              <TaxonomyChip entry={contextEntry(c.context)} />
              <span className="italic">“{c.example}”</span>
            </p>
          ))}
          <Field label="Common collocations">{list(analysis.collocations)}</Field>
          <Field label="Synonyms">{list(analysis.synonyms)}</Field>
          <Field label="Antonyms">{list(analysis.antonyms)}</Field>
          <Field label="Cultural & historical significance">{analysis.cultural_significance}</Field>
        </Sub>

        <Field label="Pronunciation">
          {[analysis.pronunciation.ipa.join(" or "), analysis.pronunciation.syllables].filter(Boolean).join(" · ") ||
            null}
        </Field>
      </Section>

      <Section title="Example">
        <p className="text-lg italic">“{profile.example}”</p>
      </Section>
    </div>
  );
}
