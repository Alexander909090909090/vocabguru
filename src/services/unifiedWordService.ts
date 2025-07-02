
import { WordRepositoryEntry, WordRepositoryService } from './wordRepositoryService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { EnhancedWordProfileService } from './enhancedWordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { WordProfileService } from './wordProfileService';
import { DatabaseMigrationService } from './databaseMigrationService';
import { words as legacyWords } from '@/data/words';

// Unified service for all word operations - Phase 2/3/4 consolidation
export class UnifiedWordService {
  private static cache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private static initialized = false;

  // Initialize service and ensure database is ready
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const isMigrated = await DatabaseMigrationService.checkMigrationStatus();
      if (!isMigrated) {
        console.log('🔧 Database needs initialization...');
        await DatabaseMigrationService.initializeDatabase();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize UnifiedWordService:', error);
      // Continue with fallback behavior
    }
  }

  // Phase 2: Enhanced search with database-first approach
  static async searchWords(query: string, options: {
    includeDefinitions?: boolean;
    includeMorphemes?: boolean;
    limit?: number;
  } = {}): Promise<WordRepositoryEntry[]> {
    await this.initialize();
    
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Primary: Search database
      let results = await WordRepositoryService.searchWords(query);
      
      // Fallback: Search legacy words if database is empty
      if (results.length === 0) {
        const legacyMatches = legacyWords
          .filter(word => 
            word.word.toLowerCase().includes(query.toLowerCase()) ||
            word.description.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, options.limit || 10)
          .map(word => this.convertLegacyToRepository(word));
        
        results = legacyMatches;
      }
      
      // Cache results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results.slice(0, options.limit || 50);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Phase 2: Get word with database-first approach
  static async getWordById(id: string): Promise<EnhancedWordProfile | null> {
    await this.initialize();
    
    const cacheKey = `word_${id}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Primary: Get from database
      let word = await EnhancedWordProfileService.getEnhancedWordProfile(id);
      
      // Fallback: Search legacy words
      if (!word) {
        const legacyWord = legacyWords.find(w => w.id === id);
        if (legacyWord) {
          word = EnhancedWordProfileService.convertLegacyWord(legacyWord);
        }
      }
      
      if (word) {
        this.cache.set(cacheKey, {
          data: word,
          timestamp: Date.now()
        });
      }

      return word;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  }

  // Phase 3: Study-optimized word fetching with fallbacks
  static async getWordsForStudy(criteria: {
    difficultyLevel?: string;
    partOfSpeech?: string;
    limit?: number;
    excludeIds?: string[];
  } = {}): Promise<WordRepositoryEntry[]> {
    await this.initialize();
    
    try {
      // Primary: Get from database
      let { words } = await WordRepositoryService.getWordsWithPagination(
        0,
        criteria.limit || 20
      );

      // Fallback: Use legacy words if database is empty
      if (words.length === 0) {
        words = legacyWords
          .slice(0, criteria.limit || 20)
          .map(word => this.convertLegacyToRepository(word));
      }

      let filteredWords = words;

      // Apply filters
      if (criteria.difficultyLevel) {
        filteredWords = filteredWords.filter(word => 
          word.difficulty_level === criteria.difficultyLevel
        );
      }

      if (criteria.partOfSpeech) {
        filteredWords = filteredWords.filter(word => 
          word.analysis.parts_of_speech === criteria.partOfSpeech
        );
      }

      if (criteria.excludeIds) {
        filteredWords = filteredWords.filter(word => 
          !criteria.excludeIds!.includes(word.id)
        );
      }

      return filteredWords;
    } catch (error) {
      console.error('Error fetching study words:', error);
      return [];
    }
  }

  // Helper: Convert legacy word to WordRepositoryEntry
  private static convertLegacyToRepository(legacyWord: any): WordRepositoryEntry {
    return {
      id: legacyWord.id,
      word: legacyWord.word,
      morpheme_breakdown: legacyWord.morphemeBreakdown,
      etymology: {
        historical_origins: legacyWord.etymology.origin,
        language_of_origin: legacyWord.languageOrigin,
        word_evolution: legacyWord.etymology.evolution,
        cultural_variations: legacyWord.etymology.culturalVariations
      },
      definitions: {
        primary: legacyWord.description,
        standard: legacyWord.definitions?.filter((d: any) => d.type === 'standard').map((d: any) => d.text) || [],
        extended: legacyWord.definitions?.filter((d: any) => d.type === 'extended').map((d: any) => d.text) || [],
        contextual: [legacyWord.definitions?.find((d: any) => d.type === 'contextual')?.text].filter(Boolean) || [],
        specialized: [legacyWord.definitions?.find((d: any) => d.type === 'specialized')?.text].filter(Boolean) || []
      },
      word_forms: {
        base_form: legacyWord.word,
        noun_forms: legacyWord.forms.noun ? { singular: legacyWord.forms.noun } : undefined,
        verb_tenses: legacyWord.forms.verb ? { present: legacyWord.forms.verb } : undefined,
        adjective_forms: legacyWord.forms.adjective ? { positive: legacyWord.forms.adjective } : undefined,
        adverb_form: legacyWord.forms.adverb,
        other_inflections: []
      },
      analysis: {
        parts_of_speech: legacyWord.partOfSpeech,
        collocations: legacyWord.usage.commonCollocations || [],
        example_sentence: legacyWord.usage.exampleSentence
      },
      source_apis: ['legacy_data'],
      frequency_score: 50,
      difficulty_level: 'intermediate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Phase 3: Bulk operations for performance
  static async getMultipleWords(ids: string[]): Promise<EnhancedWordProfile[]> {
    const promises = ids.map(id => this.getWordById(id));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<EnhancedWordProfile> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Phase 4: Cache management
  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Phase 4: Health check with database verification
  static async healthCheck(): Promise<{
    isHealthy: boolean;
    databaseConnected: boolean;
    wordCount: number;
    cacheSize: number;
  }> {
    try {
      await this.initialize();
      
      const { words } = await WordRepositoryService.getWordsWithPagination(0, 1);
      const stats = await DatabaseMigrationService.getMigrationStats();
      
      return {
        isHealthy: true,
        databaseConnected: true,
        wordCount: stats.totalWords,
        cacheSize: this.cache.size
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        isHealthy: false,
        databaseConnected: false,
        wordCount: 0,
        cacheSize: this.cache.size
      };
    }
  }
}
