
import { DictionaryApiService } from './dictionaryApiService';
import { WordSeedingService } from './wordSeedingService';
import { supabase } from "@/integrations/supabase/client";

export class EnhancedDatabaseSeeding {
  // Comprehensive word lists for seeding
  private static readonly ESSENTIAL_WORDS = [
    // Academic & Professional Words (100 words)
    'analyze', 'construct', 'develop', 'establish', 'factor', 'generate', 'identify', 'justify', 'maintain', 'obtain',
    'collaborate', 'communicate', 'coordinate', 'demonstrate', 'evaluate', 'facilitate', 'implement', 'negotiate', 'organize', 'prioritize',
    'comprehensive', 'systematic', 'strategic', 'innovative', 'efficient', 'effective', 'sustainable', 'adaptable', 'resilient', 'versatile',
    'objective', 'subjective', 'empirical', 'theoretical', 'practical', 'conceptual', 'fundamental', 'significant', 'substantial', 'considerable',
    'methodology', 'hypothesis', 'analysis', 'synthesis', 'evaluation', 'interpretation', 'application', 'implementation', 'integration', 'optimization',
    'acknowledge', 'appreciate', 'comprehend', 'perceive', 'recognize', 'understand', 'distinguish', 'differentiate', 'categorize', 'classify',
    'accumulate', 'acquire', 'achieve', 'accomplish', 'attain', 'secure', 'obtain', 'derive', 'extract', 'generate',
    'approach', 'strategy', 'technique', 'procedure', 'process', 'method', 'system', 'framework', 'structure', 'mechanism',
    'principle', 'concept', 'theory', 'doctrine', 'philosophy', 'ideology', 'paradigm', 'perspective', 'viewpoint', 'stance',
    'indicate', 'suggest', 'imply', 'demonstrate', 'illustrate', 'exemplify', 'represent', 'symbolize', 'embody', 'reflect',
    
    // Common High-Frequency Words (100 words)
    'beautiful', 'excellent', 'amazing', 'wonderful', 'fantastic', 'incredible', 'outstanding', 'remarkable', 'spectacular', 'magnificent',
    'important', 'significant', 'crucial', 'essential', 'vital', 'critical', 'necessary', 'valuable', 'useful', 'beneficial',
    'different', 'various', 'diverse', 'distinct', 'unique', 'special', 'particular', 'specific', 'individual', 'personal',
    'possible', 'potential', 'probable', 'likely', 'certain', 'definite', 'obvious', 'clear', 'evident', 'apparent',
    'available', 'accessible', 'obtainable', 'reachable', 'convenient', 'suitable', 'appropriate', 'relevant', 'applicable', 'pertinent',
    'complete', 'entire', 'whole', 'total', 'full', 'comprehensive', 'thorough', 'extensive', 'detailed', 'elaborate',
    'create', 'build', 'make', 'produce', 'design', 'develop', 'construct', 'establish', 'form', 'shape',
    'provide', 'offer', 'supply', 'deliver', 'present', 'give', 'grant', 'afford', 'furnish', 'contribute',
    'include', 'contain', 'involve', 'comprise', 'encompass', 'incorporate', 'embrace', 'cover', 'feature', 'entail',
    'support', 'assist', 'help', 'aid', 'facilitate', 'enable', 'encourage', 'promote', 'foster', 'enhance',
    
    // Scientific & Technical Terms (50 words)
    'molecule', 'atom', 'electron', 'proton', 'neutron', 'element', 'compound', 'solution', 'reaction', 'catalyst',
    'energy', 'force', 'momentum', 'velocity', 'acceleration', 'gravity', 'magnetic', 'electric', 'thermal', 'kinetic',
    'organism', 'species', 'evolution', 'genetics', 'chromosome', 'protein', 'enzyme', 'metabolism', 'photosynthesis', 'ecosystem',
    'algorithm', 'database', 'network', 'protocol', 'interface', 'software', 'hardware', 'system', 'application', 'program',
    'technology', 'innovation', 'digital', 'artificial', 'intelligence', 'automation', 'robotics', 'biotechnology', 'nanotechnology', 'cybernetics',
    
    // Literature & Arts (50 words)
    'narrative', 'character', 'protagonist', 'antagonist', 'plot', 'theme', 'symbolism', 'metaphor', 'allegory', 'irony',
    'poetry', 'prose', 'verse', 'stanza', 'rhythm', 'rhyme', 'meter', 'alliteration', 'assonance', 'onomatopoeia',
    'sculpture', 'painting', 'drawing', 'sketch', 'portrait', 'landscape', 'abstract', 'realistic', 'impressionist', 'expressionist',
    'music', 'melody', 'harmony', 'rhythm', 'tempo', 'composition', 'symphony', 'sonata', 'concerto', 'opera',
    'theater', 'drama', 'comedy', 'tragedy', 'performance', 'actor', 'director', 'playwright', 'script', 'stage'
  ];

