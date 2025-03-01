
import { MorphemeBreakdown as MorphemeBreakdownType } from "@/data/words";

interface MorphemeBreakdownProps {
  breakdown: MorphemeBreakdownType;
}

export function MorphemeBreakdown({ breakdown }: MorphemeBreakdownProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="flex flex-col items-center">
        <h4 className="section-title text-center">Prefix</h4>
        <div className="glass-card w-full p-4 rounded-lg text-center min-h-[80px] flex items-center justify-center">
          {breakdown.prefix ? (
            <div className="animate-fade-in">
              <div className="text-sm font-medium bg-primary/20 rounded-full px-3 py-1 inline-block">
                {breakdown.prefix.text}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {breakdown.prefix.meaning}
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <h4 className="section-title text-center">Root Word</h4>
        <div className="glass-card w-full p-4 rounded-lg text-center min-h-[80px] flex items-center justify-center">
          <div className="animate-fade-in">
            <div className="text-sm font-medium bg-primary/20 rounded-full px-3 py-1 inline-block">
              {breakdown.root.text}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {breakdown.root.meaning}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <h4 className="section-title text-center">Suffix</h4>
        <div className="glass-card w-full p-4 rounded-lg text-center min-h-[80px] flex items-center justify-center">
          {breakdown.suffix ? (
            <div className="animate-fade-in">
              <div className="text-sm font-medium bg-primary/20 rounded-full px-3 py-1 inline-block">
                {breakdown.suffix.text}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {breakdown.suffix.meaning}
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MorphemeBreakdown;
