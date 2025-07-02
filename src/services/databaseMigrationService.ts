
import { supabase } from '@/integrations/supabase/client';
import { WordProfile } from '@/types/wordProfile';
import words from '@/data/words';
import { toast } from 'sonner';

export class DatabaseMigrationService {
  static async checkMigrationStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('count(*)')
        .single();

      if (error) {
        console.error('Error checking migration status:', error);
        return false;
      }

      return (data?.count || 0) > 0;
    } catch (error) {
      console.error('Migration status check failed:', error);
      return false;
    }
  }

  static async initializeDatabase(): Promise<void> {
    try {
      console.log('🚀 Starting database migration...');
      
      // Convert legacy words to word profiles
      const profiles: Partial<WordProfile>[] = words.map(word => ({
        word: word.word,
        morpheme_breakdown: word.morphemeBreakdown || {
          root: { text: word.word, meaning: word.description }
        },
        etymology: {
          historical_origins: word.etymology?.origin || 'Unknown origin',
          language_of_origin: word.languageOrigin || 'Unknown',
          word_evolution: word.etymology?.evolution || '',
          cultural_regional_variations: word.etymology?.culturalVariations || ''
        },
        definitions: {
          primary: word.description,
          standard: word.definitions?.filter(d => d.type === 'standard').map(d => d.text) || [],
          extended: word.definitions?.filter(d => d.type === 'extended').map(d => d.text) || [],
          contextual: word.definitions?.find(d => d.type === 'contextual')?.text || '',
          specialized: word.definitions?.find(d => d.type === 'specialized')?.text || ''
        },
        word_forms: {
          base_form: word.word,
          noun_forms: word.forms?.noun ? { singular: word.forms.noun } : undefined,
          verb_tenses: word.forms?.verb ? { present: word.forms.verb } : undefined,
          adjective_forms: word.forms?.adjective ? { positive: word.forms.adjective } : undefined,
          adverb_form: word.forms?.adverb,
          other_inflections: ''
        },
        analysis: {
          parts_of_speech: word.partOfSpeech,
          contextual_usage: word.usage?.contextualUsage || '',
          sentence_structure: word.usage?.sentenceStructure || '',
          synonyms_antonyms: JSON.stringify(word.synonymsAntonyms || { synonyms: [], antonyms: [] }),
          common_collocations: Array.isArray(word.usage?.commonCollocations) 
            ? word.usage.commonCollocations.join(', ')
            : word.usage?.commonCollocations || '',
          example: word.usage?.exampleSentence || ''
        }
      }));

      // Insert in batches to avoid overwhelming the database
      const batchSize = 10;
      let inserted = 0;

      for (let i = 0; i < profiles.length; i += batchSize) {
        const batch = profiles.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('word_profiles')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
          continue;
        }

        inserted += batch.length;
        console.log(`✅ Migrated ${inserted}/${profiles.length} words`);
      }

      console.log('🎉 Database migration completed!');
      toast.success(`Successfully migrated ${inserted} words to database`);
    } catch (error) {
      console.error('Database migration failed:', error);
      toast.error('Database migration failed');
      throw error;
    }
  }

  static async getMigrationStats(): Promise<{
    totalWords: number;
    migratedWords: number;
    completionPercentage: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('word_profiles')
        .select('count(*)')
        .single();

      if (error) throw error;

      const migratedWords = data?.count || 0;
      const totalWords = words.length;

      return {
        totalWords,
        migratedWords,
        completionPercentage: totalWords > 0 ? (migratedWords / totalWords) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting migration stats:', error);
      return { totalWords: words.length, migratedWords: 0, completionPercentage: 0 };
    }
  }
}
