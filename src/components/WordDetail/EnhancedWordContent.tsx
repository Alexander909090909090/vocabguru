import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import WordSection from "@/components/WordSection";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EnhancedWordContentProps {
  wordProfile: EnhancedWordProfile;
}

const EnhancedWordContent = ({ wordProfile }: EnhancedWordContentProps) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Given Word Header */}
      <div className="text-center border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Given Word</h1>
        <h2 className="text-3xl font-semibold text-primary">{wordProfile.word}</h2>
      </div>

      {/* Morpheme Breakdown */}
      <WordSection title="Morpheme Breakdown">
        <div className="space-y-4">
          {wordProfile.morpheme_breakdown.prefix && (
            <div className="flex gap-2">
              <span className="font-semibold min-w-20">• Prefix:</span>
              <div>
                <span className="font-medium">{wordProfile.morpheme_breakdown.prefix.text}</span>
                <span className="text-muted-foreground"> - {wordProfile.morpheme_breakdown.prefix.meaning}</span>
                {wordProfile.morpheme_breakdown.prefix.origin && (
                  <span className="text-sm text-muted-foreground block ml-4">
                    Origin: {wordProfile.morpheme_breakdown.prefix.origin}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <span className="font-semibold min-w-20">• Root Word:</span>
            <div>
              <span className="font-medium">{wordProfile.morpheme_breakdown.root.text}</span>
              <span className="text-muted-foreground"> - {wordProfile.morpheme_breakdown.root.meaning}</span>
              {wordProfile.morpheme_breakdown.root.origin && (
                <span className="text-sm text-muted-foreground block ml-4">
                  Origin: {wordProfile.morpheme_breakdown.root.origin}
                </span>
              )}
            </div>
          </div>
          
          {wordProfile.morpheme_breakdown.suffix && (
            <div className="flex gap-2">
              <span className="font-semibold min-w-20">• Suffix:</span>
              <div>
                <span className="font-medium">{wordProfile.morpheme_breakdown.suffix.text}</span>
                <span className="text-muted-foreground"> - {wordProfile.morpheme_breakdown.suffix.meaning}</span>
                {wordProfile.morpheme_breakdown.suffix.origin && (
                  <span className="text-sm text-muted-foreground block ml-4">
                    Origin: {wordProfile.morpheme_breakdown.suffix.origin}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </WordSection>

      {/* Etymology */}
      <WordSection title="Etymology">
        <div className="space-y-3">
          {wordProfile.etymology.historical_origins && (
            <div>
              <span className="font-semibold">• Historical Origins:</span>
              <p className="text-muted-foreground ml-4">{wordProfile.etymology.historical_origins}</p>
            </div>
          )}
          
          {wordProfile.etymology.language_of_origin && (
            <div>
              <span className="font-semibold">• Language of Origin:</span>
              <span className="text-muted-foreground ml-2">{wordProfile.etymology.language_of_origin}</span>
            </div>
          )}
          
          {wordProfile.etymology.word_evolution && (
            <div>
              <span className="font-semibold">• Word Evolution:</span>
              <p className="text-muted-foreground ml-4">{wordProfile.etymology.word_evolution}</p>
            </div>
          )}
          
          {wordProfile.etymology.cultural_regional_variations && (
            <div>
              <span className="font-semibold">• Cultural & Regional Variations:</span>
              <p className="text-muted-foreground ml-4">{wordProfile.etymology.cultural_regional_variations}</p>
            </div>
          )}
        </div>
      </WordSection>

      {/* Definitions */}
      <WordSection title="Definitions">
        <div className="space-y-6">
          {/* Primary Definition */}
          {wordProfile.definitions.primary && (
            <div>
              <h4 className="font-semibold text-lg mb-2">• Primary Definition:</h4>
              <p className="text-muted-foreground ml-6">{wordProfile.definitions.primary}</p>
            </div>
          )}

          {/* Standard Definitions */}
          {wordProfile.definitions.standard && wordProfile.definitions.standard.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2">• Standard Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.standard.map((def, index) => (
                  <div key={index}>
                    <span className="font-medium">**{getOrdinal(index + 1)} Definition:**</span>
                    <span className="text-muted-foreground ml-2">{def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extended Definitions */}
          {wordProfile.definitions.extended && wordProfile.definitions.extended.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2">• Extended Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.extended.map((def, index) => (
                  <div key={index}>
                    <span className="font-medium">**{getOrdinal(wordProfile.definitions.standard?.length + index + 1 || index + 1)} Definition:**</span>
                    <span className="text-muted-foreground ml-2">{def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Definitions */}
          {wordProfile.definitions.contextual && wordProfile.definitions.contextual.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2">• Contextual Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.contextual.map((def, index) => (
                  <p key={index} className="text-muted-foreground">{def}</p>
                ))}
              </div>
            </div>
          )}

          {/* Specialized Definitions */}
          {wordProfile.definitions.specialized && wordProfile.definitions.specialized.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2">• Specialized Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.specialized.map((def, index) => (
                  <p key={index} className="text-muted-foreground">{def}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </WordSection>

      {/* Word Forms & Inflections */}
      <WordSection title="Word Forms & Inflections">
        <div className="space-y-4">
          {/* Noun Forms */}
          {wordProfile.word_forms.noun_forms && (
            <div>
              <span className="font-semibold">• Noun Forms (if applicable):</span>
              <div className="ml-6 mt-2 space-y-1">
                {wordProfile.word_forms.noun_forms.singular && (
                  <div>
                    <span className="font-medium">**Singular:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.noun_forms.singular}</span>
                  </div>
                )}
                {wordProfile.word_forms.noun_forms.plural && (
                  <div>
                    <span className="font-medium">**Plural:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.noun_forms.plural}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adjective Forms */}
          {wordProfile.word_forms.adjective_forms && (
            <div>
              <span className="font-semibold">• Adjective Forms (if applicable):</span>
              <div className="ml-6 mt-2 space-y-1">
                {wordProfile.word_forms.adjective_forms.positive && (
                  <div>
                    <span className="font-medium">**Positive:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.adjective_forms.positive}</span>
                  </div>
                )}
                {wordProfile.word_forms.adjective_forms.comparative && (
                  <div>
                    <span className="font-medium">**Comparative:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.adjective_forms.comparative}</span>
                  </div>
                )}
                {wordProfile.word_forms.adjective_forms.superlative && (
                  <div>
                    <span className="font-medium">**Superlative:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.adjective_forms.superlative}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Inflections */}
          {wordProfile.word_forms.other_inflections && wordProfile.word_forms.other_inflections.length > 0 && (
            <div>
              <span className="font-semibold">• Other Inflections (if applicable):</span>
              <div className="ml-6 mt-2">
                {wordProfile.word_forms.adverb_form && (
                  <div>
                    <span className="font-medium">**Adverb Form:**</span>
                    <span className="text-muted-foreground ml-2">{wordProfile.word_forms.adverb_form}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </WordSection>

      {/* Analysis of the Word */}
      <WordSection title="Analysis of the Word">
        <div className="space-y-4">
          {wordProfile.analysis.parts_of_speech && (
            <div>
              <span className="font-semibold">• Parts of Speech:</span>
              <span className="text-muted-foreground ml-2">{wordProfile.analysis.parts_of_speech}</span>
            </div>
          )}

          {wordProfile.analysis.contextual_usage && (
            <div>
              <span className="font-semibold">• Contextual Usage:</span>
              <p className="text-muted-foreground ml-4">{wordProfile.analysis.contextual_usage}</p>
            </div>
          )}

          {wordProfile.synonymsAntonyms && (
            <div>
              <span className="font-semibold">• Synonyms & Antonyms:</span>
              <div className="ml-6 mt-2 space-y-2">
                {wordProfile.synonymsAntonyms.synonyms && wordProfile.synonymsAntonyms.synonyms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">- Synonyms: {wordProfile.synonymsAntonyms.synonyms.join(', ')}</span>
                  </div>
                )}
                {wordProfile.synonymsAntonyms.antonyms && wordProfile.synonymsAntonyms.antonyms.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">- Antonyms: {wordProfile.synonymsAntonyms.antonyms.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {wordProfile.usage.commonCollocations && wordProfile.usage.commonCollocations.length > 0 && (
            <div>
              <span className="font-semibold">• Common Collocations:</span>
              <span className="text-muted-foreground ml-2">{wordProfile.usage.commonCollocations.join(', ')}</span>
            </div>
          )}

          {wordProfile.analysis.cultural_historical_significance && (
            <div>
              <span className="font-semibold">• Cultural & Historical Significance:</span>
              <p className="text-muted-foreground ml-4">{wordProfile.analysis.cultural_historical_significance}</p>
            </div>
          )}

          {wordProfile.analysis.example && (
            <div>
              <span className="font-semibold">• Example:</span>
              <p className="text-muted-foreground ml-4 italic">"{wordProfile.analysis.example}"</p>
            </div>
          )}
        </div>
      </WordSection>

      {/* Footer */}
      <Separator className="my-8" />
      <div className="text-center text-sm text-muted-foreground">
        <p>Feel free to ask if you would like further information or word analysis.</p>
      </div>
    </div>
  );
};

// Helper function to get ordinal numbers
const getOrdinal = (num: number): string => {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
  return ordinals[num - 1] || `${num}th`;
};

export default EnhancedWordContent;
