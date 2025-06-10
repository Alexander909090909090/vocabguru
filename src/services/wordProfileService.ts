
import { supabase } from "@/integrations/supabase/client";
import { WordProfile, WebhookLog, Definition } from "@/types/wordProfile";

// Helper function to safely parse JSON fields
const parseJsonField = <T>(field: any, fallback: T): T => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return fallback;
    }
  }
  return field || fallback;
};

// Helper function to convert database row to WordProfile
const convertToWordProfile = (row: any): WordProfile => {
  return {
    ...row,
    definitions: parseJsonField<Definition[]>(row.definitions, []),
    common_collocations: parseJsonField<string[]>(row.common_collocations, []),
    synonyms: parseJsonField<string[]>(row.synonyms, []),
    antonyms: parseJsonField<string[]>(row.antonyms, [])
  };
};

// Helper function to convert database row to WebhookLog
const convertToWebhookLog = (row: any): WebhookLog => {
  return {
    ...row,
    status: row.status as 'pending' | 'processed' | 'failed',
    payload: parseJsonField<any>(row.payload, {})
  };
};

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

    return (data || []).map(convertToWordProfile);
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

    return data ? convertToWordProfile(data) : null;
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

    return data ? convertToWordProfile(data) : null;
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

    return (data || []).map(convertToWordProfile);
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

    return (data || []).map(convertToWordProfile);
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

    return (data || []).map(convertToWordProfile);
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

    return (data || []).map(convertToWordProfile);
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

    return (data || []).map(convertToWebhookLog);
  }
}