  private static readonly ADVANCED_WORDS = [
    // Complex Academic Words (100 words)
    'paradigmatic', 'epistemological', 'phenomenological', 'ontological', 'hermeneutical', 'dialectical', 'heuristic', 'empiricism', 'rationalism', 'pragmatism',
    'ubiquitous', 'omnipresent', 'pervasive', 'prevalent', 'predominant', 'quintessential', 'archetypal', 'prototypical', 'exemplary', 'paradigmatic',
    'meticulous', 'scrupulous', 'punctilious', 'fastidious', 'assiduous', 'diligent', 'sedulous', 'industrious', 'conscientious', 'zealous',
    'eloquent', 'articulate', 'lucid', 'cogent', 'perspicuous', 'coherent', 'succinct', 'concise', 'terse', 'laconic',
    'profound', 'sagacious', 'perspicacious', 'astute', 'shrewd', 'discerning', 'perceptive', 'insightful', 'intuitive', 'prescient',
    'ambiguous', 'equivocal', 'enigmatic', 'cryptic', 'obscure', 'abstruse', 'recondite', 'esoteric', 'arcane', 'occult',
    'magnanimous', 'benevolent', 'altruistic', 'philanthropic', 'humanitarian', 'egalitarian', 'democratic', 'progressive', 'enlightened', 'civilized',
    'tenacious', 'persistent', 'persevering', 'indefatigable', 'relentless', 'unwavering', 'steadfast', 'resolute', 'determined', 'committed',
    'innovative', 'revolutionary', 'groundbreaking', 'pioneering', 'avant-garde', 'cutting-edge', 'state-of-the-art', 'sophisticated', 'advanced', 'progressive',
    'comprehensive', 'exhaustive', 'thorough', 'extensive', 'elaborate', 'detailed', 'meticulous', 'systematic', 'methodical', 'rigorous',
    
    // Specialized Terms (50 words)
    'metamorphosis', 'photosynthesis', 'mitochondria', 'chromosome', 'deoxyribonucleic', 'biodiversity', 'ecosystem', 'symbiosis', 'adaptation', 'natural',
    'algorithm', 'cryptography', 'cybernetics', 'nanotechnology', 'biotechnology', 'artificial', 'machine', 'quantum', 'relativity', 'electromagnetic',
    'philosophy', 'psychology', 'sociology', 'anthropology', 'archaeology', 'linguistics', 'etymology', 'morphology', 'phonetics', 'semantics',
    'democracy', 'aristocracy', 'bureaucracy', 'meritocracy', 'plutocracy', 'oligarchy', 'monarchy', 'republic', 'federation', 'confederation',
    'capitalism', 'socialism', 'communism', 'fascism', 'totalitarianism', 'authoritarianism', 'libertarianism', 'conservatism', 'liberalism', 'progressivism'
  ];

