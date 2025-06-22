
// Simplified user profile service to handle the TypeScript issues
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  learning_level: string;
  daily_goal: number;
  streak_count: number;
  total_words_learned: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export class UserProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        learning_level: data.learning_level || 'intermediate',
        daily_goal: data.daily_goal || 10,
        streak_count: data.streak_count || 0,
        total_words_learned: data.total_words_learned || 0,
        achievements: Array.isArray(data.achievements) ? data.achievements as string[] : []
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  static async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: profile.id,
          full_name: profile.full_name || null,
          username: profile.username || null,
          learning_level: profile.learning_level || 'intermediate',
          daily_goal: profile.daily_goal || 10,
          streak_count: 0,
          total_words_learned: 0,
          achievements: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data ? this.convertToUserProfile(data) : null;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.full_name,
          username: updates.username,
          learning_level: updates.learning_level,
          daily_goal: updates.daily_goal
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data ? this.convertToUserProfile(data) : null;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  }

  private static convertToUserProfile(data: any): UserProfile {
    return {
      ...data,
      learning_level: data.learning_level || 'intermediate',
      daily_goal: data.daily_goal || 10,
      streak_count: data.streak_count || 0,
      total_words_learned: data.total_words_learned || 0,
      achievements: Array.isArray(data.achievements) ? data.achievements as string[] : []
    };
  }
}
