
import React, { useEffect } from 'react';
import { VocabularyTable } from '@/components/VocabularyTable/VocabularyTable';
import { WordService } from '@/services/wordService';

const VocabularyTablePage = () => {
  useEffect(() => {
    // Initialize database and add the superfluous example if needed
    const initializeWithExample = async () => {
      try {
        // Check if "superfluous" already exists
        const existing = await WordService.getWordByName('superfluous');
        
        if (!existing) {
          // Add the comprehensive "superfluous" example
          const superfluousWord = {
            word: 'superfluous',
            partOfSpeech: 'adjective',
            languageOrigin: 'Latin',
            pronunciation: 'suːˈpɜːrfluəs',
            morpheme_breakdown: {
              prefix: {
                text: 'super-',
                meaning: 'above or over',
                origin: 'Latin "super"'
              },
              root: {
                text: 'fluere',
                meaning: 'to flow',
                origin: 'Latin "fluere"'
              },
              suffix: {
                text: '-ous',
                meaning: 'full of or having the qualities of',
                origin: 'English suffix'
              }
            },
            etymology: {
              historical_origins: 'The word "superfluous" came into English in the late Middle Ages, derived from the Latin "superfluus," which combines "super" (above) and "fluere" (to flow). The term originally described something that overflowed or was excessive.',
              language_of_origin: 'Latin',
              word_evolution: 'Over time, "superfluous" evolved to describe not only physical overflow but also abstract concepts—something that is unnecessary or excessive.',
              cultural_variations: 'While the term is consistently used in English, it often appears in formal or academic contexts.'
            },
            definitions: {
              primary: 'Unnecessary, especially through being more than enough; excessive.',
              standard: [
                'More than is needed or required; excessive in quantity or quality.',
                'Having no useful purpose; serving no practical function.',
                'Overflowing; providing more than what is needed.'
              ],
              extended: [
                'In literature, it can refer to superabundant imagery or language that does not contribute to the primary meaning or theme.',
                'In legal or technical contexts, it may indicate redundancy in terms or provisions.'
              ],
              contextual: [
                'In business, it might refer to excess inventory that does not fulfill a demand.'
              ],
              specialized: [
                'In rhetorical analysis, a superfluous phrase can refer to unnecessary words that detract from clarity.'
              ]
            },
            word_forms: {
              base_form: 'superfluous',
              noun_forms: {
                singular: 'superfluity',
                plural: 'superfluities'
              },
              adjective_forms: {
                positive: 'superfluous',
                comparative: 'more superfluous',
                superlative: 'most superfluous'
              },
              adverb_form: 'superfluously',
              other_inflections: ['superfluousness (noun)']
            },
            analysis: {
              parts_of_speech: 'adjective',
              synonyms: ['unnecessary', 'excessive', 'redundant', 'surplus', 'extra'],
              antonyms: ['essential', 'necessary', 'required', 'vital', 'indispensable'],
              collocations: ['superfluous details', 'superfluous information', 'superfluous spending', 'superfluous elements'],
              cultural_significance: 'Often used in critiques, the word reflects the value of brevity and clarity in communication, particularly in academic and literary contexts.',
              example_sentence: 'The professor cautioned against superfluous arguments in his students\' essays.'
            }
          };

          await WordService.createWord(superfluousWord);
          console.log('Added superfluous example to database');
        }
      } catch (error) {
        console.error('Error initializing example word:', error);
      }
    };

    initializeWithExample();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <VocabularyTable />
    </div>
  );
};

export default VocabularyTablePage;
