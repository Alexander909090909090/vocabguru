
import { supabase } from "@/integrations/supabase/client";
import { WordProfile } from "@/types/wordProfile";
import { Word } from "@/data/words";
import { words as legacyWords } from "@/data/words";
import { EnhancedDatabaseSeeding } from "./enhancedDatabaseSeeding";
import { toast } from "@/components/ui/use-toast";

export class DatabaseMigrationService {
  // Check if database has been migrated
  static async checkMigrationStatus(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error checking migration status:', error);
        return false;
      }

      // Consider migrated if we have more than 10 words
      return (count || 0) > 10;
    } catch (error) {
      console.error('Error in migration status check:', error);
      return false;
    }
  }

  // Migrate legacy words to database
  static async migrateLegacyWords(): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failureCount = 0;

    console.log('🔄 Starting legacy word migration...');

    for (const legacyWord of legacyWords) {
      try {
        // Check if word already exists
        const { data: existingWord } = await supabase
          .from('word_profiles')
          .select('id')
          .eq('word', legacyWord.word.toLowerCase())
          .maybeSingle();

        if (existingWord) {
          console.log(`⏭️ Skipping existing word: ${legacyWord.word}`);
          continue;
        }

        // Convert legacy word to WordProfile format
        const wordProfile: Partial<WordProfile> = {
          word: legacyWord.word.toLowerCase(),
          morpheme_breakdown: legacyWord.morphemeBreakdown,
          etymology: {
            historical_origins: legacyWord.etymology.origin,
            language_of_origin: legacyWord.languageOrigin,
            word_evolution: legacyWord.etymology.evolution,
            cultural_regional_variations: legacyWord.etymology.culturalVariations
          },
          definitions: {
            primary: legacyWord.definitions.find(d => d.type === 'primary')?.text || legacyWord.description,
            standard: legacyWord.definitions.filter(d => d.type === 'standard').map(d => d.text),
            extended: legacyWord.definitions.filter(d => d.type === 'extended').map(d => d.text),
            contextual: legacyWord.definitions.find(d => d.type === 'contextual')?.text || '',
            specialized: legacyWord.definitions.find(d => d.type === 'specialized')?.text || ''
          },
          word_forms: {
            base_form: legacyWord.word,
            noun_forms: legacyWord.forms.noun ? { singular: legacyWord.forms.noun } : undefined,
            verb_tenses: legacyWord.forms.verb ? { present: legacyWord.forms.verb } : undefined,
            adjective_forms: legacyWord.forms.adjective ? { positive: legacyWord.forms.adjective } : undefined,
            adverb_form: legacyWord.forms.adverb,
            other_inflections: ''
          },
          analysis: {
            parts_of_speech: legacyWord.partOfSpeech,
            contextual_usage: legacyWord.usage.contextualUsage,
            sentence_structure: legacyWord.usage.sentenceStructure,
            common_collocations: legacyWord.usage.commonCollocations?.join(', ') || '',
            example: legacyWord.usage.exampleSentence,
            synonyms_antonyms: JSON.stringify(legacyWord.synonymsAntonyms)
          }
        };

        // Insert into database
        const { error } = await supabase
          .from('word_profiles')
          .insert(wordProfile);

        if (error) {
          console.error(`❌ Failed to migrate word "${legacyWord.word}":`, error);
          failureCount++;
        } else {
          console.log(`✅ Migrated word: ${legacyWord.word}`);
          successCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Error migrating word "${legacyWord.word}":`, error);
        failureCount++;
      }
    }

    console.log(`🏁 Migration completed: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failed: failureCount };
  }

  // Full database initialization
  static async initializeDatabase(): Promise<void> {
    try {
      const isMigrated = await this.checkMigrationStatus();
      
      if (isMigrated) {
        console.log('✅ Database already initialized');
        return;
      }

      console.log('🚀 Starting database initialization...');
      
      // Step 1: Migrate legacy words
      const legacyResults = await this.migrateLegacyWords();
      
      // Step 2: Seed additional words if needed
      const currentCount = await EnhancedDatabaseSeeding.getComprehensiveWordCount();
      
      if (currentCount < 50) {
        console.log('📚 Adding essential vocabulary...');
        await EnhancedDatabaseSeeding.quickSeed();
      }

      const finalCount = await EnhancedDatabaseSeeding.getComprehensiveWordCount();
      
      toast({
        title: "Database initialized successfully",
        description: `${finalCount} words are now available in your vocabulary collection.`,
      });

      console.log(`🎉 Database initialization complete! Total words: ${finalCount}`);
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      toast({
        title: "Database initialization failed",
        description: "Please try refreshing the page or contact support.",
        variant: "destructive"
      });
      throw error;
    }
  }

  // Get migration statistics
  static async getMigrationStats(): Promise<{
    totalWords: number;
    legacyWords: number;
    apiWords: number;
    qualityScore: number;
  }> {
    try {
      const { count: totalWords } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      const { data: qualityData } = await supabase
        .from('word_profiles')
        .select('quality_score')
        .not('quality_score', 'is', null);

      const avgQuality = qualityData?.length ? 
        qualityData.reduce((sum, row) => sum + (row.quality_score || 0), 0) / qualityData.length : 0;

      return {
        totalWords: totalWords || 0,
        legacyWords: legacyWords.length,
        apiWords: Math.max(0, (totalWords || 0) - legacyWords.length),
        qualityScore: Math.round(avgQuality * 100) / 100
      };
    } catch (error) {
      console.error('Error getting migration stats:', error);
      return { totalWords: 0, legacyWords: 0, apiWords: 0, qualityScore: 0 };
    }
  }
}
