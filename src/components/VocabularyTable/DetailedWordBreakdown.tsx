
import React from 'react';
import { Word } from '@/types/word';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DetailedWordBreakdownProps {
  word: Word;
}

export const DetailedWordBreakdown: React.FC<DetailedWordBreakdownProps> = ({ word }) => {
  const renderMorphemeBreakdown = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Morpheme Breakdown</h3>
      <div className="grid gap-4">
        {word.morpheme_breakdown.prefix && (
          <div className="flex gap-4 items-start">
            <Badge variant="secondary" className="min-w-fit">Prefix</Badge>
            <div>
              <span className="font-medium">{word.morpheme_breakdown.prefix.text}</span>
              <p className="text-sm text-muted-foreground">
                {word.morpheme_breakdown.prefix.meaning}
                {word.morpheme_breakdown.prefix.origin && 
                  ` (from ${word.morpheme_breakdown.prefix.origin})`
                }
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 items-start">
          <Badge variant="default" className="min-w-fit">Root</Badge>
          <div>
            <span className="font-medium">{word.morpheme_breakdown.root.text}</span>
            <p className="text-sm text-muted-foreground">
              {word.morpheme_breakdown.root.meaning}
              {word.morpheme_breakdown.root.origin && 
                ` (from ${word.morpheme_breakdown.root.origin})`
              }
            </p>
          </div>
        </div>

        {word.morpheme_breakdown.suffix && (
          <div className="flex gap-4 items-start">
            <Badge variant="secondary" className="min-w-fit">Suffix</Badge>
            <div>
              <span className="font-medium">{word.morpheme_breakdown.suffix.text}</span>
              <p className="text-sm text-muted-foreground">
                {word.morpheme_breakdown.suffix.meaning}
                {word.morpheme_breakdown.suffix.origin && 
                  ` (from ${word.morpheme_breakdown.suffix.origin})`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEtymology = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Etymology</h3>
      <div className="space-y-3">
        {word.etymology.historical_origins && (
          <div>
            <span className="font-medium text-sm">Historical Origins:</span>
            <p className="text-sm text-muted-foreground mt-1">{word.etymology.historical_origins}</p>
          </div>
        )}
        
        {word.etymology.language_of_origin && (
          <div>
            <span className="font-medium text-sm">Language of Origin:</span>
            <span className="text-sm text-muted-foreground ml-2">{word.etymology.language_of_origin}</span>
          </div>
        )}
        
        {word.etymology.word_evolution && (
          <div>
            <span className="font-medium text-sm">Word Evolution:</span>
            <p className="text-sm text-muted-foreground mt-1">{word.etymology.word_evolution}</p>
          </div>
        )}
        
        {word.etymology.cultural_variations && (
          <div>
            <span className="font-medium text-sm">Cultural & Regional Variations:</span>
            <p className="text-sm text-muted-foreground mt-1">{word.etymology.cultural_variations}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDefinitions = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Definitions</h3>
      
      {word.definitions.primary && (
        <div>
          <h4 className="font-medium text-primary mb-2">Primary Definition</h4>
          <p className="text-sm">{word.definitions.primary}</p>
        </div>
      )}

      {word.definitions.standard && word.definitions.standard.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-2">Standard Definitions</h4>
          <ol className="list-decimal list-inside space-y-1">
            {word.definitions.standard.map((def, index) => (
              <li key={index} className="text-sm">{def}</li>
            ))}
          </ol>
        </div>
      )}

      {word.definitions.extended && word.definitions.extended.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-2">Extended Definitions</h4>
          <ol className="list-decimal list-inside space-y-1" start={(word.definitions.standard?.length || 0) + 1}>
            {word.definitions.extended.map((def, index) => (
              <li key={index} className="text-sm">{def}</li>
            ))}
          </ol>
        </div>
      )}

      {word.definitions.contextual && word.definitions.contextual.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-2">Contextual Definitions</h4>
          <ul className="list-disc list-inside space-y-1">
            {word.definitions.contextual.map((def, index) => (
              <li key={index} className="text-sm">{def}</li>
            ))}
          </ul>
        </div>
      )}

      {word.definitions.specialized && word.definitions.specialized.length > 0 && (
        <div>
          <h4 className="font-medium text-primary mb-2">Specialized Definitions</h4>
          <ul className="list-disc list-inside space-y-1">
            {word.definitions.specialized.map((def, index) => (
              <li key={index} className="text-sm">{def}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderWordForms = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Word Forms & Inflections</h3>
      
      {word.word_forms.base_form && (
        <div>
          <span className="font-medium text-sm">Base Form:</span>
          <span className="text-sm text-muted-foreground ml-2">{word.word_forms.base_form}</span>
        </div>
      )}

      {word.word_forms.noun_forms && (
        <div>
          <span className="font-medium text-sm">Noun Forms:</span>
          <div className="ml-4 mt-1 space-y-1">
            {word.word_forms.noun_forms.singular && (
              <div><span className="text-xs text-muted-foreground">Singular:</span> {word.word_forms.noun_forms.singular}</div>
            )}
            {word.word_forms.noun_forms.plural && (
              <div><span className="text-xs text-muted-foreground">Plural:</span> {word.word_forms.noun_forms.plural}</div>
            )}
          </div>
        </div>
      )}

      {word.word_forms.verb_tenses && (
        <div>
          <span className="font-medium text-sm">Verb Tenses:</span>
          <div className="ml-4 mt-1 space-y-1">
            {Object.entries(word.word_forms.verb_tenses).map(([tense, form]) => (
              form && <div key={tense}><span className="text-xs text-muted-foreground capitalize">{tense.replace('_', ' ')}:</span> {form}</div>
            ))}
          </div>
        </div>
      )}

      {word.word_forms.adjective_forms && (
        <div>
          <span className="font-medium text-sm">Adjective Forms:</span>
          <div className="ml-4 mt-1 space-y-1">
            {Object.entries(word.word_forms.adjective_forms).map(([form, value]) => (
              value && <div key={form}><span className="text-xs text-muted-foreground capitalize">{form}:</span> {value}</div>
            ))}
          </div>
        </div>
      )}

      {word.word_forms.adverb_form && (
        <div>
          <span className="font-medium text-sm">Adverb Form:</span>
          <span className="text-sm text-muted-foreground ml-2">{word.word_forms.adverb_form}</span>
        </div>
      )}

      {word.word_forms.other_inflections && word.word_forms.other_inflections.length > 0 && (
        <div>
          <span className="font-medium text-sm">Other Inflections:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {word.word_forms.other_inflections.map((inflection, index) => (
              <Badge key={index} variant="outline" className="text-xs">{inflection}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Analysis of the Word</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {word.analysis.synonyms && word.analysis.synonyms.length > 0 && (
          <div>
            <span className="font-medium text-sm">Synonyms:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {word.analysis.synonyms.map((synonym, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{synonym}</Badge>
              ))}
            </div>
          </div>
        )}

        {word.analysis.antonyms && word.analysis.antonyms.length > 0 && (
          <div>
            <span className="font-medium text-sm">Antonyms:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {word.analysis.antonyms.map((antonym, index) => (
                <Badge key={index} variant="destructive" className="text-xs">{antonym}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {word.analysis.collocations && word.analysis.collocations.length > 0 && (
        <div>
          <span className="font-medium text-sm">Common Collocations:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {word.analysis.collocations.map((collocation, index) => (
              <Badge key={index} variant="outline" className="text-xs">{collocation}</Badge>
            ))}
          </div>
        </div>
      )}

      {word.analysis.cultural_significance && (
        <div>
          <span className="font-medium text-sm">Cultural & Historical Significance:</span>
          <p className="text-sm text-muted-foreground mt-1">{word.analysis.cultural_significance}</p>
        </div>
      )}

      {word.analysis.example_sentence && (
        <div>
          <span className="font-medium text-sm">Example:</span>
          <p className="text-sm text-muted-foreground mt-1 italic">"{word.analysis.example_sentence}"</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-primary">{word.word}</h2>
        {word.pronunciation && (
          <p className="text-muted-foreground">/{word.pronunciation}/</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderMorphemeBreakdown()}
            <Separator />
            {renderEtymology()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Definitions</CardTitle>
          </CardHeader>
          <CardContent>
            {renderDefinitions()}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forms & Inflections</CardTitle>
          </CardHeader>
          <CardContent>
            {renderWordForms()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage & Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {renderAnalysis()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
