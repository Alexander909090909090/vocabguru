import type { TaxonomyEntry } from "@/lib/taxonomy";

export function TaxonomyChip({ entry, children }: { entry: TaxonomyEntry; children?: React.ReactNode }) {
  return (
    <span title={entry.hint} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${entry.className}`}>
      {children ?? entry.label}
    </span>
  );
}
