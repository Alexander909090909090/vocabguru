
import { SemanticSearchService } from './semanticSearchService';

export interface DataSource {
  name: string;
  confidence: number;
  data: any;
  timestamp: Date;
}

export interface ConsolidatedData {
  word: string;
  sources: DataSource[];
  mergedData: any;
  qualityScore: number;
}

export class MultiSourceDataService {
  // Aggregate data from all available open-source APIs
  static async aggregateFromAllSources(word: string): Promise<ConsolidatedData> {
    console.log(`Aggregating data for "${word}" from all sources`);
    
    const sources: DataSource[] = [];
    
    // Gather data from all sources in parallel
    const [
      wiktionaryData,
      wordnetData,
      datamuseData,
      semanticData
    ] = await Promise.allSettled([
      this.fetchFromWiktionary(word),
      this.fetchFromWordNet(word),
      this.fetchFromDatamuse(word),
      this.fetchSemanticData(word)
    ]);

    // Process successful results
    if (wiktionaryData.status === 'fulfilled' && wiktionaryData.value) {
      sources.push({
        name: 'wiktionary',
        confidence: 0.9,
        data: wiktionaryData.value,
        timestamp: new Date()
      });
    }

    if (wordnetData.status === 'fulfilled' && wordnetData.value) {
      sources.push({
        name: 'wordnet',
        confidence: 0.85,
        data: wordnetData.value,
        timestamp: new Date()
      });
    }

    if (datamuseData.status === 'fulfilled' && datamuseData.value) {
      sources.push({
        name: 'datamuse',
        confidence: 0.8,
        data: datamuseData.value,
        timestamp: new Date()
      });
    }

    if (semanticData.status === 'fulfilled' && semanticData.value) {
      sources.push({
        name: 'semantic',
        confidence: 0.75,
        data: semanticData.value,
        timestamp: new Date()
      });
    }

    // Merge and consolidate data
    const mergedData = this.mergeDataSources(sources);
    const qualityScore = this.calculateDataQuality(mergedData, sources.length);

    return {
      word,
      sources,
      mergedData,
      qualityScore
    };
  }

