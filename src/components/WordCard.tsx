
import { Link } from "react-router-dom";
import { Word } from "@/data/words";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen } from "lucide-react";

interface WordCardProps {
  word: Word;
  viewMode?: 'grid' | 'list';
}

export default function WordCard({ word, viewMode = 'grid' }: WordCardProps) {
  // Get the first image or use placeholder
  const firstImage = word.images && word.images.length > 0 
    ? word.images[0].url 
    : '/placeholder.svg';
  
  // Get the first definition
  const primaryDefinition = word.definitions && word.definitions.length > 0
    ? word.definitions[0].text
    : 'No definition available';
  
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center p-4">
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 mr-4">
            <img 
              src={firstImage} 
              alt={`Image for ${word.word}`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{word.word}</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {word.partOfSpeech}
                  </Badge>
                  {word.languageOrigin && (
                    <Badge variant="secondary" className="text-xs">
                      {word.languageOrigin}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="ml-auto" asChild>
                <Link to={`/word/${word.id}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-1 mt-1">
              {word.description}
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-secondary">
        <img 
          src={firstImage} 
          alt={`Image for ${word.word}`} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{word.word}</CardTitle>
          <Badge>{word.partOfSpeech}</Badge>
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {word.languageOrigin}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {word.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/word/${word.id}`} className="flex items-center justify-center gap-1">
            <BookOpen className="h-4 w-4" />
            Explore Word
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
