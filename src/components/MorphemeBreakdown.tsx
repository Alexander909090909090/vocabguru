
import { MorphemeBreakdown as MorphemeBreakdownType } from "@/data/words";

interface MorphemeBreakdownProps {
  breakdown: MorphemeBreakdownType;
}

export function MorphemeBreakdown({ breakdown }: MorphemeBreakdownProps) {
  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Morpheme Breakdown</h4>
      <div className="glass-card rounded-lg p-5 bg-card/90 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          {breakdown.prefix && (
            <div className="flex flex-col items-center">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-md font-bold mb-2">
                {breakdown.prefix.text}
              </div>
              <span className="text-xs text-muted-foreground">Prefix</span>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="bg-primary/30 text-primary px-6 py-3 rounded-md font-bold mb-2">
              {breakdown.root.text}
            </div>
            <span className="text-xs text-muted-foreground">Root</span>
          </div>
          
          {breakdown.suffix && (
            <div className="flex flex-col items-center">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-md font-bold mb-2">
                {breakdown.suffix.text}
              </div>
              <span className="text-xs text-muted-foreground">Suffix</span>
            </div>
          )}
        </div>
        
        <ul className="space-y-6">
          {breakdown.prefix && (
            <li className="flex items-start gap-3">
              <span className="font-medium min-w-28">• Prefix:</span>
              <div>
                <span className="font-medium">
                  {breakdown.prefix.text}
                </span>
                <span className="text-muted-foreground">
                  {" - " + breakdown.prefix.meaning}
                </span>
              </div>
            </li>
          )}
          
          <li className="flex items-start gap-3">
            <span className="font-medium min-w-28">• Root Word:</span>
            <div>
              <span className="font-medium">
                {breakdown.root.text}
              </span>
              <span className="text-muted-foreground">
                {" - " + breakdown.root.meaning}
              </span>
            </div>
          </li>
          
          {breakdown.suffix && (
            <li className="flex items-start gap-3">
              <span className="font-medium min-w-28">• Suffix:</span>
              <div>
                <span className="font-medium">
                  {breakdown.suffix.text}
                </span>
                <span className="text-muted-foreground">
                  {" - " + breakdown.suffix.meaning}
                </span>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default MorphemeBreakdown;
