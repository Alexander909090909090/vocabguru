
import { ReactNode } from "react";

interface WordSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function WordSection({ title, children, className = "" }: WordSectionProps) {
  return (
    <div className={`mb-5 ${className}`}>
      <h3 className="section-title">{title}</h3>
      <div className="glass-card rounded-lg p-4 animate-blur-in">
        {children}
      </div>
    </div>
  );
}

export default WordSection;
