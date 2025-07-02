
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { WordProfile } from "@/types/wordProfile";
import { Word } from "@/data/words";
import { WordProfileService } from "./wordProfileService";

export class EnhancedWordProfileService {
  // Helper function to safely get collocations from analysis
  private static getCollocations(analysis: any): string[] {
    if (!analysis) return [];
    
    // Check for common_collocations property (WordProfile style)
    if (Array.isArray(analysis.common_collocations)) {
      return analysis.common_collocations;
    }
    
    // Handle string format
    if (typeof analysis.common_collocations === 'string') {
      return analysis.common_collocations.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    
    return [];
  }

  // Convert WordProfile to EnhancedWordProfile
  static convertWordProfile(profile: WordProfile): EnhancedWordProfile {
    let synonymsAntonyms = { synonyms: [], antonyms: [] };
    
    try {
      if (profile.analysis?.synonyms_antonyms) {
        synonymsAntonyms = JSON.parse(profile.analysis.synonyms_antonyms);
      }
    } catch (error) {
      console.error("Error parsing synonyms_antonyms:", error);
    }

    // Ensure morpheme breakdown is properly structured
    const morphemeBreakdown = profile.morpheme_breakdown || {
      root: { text: profile.word, meaning: 'Root meaning not available' }
    };

    // Safely get collocations
    const collocations = this.getCollocations(profile.analysis);

    return {
      id: profile.id,
      word: profile.word,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      partOfSpeech: profile.analysis?.parts_of_speech || 'unknown',
      languageOrigin: profile.etymology?.language_of_origin || 'Unknown',
      description: profile.definitions?.primary || 'No description available',
      morpheme_breakdown: morphemeBreakdown,
      morphemeBreakdown: morphemeBreakdown, // Legacy compatibility
      etymology: {
        ...profile.etymology,
        first_documented_usage: profile.etymology?.historical_origins
      },
      definitions: {
        primary: profile.definitions?.primary,
        standard: profile.definitions?.standard || [],
        extended: profile.definitions?.extended || [],
        contextual: profile.definitions?.contextual ? [profile.definitions.contextual] : [],
        specialized: profile.definitions?.specialized ? [profile.definitions.specialized] : []
      },
      word_forms: {
        ...profile.word_forms,
        other_inflections: profile.word_forms?.other_inflections ? 
          [profile.word_forms.other_inflections] : []
      },
      analysis: {
        ...profile.analysis,
        // Fix: Use safe collocation getter
        common_collocations: collocations
      },
      synonymsAntonyms,
      usage: {
        commonCollocations: collocations,
        contextualUsage: profile.analysis?.contextual_usage,
        sentenceStructure: profile.analysis?.sentence_structure,
        exampleSentence: profile.analysis?.example
      },
      forms: {
        noun: profile.word_forms?.noun_forms?.singular,
        verb: profile.word_forms?.verb_tenses?.present,
        adjective: profile.word_forms?.adjective_forms?.positive,
        adverb: profile.word_forms?.adverb_form
      }
    };
  }

  // Convert legacy Word to EnhancedWordProfile
  static convertLegacyWord(word: Word): EnhancedWordProfile {
    return {
      id: word.id,
      word: word.word,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pronunciation: word.pronunciation,
      partOfSpeech: word.partOfSpeech,
      languageOrigin: word.languageOrigin,
      description: word.description,
      featured: word.featured,
      morpheme_breakdown: word.morphemeBreakdown,
      morphemeBreakdown: word.morphemeBreakdown, // Legacy compatibility
      etymology: {
        historical_origins: word.etymology.origin,
        language_of_origin: word.languageOrigin,
        word_evolution: word.etymology.evolution,
        cultural_regional_variations: word.etymology.culturalVariations
      },
      definitions: {
        primary: word.definitions.find(d => d.type === 'primary')?.text,
        standard: word.definitions.filter(d => d.type === 'standard').map(d => d.text),
        extended: word.definitions.filter(d => d.type === 'extended').map(d => d.text),
        contextual: word.definitions.filter(d => d.type === 'contextual').map(d => d.text)
      },
      word_forms: {
        noun_forms: word.forms.noun ? { singular: word.forms.noun } : undefined,
        verb_tenses: word.forms.verb ? { present: word.forms.verb } : undefined,
        adjective_forms: word.forms.adjective ? { positive: word.forms.adjective } : undefined,
        adverb_form: word.forms.adverb,
        other_inflections: []
      },
      analysis: {
        parts_of_speech: word.partOfSpeech,
        contextual_usage: word.usage.contextualUsage,
        sentence_structure: word.usage.sentenceStructure,
        common_collocations: word.usage.commonCollocations || [],
        example: word.usage.exampleSentence,
        synonyms_antonyms: JSON.stringify(word.synonymsAntonyms)
      },
      images: word.images,
      synonymsAntonyms: word.synonymsAntonyms,
      usage: word.usage,
      forms: word.forms
    };
  }

  // Get enhanced word profile by ID
  static async getEnhancedWordProfile(id: string): Promise<EnhancedWordProfile | null> {
    try {
      // First try to get from database
      const dbProfile = await WordProfileService.getWordProfileById(id);
      if (dbProfile) {
        return this.convertWordProfile(dbProfile);
      }

      // Fallback to legacy words context
      // This would need to be called from a component with access to useWords
      return null;
    } catch (error) {
      console.error("Error getting enhanced word profile:", error);
      return null;
    }
  }

  // Search enhanced word profiles
  static async searchEnhancedWordProfiles(query: string): Promise<EnhancedWordProfile[]> {
    try {
      const dbProfiles = await WordProfileService.searchWords(query);
      return dbProfiles.map(profile => this.convertWordProfile(profile));
    } catch (error) {
      console.error("Error searching enhanced word profiles:", error);
      return [];
    }
  }
}
