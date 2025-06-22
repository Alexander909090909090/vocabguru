
// Phase 4: Performance optimization utilities
export class PerformanceOptimizer {
  private static observers = new Map<string, IntersectionObserver>();
  private static rafCallbacks = new Set<() => void>();

  // Lazy loading observer
  static createLazyLoader(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    const observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });

    return observer;
  }

  // Debounced function utility
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttled function utility
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Request animation frame scheduler
  static scheduleWork(callback: () => void): void {
    this.rafCallbacks.add(callback);
    
    if (this.rafCallbacks.size === 1) {
      requestAnimationFrame(() => {
        const callbacks = Array.from(this.rafCallbacks);
        this.rafCallbacks.clear();
        
        callbacks.forEach(cb => {
          try {
            cb();
          } catch (error) {
            console.error('Scheduled work error:', error);
          }
        });
      });
    }
  }

  // Memory usage monitor
  static getMemoryUsage(): { used: number; total: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576) // MB
      };
    }
    return null;
  }

  // Cleanup utility
  static cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.rafCallbacks.clear();
  }
}

// Image lazy loading utility
export function createImageLazyLoader(): IntersectionObserver {
  return PerformanceOptimizer.createLazyLoader((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
        }
      }
    });
  });
}

// Virtual scrolling utility
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private items: any[];
  private renderItem: (item: any, index: number) => HTMLElement;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    renderItem: (item: any, index: number) => HTMLElement
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
  }

  setItems(items: any[]): void {
    this.items = items;
    this.render();
  }

  private render(): void {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);

    // Clear container
    this.container.innerHTML = '';

    // Add spacer for items above viewport
    if (startIndex > 0) {
      const spacer = document.createElement('div');
      spacer.style.height = `${startIndex * this.itemHeight}px`;
      this.container.appendChild(spacer);
    }

    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const element = this.renderItem(this.items[i], i);
      this.container.appendChild(element);
    }

    // Add spacer for items below viewport
    const remainingItems = this.items.length - endIndex;
    if (remainingItems > 0) {
      const spacer = document.createElement('div');
      spacer.style.height = `${remainingItems * this.itemHeight}px`;
      this.container.appendChild(spacer);
    }
  }
}
