
import React from 'react';

interface SimpleWordBreakdownProps {
  prefix?: string;
  root: string;
  suffix?: string;
  className?: string;
}

const SimpleWordBreakdown: React.FC<SimpleWordBreakdownProps> = ({
  prefix,
  root,
  suffix,
  className = ''
}) => {
  return (
    <div className={`text-sm ${className}`}>
      <span className="font-medium text-muted-foreground">Morphology: </span>
      {prefix && (
        <>
          <span className="font-medium">Prefix: </span>
          <span>{prefix}</span>
          {(root || suffix) && <span>, </span>}
        </>
      )}
      
      {root && (
        <>
          <span className="font-medium">Root: </span>
          <span>{root}</span>
          {suffix && <span>, </span>}
        </>
      )}
      
      {suffix && (
        <>
          <span className="font-medium">Suffix: </span>
          <span>{suffix}</span>
        </>
      )}
      
      {!prefix && !root && !suffix && (
        <span className="text-muted-foreground italic">No morphological breakdown available</span>
      )}
    </div>
  );
};

export default SimpleWordBreakdown;
