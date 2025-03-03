
import { Word } from "@/data/words";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WordListProps {
  words: Word[];
}

export function WordList({ words }: WordListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {words.map((word) => (
        <Link key={word.id} to={`/word/${word.id}`} className="block">
          <div className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              {word.images && word.images.length > 0 && (
                <div 
                  className="h-28 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url(${word.images[0].url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              <div className="absolute top-2 left-2">
                <div className="px-2 py-1 text-xs rounded-full bg-black/70 text-white">
                  {word.id}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium">{word.word}</h3>
              
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">Primary Definition</div>
                <p className="text-sm line-clamp-2">
                  {word.definitions[0]?.text || ""}
                </p>
              </div>
              
              {word.definitions.find(d => d.type === 'contextual') && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground">Contextual Definition</div>
                  <p className="text-sm line-clamp-2">
                    {word.definitions.find(d => d.type === 'contextual')?.text || ""}
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <button className="w-full py-2 text-sm rounded-md bg-primary text-primary-foreground">
                  Open
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default WordList;
