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

  // Comprehensive semantic mapping for words to search terms
  private static readonly semanticMapping: Record<string, string[]> = {
    // Political and Economic Systems
    capitalism: ['business meeting', 'stock market', 'corporate office', 'financial district', 'money bills'],
    socialism: ['community gathering', 'public services', 'collective work', 'social cooperation'],
    democracy: ['voting booth', 'parliament building', 'citizen assembly', 'election'],
    monarchy: ['crown jewels', 'royal palace', 'throne room', 'king queen'],
    federation: ['unity handshake', 'united nations', 'alliance meeting', 'flags together'],
    republic: ['government building', 'constitution document', 'civic ceremony'],
    oligarchy: ['exclusive boardroom', 'elite gathering', 'wealthy elite'],
    autocracy: ['single ruler', 'authoritarian leader', 'dictator portrait'],
    
    // Economic Concepts
    economics: ['supply demand chart', 'market analysis', 'economic data', 'financial graphs'],
    inflation: ['rising prices', 'expensive groceries', 'cost increase', 'price tags'],
    recession: ['empty stores', 'job loss', 'economic decline', 'closed businesses'],
    prosperity: ['thriving city', 'successful business', 'wealth abundance', 'economic growth'],
    poverty: ['empty wallet', 'homeless shelter', 'food bank', 'economic hardship'],
    
    // Science and Technology
    biology: ['microscope cells', 'DNA helix', 'laboratory research', 'living organisms'],
    chemistry: ['chemical laboratory', 'molecular structure', 'periodic table', 'chemical reactions'],
    physics: ['particle accelerator', 'physics equations', 'scientific instruments', 'energy waves'],
    technology: ['computer circuits', 'innovative devices', 'digital technology', 'tech innovation'],
    innovation: ['light bulb idea', 'creative invention', 'breakthrough technology', 'new discovery'],
    
    // Philosophy and Abstract Concepts
    philosophy: ['ancient scrolls', 'thinking statue', 'philosophical books', 'meditation wisdom'],
    wisdom: ['wise elder', 'ancient library', 'philosophical contemplation', 'knowledge books'],
    knowledge: ['library books', 'academic learning', 'study materials', 'educational'],
    consciousness: ['brain neurons', 'mindfulness meditation', 'awareness concept', 'mental clarity'],
    existence: ['philosophical reflection', 'life contemplation', 'being concept', 'existential'],
    
    // Literature and Arts
    literature: ['classic books', 'library shelves', 'writing manuscripts', 'literary works'],
    poetry: ['handwritten verse', 'romantic poetry', 'artistic writing', 'lyrical expression'],
    drama: ['theater stage', 'dramatic performance', 'theatrical masks', 'stage lighting'],
    comedy: ['laughing audience', 'humor performance', 'comedy masks', 'joyful entertainment'],
    tragedy: ['dramatic scene', 'sorrowful performance', 'tragic masks', 'emotional drama'],
    
    // Nature and Environment
    abundant: ['lush landscapes', 'overflowing harvest', 'fertile fields', 'abundance nature'],
    superfluous: ['excess objects', 'unnecessary clutter', 'waste pile', 'abundance waste'],
    verdant: ['green foliage', 'lush forest', 'verdant landscape', 'emerald nature'],
    barren: ['desert landscape', 'empty field', 'dry earth', 'desolate terrain'],
    fertile: ['rich soil', 'growing crops', 'agricultural land', 'productive farming'],
    
    // Academic and Intellectual
    academic: ['university campus', 'graduation ceremony', 'scholarly research', 'educational institution'],
    intellectual: ['thoughtful scholar', 'academic discussion', 'research study', 'contemplative reading'],
    scholarly: ['ancient manuscripts', 'academic conference', 'research library', 'scholarly work'],
    erudite: ['learned professor', 'extensive library', 'scholarly wisdom', 'academic excellence'],
    
    // Emotions and Psychological States
    melancholy: ['solitary figure', 'autumn rain', 'contemplative mood', 'pensive reflection'],
    euphoric: ['celebration joy', 'ecstatic happiness', 'triumph moment', 'pure bliss'],
    serene: ['peaceful lake', 'meditation scene', 'tranquil garden', 'calm waters'],
    anxious: ['worried expression', 'stress tension', 'nervous energy', 'mental pressure'],
    jubilant: ['victory celebration', 'joyful crowd', 'triumph cheering', 'festive happiness'],
    
    // Architecture and Structures
    architecture: ['iconic building', 'architectural design', 'structural beauty', 'building construction'],
    edifice: ['grand cathedral', 'imposing structure', 'monumental building', 'architectural marvel'],
    infrastructure: ['bridge construction', 'urban development', 'transportation system', 'city planning'],
    monument: ['historical statue', 'memorial structure', 'commemorative building', 'landmark'],
    
    // Time and Change
    ephemeral: ['morning mist', 'fleeting moment', 'temporary beauty', 'brief existence'],
    immutable: ['ancient mountains', 'timeless stone', 'eternal landscape', 'unchanging nature'],
    transient: ['passing clouds', 'temporary state', 'brief moment', 'fleeting time'],
    perpetual: ['endless cycle', 'continuous motion', 'eternal flow', 'unending process'],
    
    // Social and Cultural
    community: ['neighborhood gathering', 'social cooperation', 'group unity', 'collective action'],
    society: ['urban civilization', 'social interaction', 'cultural diversity', 'human organization'],
    culture: ['traditional ceremony', 'cultural festival', 'artistic expression', 'heritage celebration'],
    tradition: ['ceremonial ritual', 'cultural heritage', 'ancestral practice', 'traditional art'],
    
    // Default fallbacks by part of speech
    noun: ['concrete objects', 'everyday items', 'tangible things', 'physical entities'],
    verb: ['dynamic action', 'movement energy', 'active process', 'people activity'],
    adjective: ['quality concept', 'descriptive scene', 'characteristic image', 'attribute visualization'],
    adverb: ['manner of action', 'process flow', 'method demonstration', 'style of movement']
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

  // Contextual placeholder images with comprehensive semantic mapping
  static getPlaceholderImage(word: string): string {
    const wordLower = word.toLowerCase();
    
    // Political & Economic Systems
    if (['capitalism', 'business', 'corporate', 'finance'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop';
    }
    if (['socialism', 'community', 'collective', 'cooperation'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop';
    }
    if (['democracy', 'voting', 'election', 'parliament'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=400&h=300&fit=crop';
    }
    if (['monarchy', 'king', 'queen', 'crown', 'royal'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop';
    }
    if (['federation', 'unity', 'alliance', 'union'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop';
    }
    
    // Science & Technology
    if (['biology', 'cellular', 'organism', 'life'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
    }
    if (['chemistry', 'chemical', 'molecular', 'laboratory'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop';
    }
    if (['physics', 'quantum', 'energy', 'particle'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop';
    }
    if (['technology', 'digital', 'innovation', 'tech'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop';
    }
    
    // Philosophy & Abstract
    if (['philosophy', 'philosophical', 'wisdom', 'contemplation'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop';
    }
    if (['consciousness', 'awareness', 'mindfulness', 'meditation'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    }
    
    // Literature & Arts
    if (['literature', 'poetry', 'writing', 'literary'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop';
    }
    if (['drama', 'theater', 'performance', 'stage'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop';
    }
    
    // Nature words
    if (['abundant', 'verdant', 'lush', 'fertile', 'green'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop';
    }
    if (['barren', 'desert', 'dry', 'desolate'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop';
    }
    
    // Academic words
    if (['academic', 'scholarly', 'intellectual', 'university', 'education'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop';
    }
    
    // Architecture words
    if (['architecture', 'edifice', 'structure', 'building'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop';
    }
    
    // Emotional states
    if (['melancholy', 'sad', 'sorrow', 'depression'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=400&h=300&fit=crop';
    }
    if (['euphoric', 'joy', 'celebration', 'happiness'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';
    }
    if (['serene', 'peaceful', 'calm', 'tranquil'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    }
    
    // Abstract concepts
    if (['ephemeral', 'ethereal', 'sublime', 'temporary'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=300&fit=crop';
    }
    if (['immutable', 'eternal', 'permanent', 'unchanging'].some(k => wordLower.includes(k))) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    }
    
    // Default: Natural landscape
    return 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=300&fit=crop';
  }
}

export { UnsplashImageService };