import { LRUCache } from 'lru-cache';

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface PerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  throughput: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  
  // Multi-level caching system
  private memoryCache: LRUCache<string, any>;
  private analysisCache: LRUCache<string, any>;
  private networkCache: LRUCache<string, any>;
  
  // Performance tracking
  private metrics: PerformanceMetrics = {
    cacheHitRate: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    errorRate: 0,
    throughput: 0
  };
  
  private requestTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private errors = 0;
  private startTime = Date.now();

  private constructor() {
    // Initialize multi-level caches
    this.memoryCache = new LRUCache<string, any>({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
      allowStale: false,
      updateAgeOnGet: true
    });

    this.analysisCache = new LRUCache<string, any>({
      max: 500,
      ttl: 1000 * 60 * 30, // 30 minutes
      allowStale: true,
      updateAgeOnGet: true
    });

    this.networkCache = new LRUCache<string, any>({
      max: 200,
      ttl: 1000 * 60 * 60, // 1 hour
      allowStale: true,
      updateAgeOnGet: false
    });
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Intelligent caching with cache-aside pattern
  async getCachedOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    cacheType: 'memory' | 'analysis' | 'network' = 'memory'
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const cache = this.getCache(cacheType);
      
      // Check cache first
      let cached = cache.get(key);
      if (cached) {
        this.cacheHits++;
        this.recordResponseTime(Date.now() - startTime);
        return cached;
      }

      // Cache miss - compute value
      this.cacheMisses++;
      const result = await computeFn();
      
      // Store in cache
      cache.set(key, result);
      
      this.recordResponseTime(Date.now() - startTime);
      return result;

    } catch (error) {
      this.errors++;
      this.recordResponseTime(Date.now() - startTime);
      throw error;
    }
  }

  // Predictive pre-loading based on usage patterns
  async preloadRelatedData(word: string): Promise<void> {
    try {
      // Predict related words user might query next
      const relatedWords = await this.predictRelatedWords(word);
      
      // Pre-load in background without blocking
      setTimeout(async () => {
        for (const relatedWord of relatedWords) {
          try {
            // Pre-load basic analysis
            await this.getCachedOrCompute(
              `analysis:${relatedWord}`,
              () => this.loadBasicAnalysis(relatedWord),
              'analysis'
            );
          } catch (error) {
            // Silent fail for background pre-loading
            console.debug('Pre-loading failed for:', relatedWord);
          }
        }
      }, 100);

    } catch (error) {
      console.debug('Predictive pre-loading failed:', error);
    }
  }

  // Parallel processing coordinator
  async processInParallel<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<any>[] = [];

    for (const task of tasks) {
      const promise = task().then(result => {
        results.push(result);
        return result;
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }

    await Promise.all(executing);
    return results;
  }

  // Batch processing with intelligent grouping
  async batchProcess<T>(
    items: string[],
    processFn: (batch: string[]) => Promise<T[]>,
    batchSize: number = 5,
    delayMs: number = 100
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        const batchResults = await processFn(batch);
        results.push(...batchResults);
        
        // Rate limiting delay
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error('Batch processing error:', error);
        // Continue with next batch on error
      }
    }
    
    return results;
  }

  // Memory management and cleanup
  optimizeMemoryUsage(): void {
    // Clear old cache entries
    const now = Date.now();
    
    // Cleanup analysis cache of stale entries
    this.analysisCache.clear();
    
    // Keep only recent request times for metrics
    this.requestTimes = this.requestTimes.slice(-1000);
    
    // Reset metrics if they get too large
    if (this.metrics.totalRequests > 10000) {
      this.resetMetrics();
    }
  }

  // Performance monitoring and metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const totalCacheOperations = this.cacheHits + this.cacheMisses;
    const runtime = Date.now() - this.startTime;
    
    this.metrics.cacheHitRate = totalCacheOperations > 0 
      ? (this.cacheHits / totalCacheOperations) * 100 
      : 0;
      
    this.metrics.averageResponseTime = this.requestTimes.length > 0
      ? this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length
      : 0;
      
    this.metrics.errorRate = this.metrics.totalRequests > 0
      ? (this.errors / this.metrics.totalRequests) * 100
      : 0;
      
    this.metrics.throughput = runtime > 0
      ? (this.metrics.totalRequests / runtime) * 1000 * 60 // requests per minute
      : 0;

    return { ...this.metrics };
  }

  // Cache invalidation strategies
  invalidatePattern(pattern: string): void {
    const caches = [this.memoryCache, this.analysisCache, this.networkCache];
    
    caches.forEach(cache => {
      for (const key of cache.keys()) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    });
  }

  invalidateWord(word: string): void {
    this.invalidatePattern(word);
  }

  // Load balancing for API calls
  async distributeLoad<T>(
    requests: Array<() => Promise<T>>,
    maxConcurrent: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const active: Promise<T>[] = [];

    for (const request of requests) {
      const promise = request();
      active.push(promise);

      promise.finally(() => {
        const index = active.indexOf(promise);
        if (index > -1) {
          active.splice(index, 1);
        }
      });

      if (active.length >= maxConcurrent) {
        const completed = await Promise.race(active);
        results.push(completed);
      }
    }

    const remaining = await Promise.all(active);
    results.push(...remaining);

    return results;
  }

  // Helper methods
  private getCache(type: 'memory' | 'analysis' | 'network') {
    switch (type) {
      case 'memory': return this.memoryCache;
      case 'analysis': return this.analysisCache;
      case 'network': return this.networkCache;
      default: return this.memoryCache;
    }
  }

  private recordResponseTime(time: number): void {
    this.requestTimes.push(time);
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift();
    }
  }

  private resetMetrics(): void {
    this.metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      totalRequests: 0,
      errorRate: 0,
      throughput: 0
    };
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.errors = 0;
    this.requestTimes = [];
    this.startTime = Date.now();
  }

  private async predictRelatedWords(word: string): Promise<string[]> {
    // Simple prediction based on morphological similarity and common patterns
    const predictions: string[] = [];
    
    // Add words with similar prefixes/suffixes
    const commonPrefixes = ['un', 're', 'pre', 'anti', 'dis'];
    const commonSuffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion'];
    
    commonPrefixes.forEach(prefix => {
      if (word.startsWith(prefix)) {
        predictions.push(word.substring(prefix.length));
      } else {
        predictions.push(prefix + word);
      }
    });
    
    commonSuffixes.forEach(suffix => {
      if (word.endsWith(suffix)) {
        predictions.push(word.substring(0, word.length - suffix.length));
      } else {
        predictions.push(word + suffix);
      }
    });
    
    return predictions.slice(0, 5); // Limit predictions
  }

  private async loadBasicAnalysis(word: string): Promise<any> {
    // Placeholder for basic analysis loading
    return {
      word,
      basic: true,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();