  // Fetch from Wiktionary API
  private static async fetchFromWiktionary(word: string): Promise<any> {
    try {
      const response = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
      );
      
      if (!response.ok) {
        throw new Error(`Wiktionary API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.normalizeWiktionaryData(data);
    } catch (error) {
      console.error('Wiktionary fetch error:', error);
      return null;
    }
  }

  // Fetch from WordNet (via Princeton)
  private static async fetchFromWordNet(word: string): Promise<any> {
    try {
      // Using a public WordNet API
      const response = await fetch(
        `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d,p,r,f&max=1`
      );
      
      if (!response.ok) {
        throw new Error(`WordNet API error: ${response.status}`);
      }
      
      const data = await response.json();
      return this.normalizeWordNetData(data);
    } catch (error) {
      console.error('WordNet fetch error:', error);
      return null;
    }
  }

  // Fetch from Datamuse API
  private static async fetchFromDatamuse(word: string): Promise<any> {
    try {
      const [
        definitionsResponse,
        synonymsResponse,
        rhymesResponse
      ] = await Promise.all([
        fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=d&max=1`),
        fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`),
        fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=5`)
      ]);

      const [definitions, synonyms, rhymes] = await Promise.all([
        definitionsResponse.json(),
        synonymsResponse.json(),
        rhymesResponse.json()
      ]);

      return this.normalizeDatamuseData({ definitions, synonyms, rhymes });
    } catch (error) {
      console.error('Datamuse fetch error:', error);
      return null;
    }
  }

  // Fetch semantic data
  private static async fetchSemanticData(word: string): Promise<any> {
    try {
      const relatedWords = await SemanticSearchService.enhancedSemanticSearch(word);
      return {
        related_words: relatedWords,
        semantic_field: this.inferSemanticField(word, relatedWords)
      };
    } catch (error) {
      console.error('Semantic data fetch error:', error);
      return null;
    }
  }

  // Normalize Wiktionary data
  private static normalizeWiktionaryData(data: any): any {
    if (!data || !data.en) return null;

    const normalized: any = {
      definitions: [],
      etymology: {},
      pronunciation: {}
    };

    // Extract definitions
    for (const entry of data.en) {
      if (entry.definitions) {
        for (const def of entry.definitions) {
          normalized.definitions.push({
            text: def.definition,
            partOfSpeech: def.partOfSpeech,
            examples: def.examples || []
          });
        }
      }
    }

    return normalized;
  }

  // Normalize WordNet data
  private static normalizeWordNetData(data: any): any {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    return {
      definitions: entry.defs || [],
      frequency: entry.f || 0,
      pronunciation: entry.pron || [],
      tags: entry.tags || []
    };
  }

  // Normalize Datamuse data
  private static normalizeDatamuseData(data: any): any {
    return {
      definitions: data.definitions?.[0]?.defs || [],
      synonyms: data.synonyms?.map((s: any) => s.word) || [],
      rhymes: data.rhymes?.map((r: any) => r.word) || [],
      frequency: data.definitions?.[0]?.f || 0
    };
  }

  // Merge data from multiple sources with conflict resolution
  private static mergeDataSources(sources: DataSource[]): any {
    const merged: any = {
      definitions: { primary: '', standard: [], contextual: [] },
      etymology: {},
      morpheme_breakdown: {},
      analysis: { synonyms: [], usage_examples: [] },
      word_forms: {},
      confidence_scores: {}
    };

    // Merge definitions with priority to higher confidence sources
    const allDefinitions: Array<{ text: string; confidence: number; source: string }> = [];
    
    for (const source of sources.sort((a, b) => b.confidence - a.confidence)) {
      if (source.data?.definitions) {
        if (Array.isArray(source.data.definitions)) {
          for (const def of source.data.definitions) {
            allDefinitions.push({
              text: typeof def === 'string' ? def : def.text || def.definition,
              confidence: source.confidence,
              source: source.name
            });
          }
        }
      }
    }

    // Select best definitions
    if (allDefinitions.length > 0) {
      merged.definitions.primary = allDefinitions[0].text;
      merged.definitions.standard = allDefinitions
        .slice(0, 5)
        .map(d => d.text)
        .filter(Boolean);
    }

    // Merge synonyms
    const allSynonyms = new Set<string>();
    for (const source of sources) {
      if (source.data?.synonyms) {
        for (const synonym of source.data.synonyms) {
          allSynonyms.add(synonym);
        }
      }
    }
    merged.analysis.synonyms = Array.from(allSynonyms).slice(0, 10);

    // Store confidence scores for each field
    merged.confidence_scores = {
      definitions: Math.max(...sources.map(s => s.confidence)),
      synonyms: sources.filter(s => s.data?.synonyms).length > 0 ? 0.8 : 0.3,
      overall: sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
    };

    return merged;
  }

  // Calculate overall data quality score
  private static calculateDataQuality(mergedData: any, sourceCount: number): number {
    let score = 0;
    let maxScore = 100;

    // Source diversity bonus (more sources = higher confidence)
    score += Math.min(sourceCount * 15, 45); // Up to 45 points

    // Definition quality
    if (mergedData.definitions?.primary) score += 20;
    if (mergedData.definitions?.standard?.length > 1) score += 15;

    // Synonym richness
    if (mergedData.analysis?.synonyms?.length > 0) score += 10;
    if (mergedData.analysis?.synonyms?.length > 3) score += 5;

    // Confidence score factor
    const avgConfidence = mergedData.confidence_scores?.overall || 0.5;
    score = score * avgConfidence;

    return Math.min(Math.round(score), maxScore);
  }

  // Infer semantic field from related words
  private static inferSemanticField(word: string, relatedWords: string[]): string {
    const fields = {
      'technology': ['computer', 'digital', 'software', 'internet', 'data'],
      'medicine': ['health', 'disease', 'treatment', 'medical', 'doctor'],
      'science': ['research', 'study', 'theory', 'experiment', 'analysis'],
      'business': ['company', 'market', 'profit', 'economy', 'finance'],
      'education': ['learn', 'teach', 'school', 'student', 'knowledge']
    };

    for (const [field, keywords] of Object.entries(fields)) {
      const matches = relatedWords.filter(w => 
        keywords.some(k => w.toLowerCase().includes(k) || k.includes(w.toLowerCase()))
      );
      if (matches.length > 0) {
        return field;
      }
    }

    return 'general';
  }
}
