
import { Word, WordDefinition } from "@/data/words";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Lightbulb, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DefinitionsExplorerProps {
  word: Word;
}

export function DefinitionsExplorer({ word }: DefinitionsExplorerProps) {
  const [selectedDefinitionIndex, setSelectedDefinitionIndex] = useState(0);
  
  // Map definition types to more user-friendly labels and colors
  const getDefinitionTypeInfo = (type: string) => {
    switch (type) {
      case 'primary':
        return { 
          label: 'Primary', 
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' 
        };
      case 'standard':
        return { 
          label: 'Standard', 
          icon: <FileText className="h-4 w-4" />,
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' 
        };
      case 'contextual':
        return { 
          label: 'Contextual', 
          icon: <Lightbulb className="h-4 w-4" />,
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' 
        };
      case 'extended':
        return { 
          label: 'Extended', 
          icon: <FileText className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
        };
      case 'specialized':
        return { 
          label: 'Specialized', 
          icon: <BookOpen className="h-4 w-4" />,
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300' 
        };
      default:
        return { 
          label: type.charAt(0).toUpperCase() + type.slice(1), 
          icon: <FileText className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' 
        };
    }
  };
  
  if (!word.definitions || word.definitions.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Definitions</h4>
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Meaning & Context</CardTitle>
          </div>
          <CardDescription>
            Explore different definitions of "{word.word}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {word.definitions.map((definition, index) => {
              const typeInfo = getDefinitionTypeInfo(definition.type);
              return (
                <Badge 
                  key={index}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all flex items-center gap-1",
                    typeInfo.color,
                    selectedDefinitionIndex === index 
                      ? "ring-2 ring-primary ring-offset-1" 
                      : "opacity-70 hover:opacity-100"
                  )}
                  onClick={() => setSelectedDefinitionIndex(index)}
                >
                  {typeInfo.icon}
                  {typeInfo.label}
                </Badge>
              );
            })}
          </div>
          
          <ScrollArea className="h-[150px] rounded-md border p-4">
            <div className="space-y-4">
              {word.definitions[selectedDefinitionIndex] && (
                <>
                  <div className="text-lg font-medium">
                    {word.word} 
                    {word.pronunciation && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {word.pronunciation}
                      </span>
                    )}
                  </div>
                  <p>{word.definitions[selectedDefinitionIndex].text}</p>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default DefinitionsExplorer;
