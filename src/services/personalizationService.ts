
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserLearningProfile {
  userId: string;
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  dailyGoal: number;
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'mixed';
  focusAreas: string[];
  lastActivity: string;
  streakCount: number;
  totalWordsLearned: number;
}

export interface PersonalizedRecommendation {
  wordId: string;
  word: string;
  reason: string;
  relevanceScore: number;
  difficultyLevel: string;
  estimatedLearningTime: number;
  category: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  words: string[];
  estimatedDuration: string;
  difficulty: string;
  category: string;
  progress: number;
}

export class PersonalizationService {
  
  // Get or create user learning profile
  static async getUserLearningProfile(userId: string): Promise<UserLearningProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default profile
        return await this.createDefaultProfile(userId);
      }

      return {
        userId: data.id,
        learningLevel: data.learning_level || 'intermediate',
        interests: this.parseJsonField(data.achievements, []),
        preferredLearningStyle: 'visual',
        dailyGoal: data.daily_goal || 10,
        difficultyPreference: 'mixed',
        focusAreas: [],
        lastActivity: data.updated_at,
        streakCount: data.streak_count || 0,
        totalWordsLearned: data.total_words_learned || 0
      };
    } catch (error) {
      console.error('Error fetching user learning profile:', error);
      return null;
    }
  }

  // Create default learning profile
  private static async createDefaultProfile(userId: string): Promise<UserLearningProfile> {
    const defaultProfile: UserLearningProfile = {
      userId,
      learningLevel: 'intermediate',
      interests: [],
      preferredLearningStyle: 'visual',
      dailyGoal: 10,
      difficultyPreference: 'mixed',
      focusAreas: [],
      lastActivity: new Date().toISOString(),
      streakCount: 0,
      totalWordsLearned: 0
    };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          learning_level: defaultProfile.learningLevel,
          daily_goal: defaultProfile.dailyGoal,
          streak_count: defaultProfile.streakCount,
          total_words_learned: defaultProfile.totalWordsLearned,
          achievements: JSON.stringify([])
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default profile:', error);
    }

    return defaultProfile;
  }

  // Update learning profile
  static async updateLearningProfile(userId: string, updates: Partial<UserLearningProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          learning_level: updates.learningLevel,
          daily_goal: updates.dailyGoal,
          streak_count: updates.streakCount,
          total_words_learned: updates.totalWordsLearned,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating learning profile:', error);
      return false;
    }
  }

  // Generate personalized word recommendations
  static async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<PersonalizedRecommendation[]> {
    try {
      const profile = await this.getUserLearningProfile(userId);
      if (!profile) return [];

      // Get words based on learning level and preferences
      const { data: words, error } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to filter

      if (error) throw error;

      const recommendations: PersonalizedRecommendation[] = [];

      for (const word of words || []) {
        const recommendation = await this.evaluateWordForUser(word, profile);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      // Sort by relevance score and return top results
      return recommendations
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  // Evaluate word relevance for user
  private static async evaluateWordForUser(
    word: any, 
    profile: UserLearningProfile
  ): Promise<PersonalizedRecommendation | null> {
    let relevanceScore = 0;
    const reasons: string[] = [];

    // Base relevance
    relevanceScore += 50;

    // Learning level matching
    const wordComplexity = this.assessWordComplexity(word);
    const levelMatch = this.matchLearningLevel(wordComplexity, profile.learningLevel);
    relevanceScore += levelMatch * 20;
    
    if (levelMatch > 0.7) {
      reasons.push(`Matches your ${profile.learningLevel} level`);
    }

    // Interest alignment
    const interestMatch = this.matchInterests(word, profile.interests);
    relevanceScore += interestMatch * 15;
    
    if (interestMatch > 0.5) {
      reasons.push('Aligns with your interests');
    }

    // Difficulty preference
    const difficultyMatch = this.matchDifficultyPreference(word, profile.difficultyPreference);
    relevanceScore += difficultyMatch * 10;

    // Word quality
    const qualityScore = word.quality_score || 0;
    relevanceScore += (qualityScore / 100) * 15;

    if (qualityScore > 80) {
      reasons.push('High-quality word data');
    }

    // Only recommend if relevance is above threshold
    if (relevanceScore < 60) return null;

    return {
      wordId: word.id,
      word: word.word,
      reason: reasons.join(', ') || 'Recommended for you',
      relevanceScore,
      difficultyLevel: this.getDifficultyLevel(wordComplexity),
      estimatedLearningTime: this.estimateLearningTime(word, profile),
      category: this.categorizeWord(word)
    };
  }

  // Assess word complexity
  private static assessWordComplexity(word: any): number {
    let complexity = 0;
    
    // Word length
    complexity += Math.min(word.word.length / 15, 1) * 30;
    
    // Morpheme complexity
    const morphemes = word.morpheme_breakdown || {};
    if (morphemes.prefix) complexity += 15;
    if (morphemes.suffix) complexity += 15;
    complexity += Math.min((morphemes.root?.meaning?.length || 0) / 50, 1) * 20;
    
    // Definition complexity
    const definition = word.definitions?.primary || '';
    complexity += Math.min(definition.length / 200, 1) * 20;
    
    return Math.min(complexity, 100);
  }

  // Match learning level
  private static matchLearningLevel(wordComplexity: number, learningLevel: string): number {
    const levelRanges = {
      beginner: [0, 40],
      intermediate: [30, 70],
      advanced: [60, 100]
    };
    
    const [min, max] = levelRanges[learningLevel] || [0, 100];
    
    if (wordComplexity >= min && wordComplexity <= max) {
      return 1; // Perfect match
    } else if (wordComplexity < min) {
      return Math.max(0, 1 - (min - wordComplexity) / 30); // Too easy
    } else {
      return Math.max(0, 1 - (wordComplexity - max) / 30); // Too hard
    }
  }

  // Match user interests
  private static matchInterests(word: any, interests: string[]): number {
    if (interests.length === 0) return 0.5; // Neutral if no interests
    
    const wordText = `${word.word} ${word.definitions?.primary || ''} ${word.analysis?.example || ''}`.toLowerCase();
    
    const matches = interests.filter(interest => 
      wordText.includes(interest.toLowerCase())
    );
    
    return matches.length / interests.length;
  }

  // Match difficulty preference
  private static matchDifficultyPreference(word: any, preference: string): number {
    if (preference === 'mixed') return 1;
    
    const complexity = this.assessWordComplexity(word);
    const difficultyMap = {
      easy: [0, 35],
      medium: [35, 70],
      hard: [70, 100]
    };
    
    const [min, max] = difficultyMap[preference] || [0, 100];
    return complexity >= min && complexity <= max ? 1 : 0.5;
  }

  // Get difficulty level string
  private static getDifficultyLevel(complexity: number): string {
    if (complexity < 35) return 'Easy';
    if (complexity < 70) return 'Medium';
    return 'Hard';
  }

  // Estimate learning time
  private static estimateLearningTime(word: any, profile: UserLearningProfile): number {
    const baseTime = 5; // minutes
    const complexity = this.assessWordComplexity(word);
    const levelMultiplier = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.8
    }[profile.learningLevel] || 1.0;
    
    return Math.round(baseTime * (complexity / 50) * levelMultiplier);
  }

  // Categorize word
  private static categorizeWord(word: any): string {
    const pos = word.analysis?.parts_of_speech?.toLowerCase() || '';
    if (pos.includes('noun')) return 'Vocabulary';
    if (pos.includes('verb')) return 'Actions';
    if (pos.includes('adjective')) return 'Descriptive';
    if (pos.includes('adverb')) return 'Modifiers';
    return 'General';
  }

  // Generate learning paths
  static async generateLearningPaths(userId: string): Promise<LearningPath[]> {
    try {
      const profile = await this.getUserLearningProfile(userId);
      if (!profile) return [];

      const paths: LearningPath[] = [
        {
          id: 'foundations',
          name: 'Word Foundations',
          description: 'Build your vocabulary foundation with essential words',
          words: await this.getWordsForPath('foundations', profile),
          estimatedDuration: '2 weeks',
          difficulty: 'Beginner',
          category: 'Core Vocabulary',
          progress: 0
        },
        {
          id: 'etymology',
          name: 'Etymology Explorer',
          description: 'Discover word origins and historical connections',
          words: await this.getWordsForPath('etymology', profile),
          estimatedDuration: '3 weeks',
          difficulty: 'Intermediate',
          category: 'Language History',
          progress: 0
        },
        {
          id: 'morphology',
          name: 'Morphology Master',
          description: 'Master word structure and morpheme patterns',
          words: await this.getWordsForPath('morphology', profile),
          estimatedDuration: '4 weeks',
          difficulty: 'Advanced',
          category: 'Word Structure',
          progress: 0
        }
      ];

      return paths.filter(path => 
        this.isPathSuitableForUser(path, profile)
      );
    } catch (error) {
      console.error('Error generating learning paths:', error);
      return [];
    }
  }

  // Get words for specific learning path
  private static async getWordsForPath(pathType: string, profile: UserLearningProfile): Promise<string[]> {
    try {
      const { data: words, error } = await supabase
        .from('word_profiles')
        .select('id')
        .limit(20);

      if (error) throw error;

      return (words || []).map(w => w.id);
    } catch (error) {
      console.error('Error fetching words for path:', error);
      return [];
    }
  }

  // Check if path is suitable for user
  private static isPathSuitableForUser(path: LearningPath, profile: UserLearningProfile): boolean {
    const levelSuitability = {
      beginner: ['Beginner', 'Intermediate'],
      intermediate: ['Beginner', 'Intermediate', 'Advanced'],
      advanced: ['Intermediate', 'Advanced']
    };

    return levelSuitability[profile.learningLevel]?.includes(path.difficulty) || false;
  }

  // Helper method
  private static parseJsonField<T>(field: any, fallback: T): T {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return fallback;
      }
    }
    return field || fallback;
  }

  // Track user activity
  static async trackActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      // Update last activity and streak
      const profile = await this.getUserLearningProfile(userId);
      if (profile) {
        const today = new Date().toDateString();
        const lastActivity = new Date(profile.lastActivity).toDateString();
        
        let streakCount = profile.streakCount;
        if (today !== lastActivity) {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
          streakCount = lastActivity === yesterday ? streakCount + 1 : 1;
        }

        await this.updateLearningProfile(userId, {
          lastActivity: new Date().toISOString(),
          streakCount
        });
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }
}
