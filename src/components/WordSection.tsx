
import { ReactNode } from "react";

interface WordSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  tag?: string;
  color?: string;
}

export function WordSection({ 
  title, 
  children, 
  className = "", 
  tag, 
  color = "bg-primary/80" 
}: WordSectionProps) {
  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="section-title">{title}</h3>
        {tag && (
          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${color}`}>
            {tag}
          </span>
        )}
      </div>
      <div className="glass-card rounded-lg p-4 animate-blur-in">
        {children}
      </div>
    </div>
  );
}

export default WordSection;
