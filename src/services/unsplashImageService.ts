interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
}

interface UnsplashResponse {
  results: UnsplashImage[];
}

class UnsplashImageService {
  private static readonly ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // User needs to provide this
  private static readonly BASE_URL = 'https://api.unsplash.com';
  private static readonly imageCache = new Map<string, string>();

  // Semantic mapping for words to search terms
  private static readonly semanticMapping: Record<string, string[]> = {
    // Nature and abundance
    abundant: ['lush landscapes', 'green mountains', 'fertile fields', 'abundance nature'],
    superfluous: ['excess objects', 'clutter', 'unnecessary items', 'abundance waste'],
    verdant: ['green foliage', 'lush forest', 'verdant landscape', 'green nature'],
    
    // Academic and intellectual
    academic: ['university library', 'books study', 'education learning', 'scholarly'],
    intellectual: ['thinking person', 'books knowledge', 'study academic', 'contemplation'],
    scholarly: ['ancient books', 'library study', 'research academic', 'wisdom'],
    
    // Emotions and states
    melancholy: ['rainy day', 'solitary figure', 'gray clouds', 'contemplative mood'],
    euphoric: ['celebration joy', 'bright colors', 'happy people', 'festive'],
    serene: ['calm water', 'peaceful landscape', 'meditation zen', 'tranquil'],
    
    // Architecture and structures
    architecture: ['modern building', 'classical architecture', 'geometric structure'],
    edifice: ['grand building', 'imposing structure', 'monumental architecture'],
    
    // Abstract concepts
    ephemeral: ['morning mist', 'fleeting moment', 'fading light', 'temporary beauty'],
    immutable: ['mountain peaks', 'ancient stone', 'timeless landscape', 'eternal'],
    
    // Default fallbacks by part of speech
    noun: ['objects still life', 'everyday items', 'simple objects'],
    verb: ['action motion', 'dynamic movement', 'people activity'],
    adjective: ['abstract concept', 'artistic composition', 'conceptual art'],
    adverb: ['motion blur', 'dynamic action', 'movement energy']
  };

  static async getImageForWord(word: string, partOfSpeech?: string): Promise<string | null> {
    // Check cache first
    const cacheKey = word.toLowerCase();
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    try {
      // Get search terms for the word
      const searchTerms = this.getSearchTermsForWord(word, partOfSpeech);
      
      // Try each search term until we find an image
      for (const searchTerm of searchTerms) {
        const imageUrl = await this.searchUnsplash(searchTerm);
        if (imageUrl) {
          this.imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching image for word:', word, error);
      return null;
    }
  }

  private static getSearchTermsForWord(word: string, partOfSpeech?: string): string[] {
    const wordLower = word.toLowerCase();
    
    // Check direct semantic mapping first
    if (this.semanticMapping[wordLower]) {
      return this.semanticMapping[wordLower];
    }

    // Generate contextual search terms
    const searchTerms: string[] = [];
    
    // Add the word itself
    searchTerms.push(word);
    
    // Add word with common contextual terms
    searchTerms.push(`${word} concept`);
    searchTerms.push(`${word} abstract`);
    
    // Add part of speech specific terms
    if (partOfSpeech) {
      const posTerms = this.semanticMapping[partOfSpeech.toLowerCase()];
      if (posTerms) {
        searchTerms.push(...posTerms);
      }
    }

    // Add default fallbacks
    searchTerms.push('abstract art', 'conceptual design', 'minimalist composition');

    return searchTerms;
  }

  private static async searchUnsplash(query: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }

      return null;
    } catch (error) {
      console.error('Error searching Unsplash:', error);
      return null;
    }
  }

  static clearCache(): void {
    this.imageCache.clear();
  }

  static getCacheSize(): number {
    return this.imageCache.size;
  }

  // Placeholder images until Unsplash is configured
  static getPlaceholderImage(word: string): string {
    const wordLower = word.toLowerCase();
    
    // Nature words
    if (['abundant', 'verdant', 'lush', 'fertile'].includes(wordLower)) {
      return 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop';
    }
    
    // Academic words
    if (['academic', 'scholarly', 'intellectual'].includes(wordLower)) {
      return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop';
    }
    
    // Architecture words
    if (['architecture', 'edifice', 'structure'].includes(wordLower)) {
      return 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop';
    }
    
    // Abstract concepts
    if (['ephemeral', 'ethereal', 'sublime'].includes(wordLower)) {
      return 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=300&fit=crop';
    }
    
    // Default nature scene
    return 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=300&fit=crop';
  }
}

export { UnsplashImageService };