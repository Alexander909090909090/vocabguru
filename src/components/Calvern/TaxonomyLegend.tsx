import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LEGEND } from "@/lib/taxonomy";
import { TaxonomyChip } from "./TaxonomyChip";

// Collapsible key to every color on the word page, rendered from the taxonomy itself.
export function TaxonomyLegend() {
  const [open, setOpen] = useState(false);
  return (
    <section className="glass-card rounded-2xl px-6 py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-semibold">
        Color key
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {LEGEND.map(({ title, group }) => (
            <div key={title} className="space-y-1.5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(group).map(([key, e]) => (
                  <TaxonomyChip key={key} entry={e} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
