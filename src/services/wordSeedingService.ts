
import { DictionaryApiService } from './dictionaryApiService';
import { supabase } from "@/integrations/supabase/client";

export class WordSeedingService {
  // Check if database has any words
  static async isDatabaseEmpty(): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error checking database:', error);
        return true;
      }

      console.log(`Database contains ${count || 0} words`);
      return (count || 0) === 0;
    } catch (error) {
      console.error('Error checking if database is empty:', error);
      return true;
    }
  }

  // Get word count
  static async getWordCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting word count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting word count:', error);
      return 0;
    }
  }

  // Seed essential vocabulary words
  static async seedEssentialWords(): Promise<void> {
    const essentialWords = [
      // Basic vocabulary
      'amazing', 'beautiful', 'creative', 'delicious', 'exciting',
      'fantastic', 'gorgeous', 'helpful', 'incredible', 'joyful',
      
      // Academic words
      'analyze', 'construct', 'develop', 'establish', 'factor',
      'generate', 'identify', 'justify', 'maintain', 'obtain',
      
      // Professional words
      'collaborate', 'communicate', 'coordinate', 'demonstrate', 'evaluate',
      'facilitate', 'implement', 'negotiate', 'organize', 'prioritize',
      
      // Advanced vocabulary
      'eloquent', 'profound', 'sophisticated', 'comprehensive', 'innovative',
      'meticulous', 'resilient', 'strategic', 'systematic', 'versatile'
    ];

    console.log(`Seeding ${essentialWords.length} essential words...`);

    let successCount = 0;
    let failureCount = 0;

    for (const word of essentialWords) {
      try {
        const success = await DictionaryApiService.fetchAndStoreWord(word);
        if (success) {
          successCount++;
          console.log(`✅ Seeded: ${word} (${successCount}/${essentialWords.length})`);
        } else {
          failureCount++;
          console.log(`❌ Failed: ${word}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failureCount++;
        console.error(`Error seeding word "${word}":`, error);
      }
    }

    console.log(`Seeding completed: ${successCount} success, ${failureCount} failures`);
  }

  // Initialize database with words if empty
  static async initializeIfEmpty(): Promise<void> {
    try {
      const isEmpty = await this.isDatabaseEmpty();
      
      if (isEmpty) {
        console.log('Database is empty, initializing with essential words...');
        await this.seedEssentialWords();
      } else {
        const count = await this.getWordCount();
        console.log(`Database already contains ${count} words`);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Bulk seed words using the edge function
  static async bulkSeedWords(words: string[]): Promise<void> {
    try {
      console.log(`Bulk seeding ${words.length} words...`);
      
      const { data, error } = await supabase.functions.invoke('populate-word-repository', {
        body: { words }
      });

      if (error) {
        console.error('Bulk seeding error:', error);
        throw error;
      }

      console.log('Bulk seeding results:', data);
    } catch (error) {
      console.error('Error in bulk seeding:', error);
      throw error;
    }
  }
}
