
import { supabase } from "@/integrations/supabase/client";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface BackgroundTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  createdAt: number;
}

export class PerformanceOptimizationService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static taskQueue: BackgroundTask[] = [];
  private static isProcessing = false;

  // Cache Management
  static setCache<T>(key: string, data: T, ttlMinutes: number = 30): void {
    const expiry = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  static getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Cached Word Profile Operations
  static async getCachedWordProfile(wordId: string): Promise<any> {
    const cacheKey = `word_profile_${wordId}`;
    let profile = this.getCache(cacheKey);

    if (!profile) {
      try {
        const { data, error } = await supabase
          .from('word_profiles')
          .select('*')
          .eq('id', wordId)
          .maybeSingle();

        if (error) throw error;

        profile = data;
        if (profile) {
          this.setCache(cacheKey, profile, 60); // Cache for 1 hour
        }
      } catch (error) {
        console.error('Error fetching word profile:', error);
        return null;
      }
    }

    return profile;
  }

  // Cached Search Results
  static async getCachedSearchResults(query: string, limit: number = 10): Promise<any[]> {
    const cacheKey = `search_${query}_${limit}`;
    let results = this.getCache<any[]>(cacheKey);

    if (!results) {
      try {
        const { data, error } = await supabase
          .from('word_profiles')
          .select('*')
          .or(`word.ilike.%${query}%,definitions->>primary.ilike.%${query}%`)
          .order('quality_score', { ascending: false })
          .limit(limit);

        if (error) throw error;

        results = data || [];
        this.setCache(cacheKey, results, 15); // Cache for 15 minutes
      } catch (error) {
        console.error('Error performing search:', error);
        return [];
      }
    }

    return results;
  }

  // Background Task Queue
  static addBackgroundTask(
    type: string,
    payload: any,
    priority: number = 1,
    maxRetries: number = 3
  ): string {
    const task: BackgroundTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      priority,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      createdAt: Date.now()
    };

    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority); // Higher priority first

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processTaskQueue();
    }

    return task.id;
  }

  // Process background tasks
  private static async processTaskQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      try {
        task.status = 'processing';
        await this.executeTask(task);
        task.status = 'completed';
        console.log(`Background task ${task.id} completed successfully`);
      } catch (error) {
        console.error(`Background task ${task.id} failed:`, error);
        task.retryCount++;
        
        if (task.retryCount < task.maxRetries) {
          task.status = 'pending';
          this.taskQueue.push(task); // Re-queue for retry
          this.taskQueue.sort((a, b) => b.priority - a.priority);
        } else {
          task.status = 'failed';
          console.error(`Background task ${task.id} failed permanently after ${task.maxRetries} retries`);
        }
      }

      // Small delay between tasks
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Execute individual task
  private static async executeTask(task: BackgroundTask): Promise<void> {
    switch (task.type) {
      case 'enrich_word':
        await this.enrichWordBackground(task.payload);
        break;
      case 'quality_assessment':
        await this.qualityAssessmentBackground(task.payload);
        break;
      case 'cache_warmup':
        await this.cacheWarmupBackground(task.payload);
        break;
      case 'data_cleanup':
        await this.dataCleanupBackground(task.payload);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Background enrichment task
  private static async enrichWordBackground(payload: { wordId: string }): Promise<void> {
    const { SmartDatabaseService } = await import('./smartDatabaseService');
    const { ComprehensiveEnrichmentService } = await import('./comprehensiveEnrichmentService');

    await ComprehensiveEnrichmentService.enrichWordComprehensively(payload.wordId);
    
    // Clear cache for this word
    this.clearCache(`word_profile_${payload.wordId}`);
  }

  // Background quality assessment task
  private static async qualityAssessmentBackground(payload: { wordId: string }): Promise<void> {
    const { QualityAssuranceService } = await import('./qualityAssuranceService');
    await QualityAssuranceService.performQualityAssessment(payload.wordId);
  }

  // Cache warmup task
  private static async cacheWarmupBackground(payload: { queries: string[] }): Promise<void> {
    for (const query of payload.queries) {
      await this.getCachedSearchResults(query);
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
    }
  }

  // Data cleanup task
  private static async dataCleanupBackground(payload: { type: string }): Promise<void> {
    switch (payload.type) {
      case 'expired_cache':
        this.cleanupExpiredCache();
        break;
      case 'old_audits':
        await this.cleanupOldAudits();
        break;
    }
  }

  // Cleanup expired cache entries
  private static cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Cleanup old audit records
  private static async cleanupOldAudits(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      
      const { error } = await supabase
        .from('data_quality_audits')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old audits:', error);
    }
  }

  // Batch operations with rate limiting
  static async batchOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 5,
    delayMs: number = 100
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(operation);
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error('Batch operation failed:', result.reason);
          }
        }
      } catch (error) {
        console.error('Batch operation error:', error);
      }

      // Rate limiting delay
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  // Prefetch common searches
  static async prefetchCommonSearches(): Promise<void> {
    const commonQueries = [
      'biology', 'psychology', 'technology', 'philosophy', 'literature',
      'science', 'history', 'mathematics', 'art', 'music'
    ];

    this.addBackgroundTask('cache_warmup', { queries: commonQueries }, 1);
  }

  // Get performance metrics
  static getPerformanceMetrics(): {
    cacheSize: number;
    cacheHitRate: number;
    taskQueueLength: number;
    isProcessing: boolean;
  } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0, // Would need to track hits/misses
      taskQueueLength: this.taskQueue.length,
      isProcessing: this.isProcessing
    };
  }

  // Initialize performance optimization
  static initialize(): void {
    // Setup periodic cache cleanup
    setInterval(() => {
      this.addBackgroundTask('data_cleanup', { type: 'expired_cache' }, 1);
    }, 60 * 60 * 1000); // Every hour

    // Setup daily audit cleanup
    setInterval(() => {
      this.addBackgroundTask('data_cleanup', { type: 'old_audits' }, 1);
    }, 24 * 60 * 60 * 1000); // Daily

    // Prefetch common searches
    this.prefetchCommonSearches();
  }

  // Optimize word profile loading
  static async optimizedWordProfileLoad(wordId: string): Promise<any> {
    // Try cache first
    let profile = await this.getCachedWordProfile(wordId);
    
    if (profile) {
      // Background refresh if data is getting old
      const cacheEntry = this.cache.get(`word_profile_${wordId}`);
      if (cacheEntry && (Date.now() - cacheEntry.timestamp) > 30 * 60 * 1000) { // 30 minutes
        this.addBackgroundTask('quality_assessment', { wordId }, 1);
      }
    }

    return profile;
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  PerformanceOptimizationService.initialize();
}
