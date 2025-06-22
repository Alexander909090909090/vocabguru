
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import WordSection from "@/components/WordSection";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface EnhancedWordContentProps {
  wordProfile: EnhancedWordProfile;
}

const EnhancedWordContent = ({ wordProfile }: EnhancedWordContentProps) => {
  // Safely access morpheme breakdown with fallback
  const morphemeBreakdown = wordProfile.morpheme_breakdown || wordProfile.morphemeBreakdown || {
    root: { text: wordProfile.word, meaning: 'Root meaning not available' }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Given Word Header */}
      <div className="text-center border-b border-white/20 pb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Given Word</h1>
        <h2 className="text-3xl font-semibold text-primary">{wordProfile.word}</h2>
      </div>

      {/* Morpheme Breakdown */}
      <WordSection title="Morpheme Breakdown">
        <div className="space-y-4">
          {morphemeBreakdown.prefix && (
            <div className="flex gap-2">
              <span className="font-semibold min-w-20 text-white">• Prefix:</span>
              <div>
                <span className="font-medium text-primary">{morphemeBreakdown.prefix.text}</span>
                <span className="text-white/70"> - {morphemeBreakdown.prefix.meaning}</span>
                {morphemeBreakdown.prefix.origin && (
                  <span className="text-sm text-white/60 block ml-4">
                    Origin: {morphemeBreakdown.prefix.origin}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <span className="font-semibold min-w-20 text-white">• Root Word:</span>
            <div>
              <span className="font-medium text-primary">{morphemeBreakdown.root.text}</span>
              <span className="text-white/70"> - {morphemeBreakdown.root.meaning}</span>
              {morphemeBreakdown.root.origin && (
                <span className="text-sm text-white/60 block ml-4">
                  Origin: {morphemeBreakdown.root.origin}
                </span>
              )}
            </div>
          </div>
          
          {morphemeBreakdown.suffix && (
            <div className="flex gap-2">
              <span className="font-semibold min-w-20 text-white">• Suffix:</span>
              <div>
                <span className="font-medium text-primary">{morphemeBreakdown.suffix.text}</span>
                <span className="text-white/70"> - {morphemeBreakdown.suffix.meaning}</span>
                {morphemeBreakdown.suffix.origin && (
                  <span className="text-sm text-white/60 block ml-4">
                    Origin: {morphemeBreakdown.suffix.origin}
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
              <span className="font-semibold text-white">• Historical Origins:</span>
              <p className="text-white/70 ml-4">{wordProfile.etymology.historical_origins}</p>
            </div>
          )}
          
          {wordProfile.etymology.language_of_origin && (
            <div>
              <span className="font-semibold text-white">• Language of Origin:</span>
              <span className="text-white/70 ml-2">{wordProfile.etymology.language_of_origin}</span>
            </div>
          )}
          
          {wordProfile.etymology.word_evolution && (
            <div>
              <span className="font-semibold text-white">• Word Evolution:</span>
              <p className="text-white/70 ml-4">{wordProfile.etymology.word_evolution}</p>
            </div>
          )}
          
          {wordProfile.etymology.cultural_regional_variations && (
            <div>
              <span className="font-semibold text-white">• Cultural & Regional Variations:</span>
              <p className="text-white/70 ml-4">{wordProfile.etymology.cultural_regional_variations}</p>
            </div>
          )}
        </div>
      </WordSection>

      {/* Definitions */}
      <WordSection title="Definitions">
        <div className="space-y-6">
          {wordProfile.definitions.primary && (
            <div>
              <h4 className="font-semibold text-lg mb-2 text-white">• Primary Definition:</h4>
              <p className="text-white/70 ml-6">{wordProfile.definitions.primary}</p>
            </div>
          )}

          {wordProfile.definitions.standard && wordProfile.definitions.standard.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2 text-white">• Standard Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.standard.map((def, index) => (
                  <div key={index}>
                    <span className="font-medium text-primary">**{getOrdinal(index + 1)} Definition:**</span>
                    <span className="text-white/70 ml-2">{def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordProfile.definitions.extended && wordProfile.definitions.extended.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2 text-white">• Extended Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.extended.map((def, index) => (
                  <div key={index}>
                    <span className="font-medium text-primary">**{getOrdinal(wordProfile.definitions.standard?.length + index + 1 || index + 1)} Definition:**</span>
                    <span className="text-white/70 ml-2">{def}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wordProfile.definitions.contextual && wordProfile.definitions.contextual.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2 text-white">• Contextual Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.contextual.map((def, index) => (
                  <p key={index} className="text-white/70">{def}</p>
                ))}
              </div>
            </div>
          )}

          {wordProfile.definitions.specialized && wordProfile.definitions.specialized.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2 text-white">• Specialized Definitions:</h4>
              <div className="ml-6 space-y-2">
                {wordProfile.definitions.specialized.map((def, index) => (
                  <p key={index} className="text-white/70">{def}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </WordSection>

      {/* Word Forms & Inflections */}
      <WordSection title="Word Forms & Inflections">
        <div className="space-y-4">
          {wordProfile.word_forms.noun_forms && (
            <div>
              <span className="font-semibold text-white">• Noun Forms (if applicable):</span>
              <div className="ml-6 mt-2 space-y-1">
                {wordProfile.word_forms.noun_forms.singular && (
                  <div>
                    <span className="font-medium text-primary">**Singular:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.noun_forms.singular}</span>
                  </div>
                )}
                {wordProfile.word_forms.noun_forms.plural && (
                  <div>
                    <span className="font-medium text-primary">**Plural:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.noun_forms.plural}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {wordProfile.word_forms.adjective_forms && (
            <div>
              <span className="font-semibold text-white">• Adjective Forms (if applicable):</span>
              <div className="ml-6 mt-2 space-y-1">
                {wordProfile.word_forms.adjective_forms.positive && (
                  <div>
                    <span className="font-medium text-primary">**Positive:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.adjective_forms.positive}</span>
                  </div>
                )}
                {wordProfile.word_forms.adjective_forms.comparative && (
                  <div>
                    <span className="font-medium text-primary">**Comparative:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.adjective_forms.comparative}</span>
                  </div>
                )}
                {wordProfile.word_forms.adjective_forms.superlative && (
                  <div>
                    <span className="font-medium text-primary">**Superlative:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.adjective_forms.superlative}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {wordProfile.word_forms.other_inflections && wordProfile.word_forms.other_inflections.length > 0 && (
            <div>
              <span className="font-semibold text-white">• Other Inflections (if applicable):</span>
              <div className="ml-6 mt-2">
                {wordProfile.word_forms.adverb_form && (
                  <div>
                    <span className="font-medium text-primary">**Adverb Form:**</span>
                    <span className="text-white/70 ml-2">{wordProfile.word_forms.adverb_form}</span>
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
              <span className="font-semibold text-white">• Parts of Speech:</span>
              <span className="text-white/70 ml-2">{wordProfile.analysis.parts_of_speech}</span>
            </div>
          )}

          {wordProfile.analysis.contextual_usage && (
            <div>
              <span className="font-semibold text-white">• Contextual Usage:</span>
              <p className="text-white/70 ml-4">{wordProfile.analysis.contextual_usage}</p>
            </div>
          )}

          {wordProfile.synonymsAntonyms && (
            <div>
              <span className="font-semibold text-white">• Synonyms & Antonyms:</span>
              <div className="ml-6 mt-2 space-y-2">
                {wordProfile.synonymsAntonyms.synonyms && wordProfile.synonymsAntonyms.synonyms.length > 0 && (
                  <div>
                    <span className="text-white/70">- Synonyms: {wordProfile.synonymsAntonyms.synonyms.join(', ')}</span>
                  </div>
                )}
                {wordProfile.synonymsAntonyms.antonyms && wordProfile.synonymsAntonyms.antonyms.length > 0 && (
                  <div>
                    <span className="text-white/70">- Antonyms: {wordProfile.synonymsAntonyms.antonyms.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {wordProfile.usage.commonCollocations && wordProfile.usage.commonCollocations.length > 0 && (
            <div>
              <span className="font-semibold text-white">• Common Collocations:</span>
              <span className="text-white/70 ml-2">{wordProfile.usage.commonCollocations.join(', ')}</span>
            </div>
          )}

          {wordProfile.analysis.cultural_historical_significance && (
            <div>
              <span className="font-semibold text-white">• Cultural & Historical Significance:</span>
              <p className="text-white/70 ml-4">{wordProfile.analysis.cultural_historical_significance}</p>
            </div>
          )}

          {wordProfile.analysis.example && (
            <div>
              <span className="font-semibold text-white">• Example:</span>
              <p className="text-white/70 ml-4 italic">"{wordProfile.analysis.example}"</p>
            </div>
          )}
        </div>
      </WordSection>

      <Separator className="my-8 bg-white/20" />
      <div className="text-center text-sm text-white/60">
        <p>Feel free to ask if you would like further information or word analysis.</p>
      </div>
    </div>
  );
};

const getOrdinal = (num: number): string => {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
  return ordinals[num - 1] || `${num}th`;
};

export default EnhancedWordContent;
