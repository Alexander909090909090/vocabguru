
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { WordProfile } from "@/types/wordProfile";
import { Word } from "@/data/words";
import { WordProfileService } from "./wordProfileService";
import { useWords } from "@/context/WordsContext";

export class EnhancedWordProfileService {
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

    return {
      id: profile.id,
      word: profile.word,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      partOfSpeech: profile.analysis?.parts_of_speech || 'unknown',
      languageOrigin: profile.etymology?.language_of_origin || 'Unknown',
      description: profile.definitions?.primary || 'No description available',
      morpheme_breakdown: profile.morpheme_breakdown || {
        root: { text: profile.word, meaning: 'Root meaning not available' }
      },
      etymology: {
        ...profile.etymology,
        first_documented_usage: profile.etymology?.historical_origins
      },
      definitions: profile.definitions || {},
      word_forms: profile.word_forms || {},
      analysis: profile.analysis || {},
      synonymsAntonyms,
      usage: {
        commonCollocations: profile.analysis?.common_collocations ? 
          profile.analysis.common_collocations.split(',').map(s => s.trim()) : [],
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
      etymology: word.etymology,
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
        adverb_form: word.forms.adverb
      },
      analysis: {
        parts_of_speech: word.partOfSpeech,
        contextual_usage: word.usage.contextualUsage,
        sentence_structure: word.usage.sentenceStructure,
        common_collocations: word.usage.commonCollocations?.join(', '),
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
