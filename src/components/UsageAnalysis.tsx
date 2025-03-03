
import { Word } from "@/data/words";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Book, AlignLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsageAnalysisProps {
  word: Word;
}

export function UsageAnalysis({ word }: UsageAnalysisProps) {
  const { usage, partOfSpeech } = word;
  
  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Usage Analysis</h4>
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <CardTitle>Practical Usage</CardTitle>
            </div>
            <Badge>{partOfSpeech || "Unknown"}</Badge>
          </div>
          <CardDescription>
            Learn how "{word.word}" is used in various contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {usage.exampleSentence && (
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-primary" />
                Example Sentence
              </h5>
              <div className="bg-muted p-3 rounded-md italic text-sm">
                "{usage.exampleSentence}"
              </div>
            </div>
          )}
          
          {usage.commonCollocations && usage.commonCollocations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                <AlignLeft className="h-4 w-4 text-primary" />
                Common Collocations
              </h5>
              <div className="flex flex-wrap gap-2">
                {usage.commonCollocations.map((collocation, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {collocation}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {usage.contextualUsage && (
            <div>
              <h5 className="text-sm font-medium mb-2">Contextual Usage</h5>
              <ScrollArea className="h-[100px] rounded-md border p-3">
                <p className="text-sm">{usage.contextualUsage}</p>
              </ScrollArea>
            </div>
          )}
          
          {usage.sentenceStructure && (
            <div>
              <h5 className="text-sm font-medium mb-2">Sentence Structure</h5>
              <div className="bg-muted p-3 rounded-md text-sm">
                {usage.sentenceStructure}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UsageAnalysis;
