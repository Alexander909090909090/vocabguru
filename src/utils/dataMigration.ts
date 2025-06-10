
import { WordProfileService } from "@/services/wordProfileService";
import words from "@/data/words";
import { Definition } from "@/types/wordProfile";

export class DataMigration {
  static async migrateExistingWords(): Promise<void> {
    console.log('Starting migration of existing words to database...');

    for (const word of words) {
      try {
        // Check if word already exists
        const existing = await WordProfileService.getWordProfile(word.word);
        if (existing) {
          console.log(`Word "${word.word}" already exists, skipping...`);
          continue;
        }

        // Convert definitions
        const definitions: Definition[] = [
          { type: 'primary', text: word.description }
        ];

        // Add standard definitions
        word.definitions?.forEach(def => {
          definitions.push({
            type: def.type as Definition['type'],
            text: def.text
          });
        });

        // Prepare webhook payload
        const payload = {
          word: word.word,
          morphemes: {
            prefix: word.morphemeBreakdown.prefix ? {
              text: word.morphemeBreakdown.prefix.text,
              meaning: word.morphemeBreakdown.prefix.meaning
            } : undefined,
            root: {
              text: word.morphemeBreakdown.root.text,
              meaning: word.morphemeBreakdown.root.meaning
            },
            suffix: word.morphemeBreakdown.suffix ? {
              text: word.morphemeBreakdown.suffix.text,
              meaning: word.morphemeBreakdown.suffix.meaning
            } : undefined
          },
          definitions,
          etymology: {
            origin: word.etymology.origin || '',
            evolution: word.etymology.evolution || ''
          },
          forms: word.forms,
          usage: {
            collocations: word.usage.commonCollocations || [],
            contextual_usage: word.usage.contextualUsage || '',
            example_sentence: word.usage.exampleSentence || ''
          },
          synonyms: word.synonymsAntonyms.synonyms || [],
          antonyms: word.synonymsAntonyms.antonyms || [],
          metadata: {
            frequency_score: 0,
            difficulty_level: 'intermediate' as const,
            language_origin: word.languageOrigin || 'Unknown',
            part_of_speech: word.partOfSpeech || '',
            pronunciation: word.pronunciation || ''
          }
        };

        // Process through webhook system
        await WordProfileService.processWebhook('migration', payload);
        console.log(`Successfully migrated word: ${word.word}`);

      } catch (error) {
        console.error(`Error migrating word "${word.word}":`, error);
      }
    }

    console.log('Migration completed!');
  }
}
