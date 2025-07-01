
import { WordRepositoryEntry, WordRepositoryService } from './wordRepositoryService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { EnhancedWordProfileService } from './enhancedWordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { WordProfileService } from './wordProfileService';

// Unified service for all word operations - Phase 2/3/4 consolidation
export class UnifiedWordService {
  private static cache = new Map<string, any>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Phase 2: Enhanced search with caching
  static async searchWords(query: string, options: {
    includeDefinitions?: boolean;
    includeMorphemes?: boolean;
    limit?: number;
  } = {}): Promise<WordRepositoryEntry[]> {
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const results = await WordRepositoryService.searchWords(query);
      
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

  // Phase 2: Get word with performance optimization
  static async getWordById(id: string): Promise<EnhancedWordProfile | null> {
    const cacheKey = `word_${id}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const word = await EnhancedWordProfileService.getEnhancedWordProfile(id);
      
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

  // Phase 3: Study-optimized word fetching
  static async getWordsForStudy(criteria: {
    difficultyLevel?: string;
    partOfSpeech?: string;
    limit?: number;
    excludeIds?: string[];
  } = {}): Promise<WordRepositoryEntry[]> {
    try {
      const { words } = await WordRepositoryService.getWordsWithPagination(
        0,
        criteria.limit || 20
      );

      let filteredWords = words;

      // Filter by difficulty if specified
      if (criteria.difficultyLevel) {
        filteredWords = filteredWords.filter(word => 
          word.difficulty_level === criteria.difficultyLevel
        );
      }

      // Filter by part of speech if specified
      if (criteria.partOfSpeech) {
        filteredWords = filteredWords.filter(word => 
          word.analysis.parts_of_speech === criteria.partOfSpeech
        );
      }

      // Exclude specified IDs
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

  // Phase 4: Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const { words } = await WordRepositoryService.getWordsWithPagination(0, 1);
      return words.length >= 0;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
