
import { supabase } from "@/integrations/supabase/client";
import { InputValidationService } from "@/services/inputValidationService";
import { toast } from "sonner";

export interface EnhancedUserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  learning_level: string;
  daily_goal: number;
  streak_count: number;
  total_words_learned: number;
  achievements: any[];
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'vocabulary' | 'streak' | 'study' | 'milestone';
}

export class EnhancedUserProfileService {
  // Get current user profile with enhanced data
  static async getCurrentUserProfile(): Promise<EnhancedUserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          return this.createUserProfile(user.id);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Create a new user profile
  static async createUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          learning_level: 'intermediate',
          daily_goal: 10,
          streak_count: 0,
          total_words_learned: 0,
          achievements: []
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  // Update user profile with validation
  static async updateUserProfile(updates: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    learning_level?: string;
    daily_goal?: number;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Validate inputs
      const validatedUpdates: any = {};

      if (updates.username) {
        const validation = InputValidationService.validateText(updates.username, {
          maxLength: 50,
          minLength: 3,
          required: true,
          pattern: /^[a-zA-Z0-9_-]+$/
        });
        if (!validation.isValid) {
          toast.error(`Username validation failed: ${validation.errors.join(', ')}`);
          return false;
        }
        validatedUpdates.username = validation.sanitizedValue;
      }

      if (updates.full_name) {
        const validation = InputValidationService.validateText(updates.full_name, {
          maxLength: 100,
          required: false
        });
        if (!validation.isValid) {
          toast.error(`Name validation failed: ${validation.errors.join(', ')}`);
          return false;
        }
        validatedUpdates.full_name = validation.sanitizedValue;
      }

      if (updates.avatar_url) {
        validatedUpdates.avatar_url = updates.avatar_url;
      }

      if (updates.learning_level) {
        const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validLevels.includes(updates.learning_level)) {
          toast.error('Invalid learning level');
          return false;
        }
        validatedUpdates.learning_level = updates.learning_level;
      }

      if (updates.daily_goal !== undefined) {
        if (updates.daily_goal < 1 || updates.daily_goal > 100) {
          toast.error('Daily goal must be between 1 and 100');
          return false;
        }
        validatedUpdates.daily_goal = updates.daily_goal;
      }

      validatedUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_profiles')
        .update(validatedUpdates)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  }

  // Update user streak
  static async updateUserStreak(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current profile
      const profile = await this.getCurrentUserProfile();
      if (!profile) return false;

      // Calculate new streak (this is simplified - you'd want more sophisticated logic)
      const newStreak = profile.streak_count + 1;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          streak_count: newStreak,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Check for streak achievements
      await this.checkStreakAchievements(newStreak);

      return true;
    } catch (error) {
      console.error('Error updating user streak:', error);
      return false;
    }
  }

  // Check and award achievements
  private static async checkStreakAchievements(streakCount: number): Promise<void> {
    const achievements = [];

    if (streakCount === 7) {
      achievements.push({
        name: 'Week Warrior',
        description: 'Studied for 7 days in a row',
        icon: '🔥',
        category: 'streak'
      });
    }

    if (streakCount === 30) {
      achievements.push({
        name: 'Month Master',
        description: 'Studied for 30 days in a row',
        icon: '🏆',
        category: 'streak'
      });
    }

    for (const achievement of achievements) {
      await this.awardAchievement(achievement);
    }
  }

  // Award achievement to user
  private static async awardAchievement(achievement: Omit<UserAchievement, 'id' | 'earned_at'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await this.getCurrentUserProfile();
      if (!profile) return;

      // Check if user already has this achievement
      const hasAchievement = profile.achievements.some(
        (a: any) => a.name === achievement.name
      );

      if (hasAchievement) return;

      const newAchievement = {
        ...achievement,
        id: crypto.randomUUID(),
        earned_at: new Date().toISOString()
      };

      const updatedAchievements = [...profile.achievements, newAchievement];

      await supabase
        .from('user_profiles')
        .update({
          achievements: updatedAchievements,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      toast.success(`Achievement unlocked: ${achievement.name}!`);
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  }

  // Get user learning analytics
  static async getUserAnalytics(): Promise<{
    wordsLearnedThisWeek: number;
    studyTimeThisWeek: number;
    averageSessionLength: number;
    strongestCategory: string;
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get recent study sessions (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from('user_study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', oneWeekAgo.toISOString())
        .not('completed_at', 'is', null);

      if (!sessions) return null;

      const wordsLearnedThisWeek = sessions.reduce(
        (total, session) => total + (session.words_studied?.length || 0), 
        0
      );

      const studyTimeThisWeek = sessions.reduce(
        (total, session) => total + (session.session_duration || 0), 
        0
      );

      const averageSessionLength = sessions.length > 0 
        ? studyTimeThisWeek / sessions.length 
        : 0;

      // Get strongest category (simplified)
      const sessionTypes = sessions.reduce((acc: any, session) => {
        acc[session.session_type] = (acc[session.session_type] || 0) + 1;
        return acc;
      }, {});

      const strongestCategory = Object.keys(sessionTypes).reduce((a, b) => 
        sessionTypes[a] > sessionTypes[b] ? a : b, 'vocabulary'
      );

      return {
        wordsLearnedThisWeek,
        studyTimeThisWeek,
        averageSessionLength,
        strongestCategory
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  }
}
