
import { Word } from "@/data/words";
import WordSection from "@/components/WordSection";
import ImageGallery from "@/components/ImageGallery";
import { Separator } from "@/components/ui/separator";

interface WordMainContentProps {
  word: Word;
}

const WordMainContent = ({ word }: WordMainContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div>
        {/* Primary Definition */}
        <WordSection title="Primary Definition">
          <p>{word.definitions.find(d => d.type === 'primary')?.text}</p>
        </WordSection>
        
        {/* Standard Definitions */}
        {word.definitions.filter(d => d.type === 'standard').length > 0 && (
          <WordSection title="Standard Definitions">
            <ul className="space-y-2">
              {word.definitions
                .filter(d => d.type === 'standard')
                .map((def, index) => (
                  <li key={index} className="flex gap-2">
                    <div className="chip bg-primary/20 h-6 w-6 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <span>{def.text}</span>
                  </li>
                ))}
            </ul>
          </WordSection>
        )}
        
        {/* Extended Definitions */}
        {word.definitions.filter(d => d.type === 'extended').length > 0 && (
          <WordSection title="Extended Definitions">
            <ul className="space-y-2">
              {word.definitions
                .filter(d => d.type === 'extended')
                .map((def, index) => (
                  <li key={index} className="flex gap-2">
                    <div className="chip bg-primary/20 h-6 w-6 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <span>{def.text}</span>
                  </li>
                ))}
            </ul>
          </WordSection>
        )}
        
        {/* Etymology */}
        <WordSection title="Etymology">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Historical Origin</h4>
              <p className="text-sm text-muted-foreground">{word.etymology.origin}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium">Word Evolution</h4>
              <p className="text-sm text-muted-foreground">{word.etymology.evolution}</p>
            </div>
            
            {word.etymology.culturalVariations && (
              <div>
                <h4 className="text-sm font-medium">Cultural Variations</h4>
                <p className="text-sm text-muted-foreground">{word.etymology.culturalVariations}</p>
              </div>
            )}
          </div>
        </WordSection>
        
        {/* Word Forms */}
        <WordSection title="Word Forms">
          <div className="grid grid-cols-2 gap-3">
            {word.forms.noun && (
              <div className="glass-card rounded-md p-3 bg-secondary/30">
                <h4 className="text-xs font-medium text-muted-foreground">Noun</h4>
                <p className="font-medium">{word.forms.noun}</p>
              </div>
            )}
            
            {word.forms.verb && (
              <div className="glass-card rounded-md p-3 bg-secondary/30">
                <h4 className="text-xs font-medium text-muted-foreground">Verb</h4>
                <p className="font-medium">{word.forms.verb}</p>
              </div>
            )}
            
            {word.forms.adjective && (
              <div className="glass-card rounded-md p-3 bg-secondary/30">
                <h4 className="text-xs font-medium text-muted-foreground">Adjective</h4>
                <p className="font-medium">{word.forms.adjective}</p>
              </div>
            )}
            
            {word.forms.adverb && (
              <div className="glass-card rounded-md p-3 bg-secondary/30">
                <h4 className="text-xs font-medium text-muted-foreground">Adverb</h4>
                <p className="font-medium">{word.forms.adverb}</p>
              </div>
            )}
          </div>
        </WordSection>
      </div>
      
      <div>
        {/* Usage */}
        <WordSection title="Common Collocations">
          <div className="flex flex-wrap gap-2">
            {word.usage.commonCollocations.map((collocation, index) => (
              <span key={index} className="chip bg-secondary text-secondary-foreground">
                {collocation}
              </span>
            ))}
          </div>
        </WordSection>
        
        {/* Contextual Usage */}
        <WordSection title="Contextual Usage">
          <p>{word.usage.contextualUsage}</p>
        </WordSection>
        
        {/* Sentence Structure */}
        {word.usage.sentenceStructure && (
          <WordSection title="Sentence Structure">
            <p>{word.usage.sentenceStructure}</p>
          </WordSection>
        )}
        
        {/* Example Sentence */}
        <WordSection title="Example Sentence">
          <p className="italic">{word.usage.exampleSentence}</p>
        </WordSection>
        
        {/* Synonyms & Antonyms */}
        <WordSection title="Synonyms & Antonyms">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Synonyms</h4>
              <div className="flex flex-wrap gap-2">
                {word.synonymsAntonyms.synonyms.map((synonym, index) => (
                  <span key={index} className="chip bg-primary/20 text-primary-foreground">
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
            
            <Separator className="bg-white/5" />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Antonyms</h4>
              <div className="flex flex-wrap gap-2">
                {word.synonymsAntonyms.antonyms.map((antonym, index) => (
                  <span key={index} className="chip bg-secondary text-secondary-foreground">
                    {antonym}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </WordSection>
        
        {/* Image Gallery */}
        {word.images.length > 0 && (
          <WordSection title="Image Gallery">
            <ImageGallery images={word.images} />
          </WordSection>
        )}
        
        {/* Contextual Definitions */}
        {word.definitions.filter(d => d.type === 'contextual').length > 0 && (
          <WordSection title="Contextual Definitions">
            <ul className="space-y-2">
              {word.definitions
                .filter(d => d.type === 'contextual')
                .map((def, index) => (
                  <li key={index}>{def.text}</li>
                ))}
            </ul>
          </WordSection>
        )}
      </div>
    </div>
  );
};

export default WordMainContent;
