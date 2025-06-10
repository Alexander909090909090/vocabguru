
import { supabase } from "@/integrations/supabase/client";
import { WordProfile, WebhookLog } from "@/types/wordProfile";

export class WordProfileService {
  static async getAllWordProfiles(): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching word profiles:', error);
      throw error;
    }

    return data || [];
  }

  static async getWordProfile(word: string): Promise<WordProfile | null> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('word', word)
      .maybeSingle();

    if (error) {
      console.error('Error fetching word profile:', error);
      throw error;
    }

    return data;
  }

  static async getWordProfileById(id: string): Promise<WordProfile | null> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching word profile:', error);
      throw error;
    }

    return data;
  }

  static async getFeaturedWords(): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured words:', error);
      throw error;
    }

    return data || [];
  }

  static async searchWords(query: string): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .ilike('word', `%${query}%`)
      .order('frequency_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching words:', error);
      throw error;
    }

    return data || [];
  }

  static async getWordsByLanguageOrigin(origin: string): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('language_origin', origin)
      .order('frequency_score', { ascending: false });

    if (error) {
      console.error('Error fetching words by origin:', error);
      throw error;
    }

    return data || [];
  }

  static async getWordsByDifficulty(level: string): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .eq('difficulty_level', level)
      .order('frequency_score', { ascending: false });

    if (error) {
      console.error('Error fetching words by difficulty:', error);
      throw error;
    }

    return data || [];
  }

  static async processWebhook(source: string, payload: any): Promise<void> {
    const { data, error } = await supabase.functions.invoke('process-word-webhook', {
      body: { source, payload }
    });

    if (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }

    return data;
  }

  static async getWebhookLogs(): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('processed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching webhook logs:', error);
      throw error;
    }

    return data || [];
  }
}