  // Get comprehensive word count
  static async getComprehensiveWordCount(): Promise<number> {
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
      console.error('Error getting comprehensive word count:', error);
      return 0;
    }
  }

  // Seed essential words (300 words)
  static async seedEssentialDatabase(): Promise<{ success: number; failed: number }> {
    console.log('🌱 Starting essential database seeding...');
    
    let successCount = 0;
    let failureCount = 0;

    for (const word of this.ESSENTIAL_WORDS) {
      try {
        const success = await DictionaryApiService.fetchAndStoreWord(word);
        if (success) {
          successCount++;
          console.log(`✅ Seeded essential word: ${word} (${successCount}/${this.ESSENTIAL_WORDS.length})`);
        } else {
          failureCount++;
          console.log(`❌ Failed essential word: ${word}`);
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        failureCount++;
        console.error(`Error seeding essential word "${word}":`, error);
      }
    }

    console.log(`✨ Essential seeding completed: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failed: failureCount };
  }

  // Seed advanced words (150 words)
  static async seedAdvancedDatabase(): Promise<{ success: number; failed: number }> {
    console.log('🚀 Starting advanced database seeding...');
    
    let successCount = 0;
    let failureCount = 0;

    for (const word of this.ADVANCED_WORDS) {
      try {
        const success = await DictionaryApiService.fetchAndStoreWord(word);
        if (success) {
          successCount++;
          console.log(`✅ Seeded advanced word: ${word} (${successCount}/${this.ADVANCED_WORDS.length})`);
        } else {
          failureCount++;
          console.log(`❌ Failed advanced word: ${word}`);
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        failureCount++;
        console.error(`Error seeding advanced word "${word}":`, error);
      }
    }

    console.log(`🎯 Advanced seeding completed: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failed: failureCount };
  }

  // Progressive seeding: Essential first, then advanced
  static async seedProgressively(): Promise<{ 
    essential: { success: number; failed: number }; 
    advanced: { success: number; failed: number };
    total: number;
  }> {
    console.log('🎪 Starting progressive database seeding...');
    
    // Seed essential words first
    const essentialResults = await this.seedEssentialDatabase();
    
    // Only proceed to advanced if essential seeding was reasonably successful
    let advancedResults = { success: 0, failed: 0 };
    if (essentialResults.success > this.ESSENTIAL_WORDS.length * 0.5) {
      console.log('📈 Essential seeding successful, proceeding to advanced words...');
      advancedResults = await this.seedAdvancedDatabase();
    } else {
      console.log('⚠️ Essential seeding had too many failures, skipping advanced words');
    }

    const total = essentialResults.success + advancedResults.success;
    console.log(`🏆 Progressive seeding complete: ${total} total words added`);

    return {
      essential: essentialResults,
      advanced: advancedResults,
      total
    };
  }

  // Quick seed for immediate testing (first 50 essential words)
  static async quickSeed(): Promise<{ success: number; failed: number }> {
    console.log('⚡ Quick seeding first 50 words...');
    
    const quickWords = this.ESSENTIAL_WORDS.slice(0, 50);
    let successCount = 0;
    let failureCount = 0;

    for (const word of quickWords) {
      try {
        const success = await DictionaryApiService.fetchAndStoreWord(word);
        if (success) {
          successCount++;
          console.log(`✅ Quick seed: ${word} (${successCount}/50)`);
        } else {
          failureCount++;
        }
        
        // Faster seeding for quick test
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        failureCount++;
        console.error(`Error in quick seed "${word}":`, error);
      }
    }

    console.log(`⚡ Quick seed complete: ${successCount} success, ${failureCount} failures`);
    return { success: successCount, failed: failureCount };
  }

  // Check if database needs seeding
  static async needsSeeding(): Promise<boolean> {
    const count = await this.getComprehensiveWordCount();
    return count < 50; // Consider needing seeding if less than 50 words
  }

  // Auto-initialize database if empty
  static async autoInitialize(): Promise<void> {
    try {
      const needsInit = await this.needsSeeding();
      
      if (needsInit) {
        console.log('🔧 Database needs initialization, starting quick seed...');
        await this.quickSeed();
      } else {
        const count = await this.getComprehensiveWordCount();
        console.log(`✅ Database already initialized with ${count} words`);
      }
    } catch (error) {
      console.error('Error in auto-initialize:', error);
    }
  }
}
