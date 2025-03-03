
import { Word } from "@/data/words";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, Link2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FormsAndRelationsProps {
  word: Word;
}

export function FormsAndRelations({ word }: FormsAndRelationsProps) {
  const { forms, synonymsAntonyms } = word;
  
  // Check if word has any grammatical forms
  const hasForms = forms.noun || forms.verb || forms.adjective || forms.adverb;
  
  // Check if word has any synonyms or antonyms
  const hasRelations = 
    (synonymsAntonyms.synonyms && synonymsAntonyms.synonyms.length > 0) || 
    (synonymsAntonyms.antonyms && synonymsAntonyms.antonyms.length > 0);
  
  if (!hasForms && !hasRelations) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Forms & Relations</h4>
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <CardTitle>Word Relationships</CardTitle>
          </div>
          <CardDescription>
            Explore related forms and semantic connections of "{word.word}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="forms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="forms" disabled={!hasForms}>
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Grammatical Forms</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="relations" disabled={!hasRelations}>
                <div className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  <span>Semantic Relations</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="forms" className="mt-4">
              {hasForms ? (
                <div className="grid grid-cols-2 gap-3">
                  {forms.noun && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-muted-foreground">Noun Form</h5>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="text-sm font-medium">{forms.noun}</p>
                      </div>
                    </div>
                  )}
                  
                  {forms.verb && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-muted-foreground">Verb Form</h5>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="text-sm font-medium">{forms.verb}</p>
                      </div>
                    </div>
                  )}
                  
                  {forms.adjective && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-muted-foreground">Adjective Form</h5>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="text-sm font-medium">{forms.adjective}</p>
                      </div>
                    </div>
                  )}
                  
                  {forms.adverb && (
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-muted-foreground">Adverb Form</h5>
                      <div className="bg-muted p-2 rounded-md">
                        <p className="text-sm font-medium">{forms.adverb}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground text-sm">
                  No grammatical forms available for this word.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="relations" className="mt-4">
              <div className="space-y-4">
                {synonymsAntonyms.synonyms && synonymsAntonyms.synonyms.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-primary">Synonyms</h5>
                    <div className="flex flex-wrap gap-2">
                      {synonymsAntonyms.synonyms.map((synonym, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 hover:bg-green-100">
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {synonymsAntonyms.antonyms && synonymsAntonyms.antonyms.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-primary">Antonyms</h5>
                    <div className="flex flex-wrap gap-2">
                      {synonymsAntonyms.antonyms.map((antonym, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 hover:bg-red-100">
                          {antonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {(!synonymsAntonyms.synonyms || synonymsAntonyms.synonyms.length === 0) && 
                 (!synonymsAntonyms.antonyms || synonymsAntonyms.antonyms.length === 0) && (
                  <div className="text-center p-4 text-muted-foreground text-sm">
                    No semantic relations available for this word.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default FormsAndRelations;
