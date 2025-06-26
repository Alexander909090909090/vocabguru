
import { Word } from "@/data/words";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface WordGridProps {
  words: Word[];
  isLoading?: boolean;
}

export function WordGrid({ words, isLoading }: WordGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg overflow-hidden bg-black">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 bg-black">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {words.map((word) => (
        <div key={word.id} className="rounded-lg overflow-hidden bg-black">
          <div className="relative">
            <div 
              className="h-40 relative overflow-hidden"
              style={{ 
                background: getGradientForWord(word.id),
              }}
            >
              {word.images?.[0] && (
                <img
                  src={word.images[0].url}
                  alt={word.images[0].alt}
                  className="w-full h-full object-cover object-center opacity-80"
                />
              )}
              <div className="absolute top-2 left-2">
                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  {word.word.toLowerCase()}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-black text-white">
              <h3 className="text-xl font-medium text-white mb-1">{word.word}</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-xs">Primary Definition</p>
                  <p className="text-sm text-white">
                    {word.definitions.find(def => def.type === 'primary')?.text || word.description}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs">Contextual Definition</p>
                  <p className="text-sm text-white">
                    {word.usage.contextualUsage}
                  </p>
                </div>
              </div>
              
              <Link to={`/word/${word.id}`}>
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                  Open
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to generate consistent gradients based on word ID
function getGradientForWord(id: string) {
  // Simple hash function
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use the hash to generate hue values
  const hue1 = hash % 360;
  const hue2 = (hash * 7) % 360;
  
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
}

export default WordGrid;
