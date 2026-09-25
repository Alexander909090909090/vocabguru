import type { ReactNode } from "react";
import type { CalvernProfile, CalvernMorpheme } from "@/services/calvernService";

const KIND_STYLES: Record<CalvernMorpheme["kind"], string> = {
  prefix: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  root: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  combining_form: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  infix: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  suffix: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const KIND_LABEL: Record<CalvernMorpheme["kind"], string> = {
  prefix: "Prefix",
  root: "Root",
  combining_form: "Combining form",
  infix: "Infix",
  suffix: "Suffix",
};

const hyphenate = (m: CalvernMorpheme) =>
  m.kind === "prefix" ? `${m.form}-` : m.kind === "suffix" ? `-${m.form}` : m.form;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-6 space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
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

const list = (items: string[]) => (items.length ? items.join(", ") : null);

export function CalvernProfileView({ profile }: { profile: CalvernProfile }) {
  const { etymology, definitions, analysis } = profile;

  return (
    <div className="space-y-5">
      <Section title="Morpheme Breakdown">
        <div className="flex flex-wrap items-stretch gap-2">
          {profile.morphemes.map((m, i) => (
            <div key={i} className={`rounded-xl border px-4 py-3 min-w-[7rem] ${KIND_STYLES[m.kind]}`}>
              <div className="text-xs uppercase tracking-wide opacity-80">{KIND_LABEL[m.kind]}</div>
              <div className="text-xl font-bold">{hyphenate(m)}</div>
              <div className="text-sm text-foreground/90">“{m.meaning}”</div>
              <div className="text-xs opacity-80 mt-1">
                {m.origin_language}
                {m.source_form && <> · <em>{m.source_form}</em></>}
              </div>
            </div>
          ))}
        </div>
        {profile.literal_meaning && (
          <p className="text-muted-foreground">
            Literally: <span className="text-foreground italic">{profile.literal_meaning}</span>
          </p>
        )}
        {profile.memory_hook && (
          <p className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm">{profile.memory_hook}</p>
        )}
      </Section>

      <Section title="Meaning & Associations">
        <Field label="Connotation">
          {[profile.connotation.valence, profile.connotation.register].filter(Boolean).join(" · ")}
          {profile.connotation.note && <span className="text-muted-foreground"> — {profile.connotation.note}</span>}
        </Field>
        {profile.semantic_web.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.semantic_web.map((e, i) => (
              <span key={i} title={e.note} className="rounded-full border border-border px-3 py-1 text-sm">
                <span className="text-muted-foreground">{e.relation}:</span> {e.term}
              </span>
            ))}
          </div>
        )}
        <Field label="Sound symbolism">{profile.sound_symbolism}</Field>
      </Section>

      <Section title="Etymology">
        {etymology.certainty !== "established" && (
          <p className="text-xs text-amber-300/90">Etymology {etymology.certainty}; sources disagree or evidence is thin.</p>
        )}
        <Field label="Historical origins">{etymology.historical_origins}</Field>
        <Field label="Language of origin">{etymology.language_of_origin}</Field>
        <Field label="First attested">{etymology.first_attested}</Field>
        {etymology.path.length > 0 && (
          <ol className="relative border-l border-primary/30 ml-2 space-y-3">
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
        <Field label="Word evolution">{etymology.word_evolution}</Field>
        {etymology.sense_history.length > 0 && (
          <ul className="space-y-1 text-sm">
            {etymology.sense_history.map((h, i) => (
              <li key={i}>
                <span className="text-muted-foreground">{h.period}</span>{" "}
                <span className="rounded-full border border-border px-1.5 text-xs text-muted-foreground">{h.change}</span>{" "}
                {h.sense}
              </li>
            ))}
          </ul>
        )}
        <Field label="Cultural & regional variations">{etymology.cultural_variations}</Field>
        <Field label="Related words">
          {etymology.related_words.length
            ? etymology.related_words.map((r) => `${r.word} (${r.shared_morpheme})`).join(", ")
            : null}
        </Field>
      </Section>

      <Section title="Definitions">
        <p className="text-lg">{definitions.primary}</p>
        {definitions.senses.length > 0 && (
          <ol className="space-y-3">
            {definitions.senses.map((sense, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="italic text-muted-foreground">{sense.part_of_speech}</span>
                    {sense.relation !== "core" && (
                      <span className="rounded-full border border-primary/30 px-2 text-primary">{sense.relation}</span>
                    )}
                    {sense.domain !== "general" && (
                      <span className="rounded-full border border-border px-2 text-muted-foreground">{sense.domain}</span>
                    )}
                    {sense.register !== "neutral" && (
                      <span className="rounded-full border border-border px-2 text-muted-foreground">{sense.register}</span>
                    )}
                  </div>
                  <p>{sense.definition}</p>
                  {sense.example && <p className="text-sm italic text-muted-foreground">“{sense.example}”</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      <Section title="Word Forms & Inflections">
        {profile.word_forms.map((f, i) => (
          <Field key={i} label={f.part_of_speech}>{f.form}</Field>
        ))}
        {profile.word_forms_note && <p className="text-sm text-muted-foreground">{profile.word_forms_note}</p>}
      </Section>

      <Section title="Analysis of the Word">
        {analysis.parts_of_speech.map((p, i) => (
          <Field key={i} label={p.part_of_speech}>“{p.example}”</Field>
        ))}
        {analysis.contextual_usage.map((c, i) => (
          <Field key={`ctx-${i}`} label={c.context}>“{c.example}”</Field>
        ))}
        <Field label="Common collocations">{list(analysis.collocations)}</Field>
        <Field label="Synonyms">{list(analysis.synonyms)}</Field>
        <Field label="Antonyms">{list(analysis.antonyms)}</Field>
        <Field label="Cultural & historical significance">{analysis.cultural_significance}</Field>
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
