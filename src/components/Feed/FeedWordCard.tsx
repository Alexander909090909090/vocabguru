import { Link } from "react-router-dom";
import type { FeedWord } from "@/hooks/useWordFeed";
import { MORPHEME, entry } from "@/lib/taxonomy";

// Stable gradient per word: the placeholder whenever no image exists.
function gradient(seed: string) {
  const hash = [...seed].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `linear-gradient(135deg, hsl(${hash % 360}, 70%, 45%), hsl(${(hash * 7) % 360}, 70%, 35%))`;
}

const chipClass = (kind: string) => entry(MORPHEME, kind).className;
const hyphenate = (kind: string, form: string) =>
  kind === "prefix" ? `${form}-` : kind === "suffix" ? `-${form}` : form;

function Morphemes({ word }: { word: FeedWord }) {
  if (word.morphemes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {word.morphemes.map((m, i) => (
        <span key={i} className={`rounded border px-2 py-0.5 text-xs font-medium ${chipClass(m.kind)}`}>
          {hyphenate(m.kind, m.form)}
        </span>
      ))}
    </div>
  );
}

export function FeedWordCard({ word, layout }: { word: FeedWord; layout: "grid" | "list" }) {
  const to = `/w/${encodeURIComponent(word.word)}`;
  const thumb = word.imageUrl ? (
    <img src={word.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full" style={{ background: gradient(word.word) }} />
  );

  if (layout === "list") {
    return (
      <Link to={to} className="glass-card flex items-center gap-4 rounded-xl p-3 hover-card">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">{thumb}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-semibold capitalize">{word.word}</h3>
            {word.origin && <span className="text-xs text-muted-foreground">{word.origin}</span>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{word.definition}</p>
          <Morphemes word={word} />
        </div>
      </Link>
    );
  }

  return (
    <Link to={to} className="glass-card block overflow-hidden rounded-xl hover-card">
      <div className="h-40">{thumb}</div>
      <div className="space-y-2 p-4">
        <h3 className="text-xl font-semibold capitalize">{word.word}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{word.definition}</p>
        <Morphemes word={word} />
        {word.origin && (
          <span className="chip inline-block bg-secondary text-secondary-foreground">{word.origin}</span>
        )}
      </div>
    </Link>
  );
}
