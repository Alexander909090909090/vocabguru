
import { supabase } from "@/integrations/supabase/client";
import { Word } from "@/types/word";
import { UserWordLibraryService, UserStudyStats } from "@/services/userWordLibraryService";
import { WordService } from "@/services/wordService";

export interface PersonalizedRecommendations {
  words: Word[];
  reasoning: string;
  difficulty_adjustment: number;
  focus_areas: string[];
}

export interface StudyPlan {
  daily_words: Word[];
  review_words: Word[];
  challenge_words: Word[];
  estimated_time: number;
  focus_areas: string[];
}

export interface LearningProgress {
  mastery_trend: number;
  study_consistency: number;
  strength_areas: string[];
  improvement_areas: string[];
  next_milestones: string[];
}

export class PersonalizedAIService {
  // Generate personalized word recommendations based on user progress
  static async getPersonalizedRecommendations(limit: number = 10): Promise<PersonalizedRecommendations> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Return beginner recommendations for non-authenticated users
        const words = await WordService.getWords(0, limit);
        return {
          words: words.words,
          reasoning: "Welcome! Here are some essential words to start your vocabulary journey.",
          difficulty_adjustment: 0,
          focus_areas: ["basic_vocabulary", "common_words"]
        };
      }

      const stats = await UserWordLibraryService.getUserStudyStats();
      const userLibrary = await UserWordLibraryService.getUserWordLibrary({ limit: 100 });

      // Analyze user's learning patterns
      const averageMastery = stats?.average_mastery || 0;
      const totalWords = stats?.words_in_library || 0;
      const studiedWords = userLibrary.map(entry => entry.word_id);

      // Determine difficulty adjustment based on progress
      let difficultyAdjustment = 0;
      if (averageMastery > 0.7) difficultyAdjustment = 1; // Increase difficulty
      else if (averageMastery < 0.3) difficultyAdjustment = -1; // Decrease difficulty

      // Get words not in user's library
      const { words: availableWords } = await WordService.getWords(0, limit * 3);
      const newWords = availableWords.filter(word => !studiedWords.includes(word.id));

      // Select appropriate words based on difficulty and user progress
      const selectedWords = this.selectWordsBasedOnDifficulty(newWords, difficultyAdjustment, limit);

      // Generate focus areas based on user's weak points
      const focusAreas = this.determineFocusAreas(userLibrary, averageMastery);

      const reasoning = this.generateRecommendationReasoning(averageMastery, totalWords, focusAreas);

      return {
        words: selectedWords,
        reasoning,
        difficulty_adjustment: difficultyAdjustment,
        focus_areas: focusAreas
      };
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      
      // Fallback to basic recommendations
      const words = await WordService.getWords(0, limit);
      return {
        words: words.words,
        reasoning: "Here are some recommended words to expand your vocabulary.",
        difficulty_adjustment: 0,
        focus_areas: ["general_vocabulary"]
      };
    }
  }

  // Create a daily study plan tailored to the user
  static async generateDailyStudyPlan(): Promise<StudyPlan> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { words } = await WordService.getWords(0, 5);
        return {
          daily_words: words,
          review_words: [],
          challenge_words: [],
          estimated_time: 15,
          focus_areas: ["basic_vocabulary"]
        };
      }

      const stats = await UserWordLibraryService.getUserStudyStats();
      const userLibrary = await UserWordLibraryService.getUserWordLibrary();

      // Get words that need review (studied but low mastery)
      const reviewWords = userLibrary
        .filter(entry => entry.mastery_level < 3 && entry.study_count > 0)
        .slice(0, 3)
        .map(entry => this.convertLibraryEntryToWord(entry));

      // Get new words for daily learning
      const recommendations = await this.getPersonalizedRecommendations(5);
      const dailyWords = recommendations.words;

      // Get challenge words (higher difficulty)
      const challengeWords = userLibrary
        .filter(entry => entry.mastery_level >= 3)
        .slice(0, 2)
        .map(entry => this.convertLibraryEntryToWord(entry));

      const estimatedTime = (dailyWords.length * 2) + (reviewWords.length * 1.5) + (challengeWords.length * 3);

      return {
        daily_words: dailyWords,
        review_words: reviewWords,
        challenge_words: challengeWords,
        estimated_time: Math.round(estimatedTime),
        focus_areas: recommendations.focus_areas
      };
    } catch (error) {
      console.error('Error generating study plan:', error);
      const { words } = await WordService.getWords(0, 5);
      return {
        daily_words: words,
        review_words: [],
        challenge_words: [],
        estimated_time: 15,
        focus_areas: ["general_vocabulary"]
      };
    }
  }

  // Analyze user's learning progress and provide insights
  static async analyzeLearningProgress(): Promise<LearningProgress> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          mastery_trend: 0,
          study_consistency: 0,
          strength_areas: [],
          improvement_areas: ["authentication_required"],
          next_milestones: ["Sign up to track your progress"]
        };
      }

      const stats = await UserWordLibraryService.getUserStudyStats();
      const userLibrary = await UserWordLibraryService.getUserWordLibrary();

      // Calculate mastery trend (simplified)
      const masteryTrend = this.calculateMasteryTrend(userLibrary);

      // Analyze study consistency
      const studyConsistency = this.calculateStudyConsistency(userLibrary);

      // Identify strength and improvement areas
      const { strengthAreas, improvementAreas } = this.analyzePerformanceAreas(userLibrary);

      // Generate next milestones
      const nextMilestones = this.generateMilestones(stats, userLibrary);

      return {
        mastery_trend: masteryTrend,
        study_consistency: studyConsistency,
        strength_areas: strengthAreas,
        improvement_areas: improvementAreas,
        next_milestones: nextMilestones
      };
    } catch (error) {
      console.error('Error analyzing learning progress:', error);
      return {
        mastery_trend: 0,
        study_consistency: 0,
        strength_areas: [],
        improvement_areas: ["analysis_error"],
        next_milestones: ["Try again later"]
      };
    }
  }

  // Helper methods
  private static selectWordsBasedOnDifficulty(words: Word[], difficultyAdjustment: number, limit: number): Word[] {
    // Simple difficulty-based selection
    return words.slice(0, limit);
  }

  private static determineFocusAreas(userLibrary: any[], averageMastery: number): string[] {
    const areas = ["vocabulary_expansion"];
    
    if (averageMastery < 0.5) {
      areas.push("basic_mastery");
    } else if (averageMastery > 0.7) {
      areas.push("advanced_concepts");
    }

    return areas;
  }

  private static generateRecommendationReasoning(averageMastery: number, totalWords: number, focusAreas: string[]): string {
    if (totalWords === 0) {
      return "Welcome to VocabGuru! These words are perfect for starting your vocabulary journey.";
    }

    if (averageMastery < 0.3) {
      return "Focus on mastering these foundational words to build a strong vocabulary base.";
    } else if (averageMastery > 0.7) {
      return "Great progress! Here are some challenging words to expand your advanced vocabulary.";
    }

    return "These words are selected to match your current learning level and help you progress steadily.";
  }

  private static convertLibraryEntryToWord(entry: any): Word {
    // Convert library entry to Word type
    return {
      id: entry.word_id,
      word: entry.word?.word || "unknown",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partOfSpeech: entry.word?.analysis?.parts_of_speech || "noun",
      definitions: {
        primary: entry.word?.definitions?.primary || "Definition not available"
      },
      description: entry.word?.definitions?.primary || "Description not available",
      languageOrigin: entry.word?.etymology?.language_of_origin || "Unknown",
      morpheme_breakdown: entry.word?.morpheme_breakdown || {},
      morphemeBreakdown: entry.word?.morpheme_breakdown || {},
      etymology: entry.word?.etymology || {},
      word_forms: entry.word?.word_forms || {},
      analysis: entry.word?.analysis || {},
      difficulty_level: entry.word?.difficulty_level || "medium",
      synonymsAntonyms: {
        synonyms: [],
        antonyms: []
      },
      usage: {
        commonCollocations: [],
        contextualUsage: "",
        exampleSentence: ""
      },
      forms: {},
      source_apis: ['word_profiles'],
      frequency_score: 0
    };
  }

  private static calculateMasteryTrend(userLibrary: any[]): number {
    // Simple trend calculation based on recent study performance
    const recentStudies = userLibrary.filter(entry => entry.last_studied);
    const averageMastery = recentStudies.reduce((sum, entry) => sum + entry.mastery_level, 0) / recentStudies.length;
    
    return averageMastery || 0;
  }

  private static calculateStudyConsistency(userLibrary: any[]): number {
    // Calculate based on study frequency
    const studiedWords = userLibrary.filter(entry => entry.study_count > 0);
    return Math.min(studiedWords.length / 10, 1); // Normalize to 0-1
  }

  private static analyzePerformanceAreas(userLibrary: any[]): { strengthAreas: string[], improvementAreas: string[] } {
    const masteredWords = userLibrary.filter(entry => entry.mastery_level >= 4);
    const strugglingWords = userLibrary.filter(entry => entry.mastery_level < 2 && entry.study_count > 2);

    const strengthAreas = masteredWords.length > 5 ? ["vocabulary_retention"] : [];
    const improvementAreas = strugglingWords.length > 3 ? ["word_mastery"] : [];

    return { strengthAreas, improvementAreas };
  }

  private static generateMilestones(stats: UserStudyStats | null, userLibrary: any[]): string[] {
    const milestones = [];

    if (!stats || stats.words_in_library < 10) {
      milestones.push("Add 10 words to your library");
    } else if (stats.words_in_library < 50) {
      milestones.push("Reach 50 words in your collection");
    }

    if (stats && stats.words_mastered < 5) {
      milestones.push("Master your first 5 words");
    }

    if (milestones.length === 0) {
      milestones.push("Keep up the great work!");
    }

    return milestones;
  }
}
