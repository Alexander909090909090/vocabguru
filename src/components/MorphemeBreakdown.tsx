
import { MorphemeBreakdown as MorphemeBreakdownType } from "@/data/words";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MorphemeBreakdownProps {
  breakdown: MorphemeBreakdownType;
}

export function MorphemeBreakdown({ breakdown }: MorphemeBreakdownProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Generate unique but consistent colors for each morpheme
  const getColorClass = (text: string, type: string) => {
    // Simple hash function based on the text
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Base colors by type
    const baseColors = {
      prefix: ['bg-blue-100', 'bg-indigo-100', 'bg-purple-100', 'border-blue-300'],
      root: ['bg-green-100', 'bg-emerald-100', 'bg-teal-100', 'border-green-300'],
      suffix: ['bg-amber-100', 'bg-orange-100', 'bg-rose-100', 'border-amber-300']
    };
    
    const textColors = {
      prefix: ['text-blue-800', 'text-indigo-800', 'text-purple-800'],
      root: ['text-green-800', 'text-emerald-800', 'text-teal-800'],
      suffix: ['text-amber-800', 'text-orange-800', 'text-rose-800']
    };
    
    // Get index based on hash
    const colorIndex = hash % 3;
    
    return {
      bg: baseColors[type as keyof typeof baseColors][colorIndex],
      text: textColors[type as keyof typeof textColors][colorIndex],
      border: baseColors[type as keyof typeof baseColors][3]
    };
  };

  const prefixColors = breakdown.prefix ? getColorClass(breakdown.prefix.text, 'prefix') : null;
  const rootColors = getColorClass(breakdown.root.text, 'root');
  const suffixColors = breakdown.suffix ? getColorClass(breakdown.suffix.text, 'suffix') : null;

  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Morpheme Breakdown</h4>
      <div className="glass-card rounded-lg p-5 bg-card/90 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          {breakdown.prefix && (
            <div 
              className="flex flex-col items-center transition-all duration-300"
              onMouseEnter={() => setHoveredPart('prefix')}
              onMouseLeave={() => setHoveredPart(null)}
            >
              <div 
                className={cn(
                  `px-4 py-2 rounded-md font-bold mb-2 border-2 transition-all duration-300`,
                  prefixColors?.bg,
                  prefixColors?.text,
                  prefixColors?.border,
                  hoveredPart === 'prefix' ? 'scale-110 shadow-md' : 'border-transparent'
                )}
              >
                {breakdown.prefix.text}
              </div>
              <span className="text-xs text-muted-foreground">Prefix</span>
              {hoveredPart === 'prefix' && (
                <div className="absolute mt-20 p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg z-10 max-w-56 text-center">
                  <p className="text-sm font-medium">{breakdown.prefix.text}</p>
                  <p className="text-xs text-muted-foreground">{breakdown.prefix.meaning}</p>
                </div>
              )}
            </div>
          )}
          
          <div 
            className="flex flex-col items-center transition-all duration-300"
            onMouseEnter={() => setHoveredPart('root')}
            onMouseLeave={() => setHoveredPart(null)}
          >
            <div 
              className={cn(
                `px-6 py-3 rounded-md font-bold mb-2 border-2 transition-all duration-300`,
                rootColors.bg,
                rootColors.text,
                rootColors.border,
                hoveredPart === 'root' ? 'scale-110 shadow-md' : 'border-transparent'
              )}
            >
              {breakdown.root.text}
            </div>
            <span className="text-xs text-muted-foreground">Root</span>
            {hoveredPart === 'root' && (
              <div className="absolute mt-20 p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg z-10 max-w-56 text-center">
                <p className="text-sm font-medium">{breakdown.root.text}</p>
                <p className="text-xs text-muted-foreground">{breakdown.root.meaning}</p>
              </div>
            )}
          </div>
          
          {breakdown.suffix && (
            <div 
              className="flex flex-col items-center transition-all duration-300"
              onMouseEnter={() => setHoveredPart('suffix')}
              onMouseLeave={() => setHoveredPart(null)}
            >
              <div 
                className={cn(
                  `px-4 py-2 rounded-md font-bold mb-2 border-2 transition-all duration-300`,
                  suffixColors?.bg,
                  suffixColors?.text,
                  suffixColors?.border,
                  hoveredPart === 'suffix' ? 'scale-110 shadow-md' : 'border-transparent'
                )}
              >
                {breakdown.suffix.text}
              </div>
              <span className="text-xs text-muted-foreground">Suffix</span>
              {hoveredPart === 'suffix' && (
                <div className="absolute mt-20 p-2 bg-background/90 backdrop-blur-sm border rounded-md shadow-lg z-10 max-w-56 text-center">
                  <p className="text-sm font-medium">{breakdown.suffix.text}</p>
                  <p className="text-xs text-muted-foreground">{breakdown.suffix.meaning}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {breakdown.prefix && (
            <div className={cn(
              "rounded-lg p-3 transition-all duration-300",
              hoveredPart === 'prefix' ? prefixColors?.bg : 'bg-card/50'
            )}>
              <div className="flex items-start gap-3">
                <span className="font-medium min-w-28">• Prefix:</span>
                <div>
                  <span className={cn("font-medium", prefixColors?.text)}>
                    {breakdown.prefix.text}
                  </span>
                  <span className="text-muted-foreground">
                    {" - " + breakdown.prefix.meaning}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className={cn(
            "rounded-lg p-3 transition-all duration-300",
            hoveredPart === 'root' ? rootColors.bg : 'bg-card/50'
          )}>
            <div className="flex items-start gap-3">
              <span className="font-medium min-w-28">• Root Word:</span>
              <div>
                <span className={cn("font-medium", rootColors.text)}>
                  {breakdown.root.text}
                </span>
                <span className="text-muted-foreground">
                  {" - " + breakdown.root.meaning}
                </span>
              </div>
            </div>
          </div>
          
          {breakdown.suffix && (
            <div className={cn(
              "rounded-lg p-3 transition-all duration-300",
              hoveredPart === 'suffix' ? suffixColors?.bg : 'bg-card/50'
            )}>
              <div className="flex items-start gap-3">
                <span className="font-medium min-w-28">• Suffix:</span>
                <div>
                  <span className={cn("font-medium", suffixColors?.text)}>
                    {breakdown.suffix.text}
                  </span>
                  <span className="text-muted-foreground">
                    {" - " + breakdown.suffix.meaning}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MorphemeBreakdown;
