
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserWordLibraryEntry {
  id: string;
  user_id: string;
  word_id: string;
  added_at: string;
  mastery_level: number;
  study_count: number;
  last_studied?: string;
  notes?: string;
  is_favorite: boolean;
  word?: any; // Will be populated via joins
}

export interface StudySession {
  id: string;
  user_id: string;
  session_type: 'vocabulary' | 'quiz' | 'review';
  words_studied: string[];
  correct_answers: number;
  total_questions: number;
  session_duration?: number;
  started_at: string;
  completed_at?: string;
  notes?: string;
}

export interface UserStudyStats {
  words_in_library: number;
  average_mastery: number;
  study_sessions_count: number;
  words_mastered: number;
}

export class UserWordLibraryService {
  // Add word to user's personal library
  static async addWordToLibrary(wordId: string, notes?: string): Promise<UserWordLibraryEntry | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_word_library')
        .insert({
          user_id: user.id,
          word_id: wordId,
          notes: notes || null,
          mastery_level: 0,
          study_count: 0,
          is_favorite: false
        })
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Word is already in your library');
          return null;
        }
        throw error;
      }

      toast.success('Word added to your library!');
      return data;
    } catch (error) {
      console.error('Error adding word to library:', error);
      toast.error('Failed to add word to library');
      return null;
    }
  }

  // Get user's word library with optional filtering
  static async getUserWordLibrary(filters?: {
    mastery_level?: number;
    is_favorite?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<UserWordLibraryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('user_word_library')
        .select(`
          *,
          word:word_profiles(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (filters?.mastery_level !== undefined) {
        query = query.eq('mastery_level', filters.mastery_level);
      }

      if (filters?.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user word library:', error);
      return [];
    }
  }

  // Update mastery level and study progress
  static async updateWordProgress(wordId: string, updates: {
    mastery_level?: number;
    notes?: string;
    is_favorite?: boolean;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: any = {
        study_count: supabase.sql`study_count + 1`,
        last_studied: new Date().toISOString()
      };

      if (updates.mastery_level !== undefined) {
        updateData.mastery_level = updates.mastery_level;
      }

      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }

      if (updates.is_favorite !== undefined) {
        updateData.is_favorite = updates.is_favorite;
      }

      const { error } = await supabase
        .from('user_word_library')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('word_id', wordId);

      if (error) throw error;

      toast.success('Progress updated!');
      return true;
    } catch (error) {
      console.error('Error updating word progress:', error);
      toast.error('Failed to update progress');
      return false;
    }
  }

  // Remove word from library
  static async removeFromLibrary(wordId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_word_library')
        .delete()
        .eq('user_id', user.id)
        .eq('word_id', wordId);

      if (error) throw error;

      toast.success('Word removed from library');
      return true;
    } catch (error) {
      console.error('Error removing word from library:', error);
      toast.error('Failed to remove word');
      return false;
    }
  }

  // Start a new study session
  static async startStudySession(sessionType: 'vocabulary' | 'quiz' | 'review'): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_study_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          words_studied: [],
          correct_answers: 0,
          total_questions: 0,
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  }

  // Complete a study session
  static async completeStudySession(
    sessionId: string,
    updates: {
      words_studied: string[];
      correct_answers: number;
      total_questions: number;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const startTime = new Date();
      const { data: session } = await supabase
        .from('user_study_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

      const sessionDuration = session 
        ? Math.floor((startTime.getTime() - new Date(session.started_at).getTime()) / 1000)
        : null;

      const { error } = await supabase
        .from('user_study_sessions')
        .update({
          words_studied: updates.words_studied,
          correct_answers: updates.correct_answers,
          total_questions: updates.total_questions,
          session_duration: sessionDuration,
          completed_at: new Date().toISOString(),
          notes: updates.notes
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing study session:', error);
      return false;
    }
  }

  // Get user study statistics
  static async getUserStudyStats(): Promise<UserStudyStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_study_stats');

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user study stats:', error);
      return null;
    }
  }

  // Add search to history
  static async addSearchToHistory(
    searchQuery: string,
    searchType: 'word_search' | 'semantic_search' | 'filter_search' = 'word_search',
    resultsCount: number = 0,
    clickedWordId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          search_query: searchQuery,
          search_type: searchType,
          results_count: resultsCount,
          clicked_word_id: clickedWordId || null
        });
    } catch (error) {
      console.error('Error adding search to history:', error);
    }
  }

  // Get recent searches
  static async getSearchHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('searched_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }
}
