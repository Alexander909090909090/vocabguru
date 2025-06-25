
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Sparkles, 
  Play, 
  Plus, 
  Share2,
  Brain,
  ArrowRight
} from "lucide-react";
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { toast } from "sonner";

interface WordDetailDialogProps {
  word: WordRepositoryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCollection?: (word: WordRepositoryEntry) => void;
}

export function WordDetailDialog({ word, isOpen, onClose, onAddToCollection }: WordDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!word) return null;

  const handleAnalyzeWithAI = () => {
    toast.info("AI analysis feature coming soon!");
  };

  const handleStudyWord = () => {
    toast.info("Study tools coming soon!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Learn about "${word.word}"`,
        text: `Discover the meaning and etymology of "${word.word}" - ${word.definitions.primary}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold capitalize mb-2">
                {word.word}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {word.definitions.primary}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button size="sm" onClick={() => onAddToCollection?.(word)}>
                <Plus className="h-4 w-4 mr-1" />
                Add to Library
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="study">Study Tools</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Definitions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Badge variant="default" className="mb-2">Primary</Badge>
                    <p>{word.definitions.primary}</p>
                  </div>
                  {word.definitions.standard && word.definitions.standard.length > 0 && (
                    <div>
                      <Badge variant="secondary" className="mb-2">Additional</Badge>
                      <ul className="list-disc list-inside space-y-1">
                        {word.definitions.standard.map((def, index) => (
                          <li key={index} className="text-sm">{def}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Etymology</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {word.etymology.language_of_origin && (
                    <div>
                      <span className="font-medium">Origin: </span>
                      <Badge variant="outline">{word.etymology.language_of_origin}</Badge>
                    </div>
                  )}
                  {word.etymology.historical_origins && (
                    <p className="text-sm text-muted-foreground">
                      {word.etymology.historical_origins}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Word Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {word.analysis?.parts_of_speech && (
                    <Badge variant="secondary">
                      {word.analysis.parts_of_speech}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {word.difficulty_level}
                  </Badge>
                  <Badge variant="outline">
                    Score: {word.frequency_score}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Morphological Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-lg font-mono">
                    {word.morpheme_breakdown.prefix && (
                      <>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {word.morpheme_breakdown.prefix.text}
                        </span>
                        <span>+</span>
                      </>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      {word.morpheme_breakdown.root.text}
                    </span>
                    {word.morpheme_breakdown.suffix && (
                      <>
                        <span>+</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {word.morpheme_breakdown.suffix.text}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  {word.morpheme_breakdown.prefix && (
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-blue-600">Prefix: {word.morpheme_breakdown.prefix.text}</div>
                      <div className="text-sm text-muted-foreground">{word.morpheme_breakdown.prefix.meaning}</div>
                    </div>
                  )}
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-green-600">Root: {word.morpheme_breakdown.root.text}</div>
                    <div className="text-sm text-muted-foreground">{word.morpheme_breakdown.root.meaning}</div>
                  </div>
                  {word.morpheme_breakdown.suffix && (
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium text-purple-600">Suffix: {word.morpheme_breakdown.suffix.text}</div>
                      <div className="text-sm text-muted-foreground">{word.morpheme_breakdown.suffix.meaning}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStudyWord}>
                <CardContent className="p-6 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Practice with interactive flashcards
                  </p>
                  <Button className="w-full">
                    Start Flashcards
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStudyWord}>
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Mini Quiz</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Test your understanding with a quick quiz
                  </p>
                  <Button className="w-full">
                    Take Quiz
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>Add this word to your library to track study progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Deep Analysis with Calvern</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get detailed morphological analysis, usage patterns, and contextual examples
                  </p>
                  <Button onClick={handleAnalyzeWithAI}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default WordDetailDialog;
