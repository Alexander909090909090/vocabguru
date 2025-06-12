
import { WordProfileService } from "@/services/wordProfileService";
import { default as wordsData } from "@/data/words";
import { WordProfile } from "@/types/wordProfile";

export class DataMigration {
  static async migrateExistingWords(): Promise<void> {
    console.log('Starting migration of existing words to new database schema...');

    for (const word of wordsData) {
      try {
        // Check if word already exists
        const existing = await WordProfileService.getWordProfile(word.word);
        if (existing) {
          console.log(`Word "${word.word}" already exists, skipping...`);
          continue;
        }

        // Convert to new WordProfile format
        const wordProfile: Partial<WordProfile> = {
          word: word.word,
          morpheme_breakdown: {
            prefix: word.morphemeBreakdown.prefix ? {
              text: word.morphemeBreakdown.prefix.text,
              meaning: word.morphemeBreakdown.prefix.meaning,
              origin: ''
            } : undefined,
            root: {
              text: word.morphemeBreakdown.root.text,
              meaning: word.morphemeBreakdown.root.meaning
            },
            suffix: word.morphemeBreakdown.suffix ? {
              text: word.morphemeBreakdown.suffix.text,
              meaning: word.morphemeBreakdown.suffix.meaning,
              origin: ''
            } : undefined
          },
          etymology: {
            historical_origins: word.etymology.origin || '',
            language_of_origin: word.languageOrigin || 'Unknown',
            word_evolution: word.etymology.evolution || '',
            cultural_regional_variations: ''
          },
          definitions: {
            primary: word.description,
            standard: word.definitions?.map(def => def.text) || [],
            extended: [],
            contextual: word.usage.contextualUsage || '',
            specialized: ''
          },
          word_forms: {
            base_form: word.word,
            verb_tenses: {
              present: word.forms?.verb || '',
              past: '',
              future: '',
              present_participle: '',
              past_participle: '',
              other: ''
            },
            noun_forms: {
              singular: word.forms?.noun || '',
              plural: ''
            },
            adjective_forms: {
              positive: word.forms?.adjective || '',
              comparative: '',
              superlative: ''
            },
            adverb_form: word.forms?.adverb || '',
            other_inflections: ''
          },
          analysis: {
            parts_of_speech: word.partOfSpeech || '',
            tenses_voice_mood: '',
            articles_determiners: '',
            sentence_positions: '',
            sentence_structure: '',
            contextual_usage: word.usage.contextualUsage || '',
            synonyms_antonyms: `Synonyms: ${word.synonymsAntonyms.synonyms?.join(', ') || 'None'}. Antonyms: ${word.synonymsAntonyms.antonyms?.join(', ') || 'None'}`,
            common_collocations: word.usage.commonCollocations?.join(', ') || '',
            cultural_historical_significance: '',
            example: word.usage.exampleSentence || ''
          }
        };

        // Create word profile
        await WordProfileService.createWordProfile(wordProfile);
        console.log(`Successfully migrated word: ${word.word}`);

      } catch (error) {
        console.error(`Error migrating word "${word.word}":`, error);
      }
    }

    console.log('Migration completed!');
  }
}
