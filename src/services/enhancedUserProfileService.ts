
import { UserProfileService, UserProfile } from "@/services/userProfileService";
import { InputValidationService } from "@/services/inputValidationService";
import { supabase } from "@/integrations/supabase/client";

export class EnhancedUserProfileService extends UserProfileService {
  // Secure profile update with validation
  static async updateUserProfileSecure(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      // Validate inputs
      if (updates.full_name) {
        const nameValidation = InputValidationService.validateText(updates.full_name, {
          maxLength: 100,
          minLength: 1,
          allowHTML: false
        });
        if (!nameValidation.isValid) {
          throw new Error(`Invalid full name: ${nameValidation.errors.join(', ')}`);
        }
        updates.full_name = nameValidation.sanitizedValue;
      }

      if (updates.username) {
        const usernameValidation = InputValidationService.validateText(updates.username, {
          maxLength: 30,
          minLength: 3,
          allowHTML: false,
          pattern: /^[a-zA-Z0-9_-]+$/
        });
        if (!usernameValidation.isValid) {
          throw new Error(`Invalid username: ${usernameValidation.errors.join(', ')}`);
        }
        updates.username = usernameValidation.sanitizedValue;

        // Check username uniqueness
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', updates.username)
          .neq('id', userId)
          .maybeSingle();

        if (existing) {
          throw new Error('Username is already taken');
        }
      }

      if (updates.daily_goal !== undefined) {
        if (updates.daily_goal < 1 || updates.daily_goal > 100) {
          throw new Error('Daily goal must be between 1 and 100');
        }
      }

      if (updates.learning_level) {
        const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validLevels.includes(updates.learning_level)) {
          throw new Error('Invalid learning level');
        }
      }

      return await this.updateUserProfile(userId, updates);
    } catch (error) {
      console.error('Secure profile update error:', error);
      throw error;
    }
  }

  // Get user profile with security context
  static async getUserProfileSecure(userId: string): Promise<UserProfile | null> {
    try {
      // Check if user is accessing their own profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized access to user profile');
      }

      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Secure profile access error:', error);
      return null;
    }
  }

  // Update user achievements securely
  static async addAchievement(userId: string, achievement: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('Unauthorized');
      }

      const profile = await this.getUserProfile(userId);
      if (!profile) return false;

      const currentAchievements = profile.achievements || [];
      if (currentAchievements.includes(achievement)) {
        return true; // Already has this achievement
      }

      const updatedAchievements = [...currentAchievements, achievement];

      const { error } = await supabase
        .from('user_profiles')
        .update({ achievements: updatedAchievements })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding achievement:', error);
      return false;
    }
  }

  // Check for and award automatic achievements
  static async checkAndAwardAchievements(userId: string): Promise<string[]> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];

      const newAchievements: string[] = [];

      // Check various achievement conditions
      if (profile.total_words_learned >= 10 && !profile.achievements.includes('First 10 Words')) {
        await this.addAchievement(userId, 'First 10 Words');
        newAchievements.push('First 10 Words');
      }

      if (profile.total_words_learned >= 50 && !profile.achievements.includes('Word Explorer')) {
        await this.addAchievement(userId, 'Word Explorer');
        newAchievements.push('Word Explorer');
      }

      if (profile.total_words_learned >= 100 && !profile.achievements.includes('Century Club')) {
        await this.addAchievement(userId, 'Century Club');
        newAchievements.push('Century Club');
      }

      if (profile.streak_count >= 7 && !profile.achievements.includes('Week Warrior')) {
        await this.addAchievement(userId, 'Week Warrior');
        newAchievements.push('Week Warrior');
      }

      if (profile.streak_count >= 30 && !profile.achievements.includes('Monthly Master')) {
        await this.addAchievement(userId, 'Monthly Master');
        newAchievements.push('Monthly Master');
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }
}
