
import { supabase } from "@/integrations/supabase/client";
import { WordProfile, WebhookLog } from "@/types/wordProfile";
import { RoleService } from "./roleService";
import { toast } from "sonner";

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
    morpheme_breakdown: parseJsonField(row.morpheme_breakdown, {}),
    etymology: parseJsonField(row.etymology, {}),
    definitions: parseJsonField(row.definitions, {}),
    word_forms: parseJsonField(row.word_forms, {}),
    analysis: parseJsonField(row.analysis, {})
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

  static async searchWords(query: string): Promise<WordProfile[]> {
    const { data, error } = await supabase
      .from('word_profiles')
      .select('*')
      .ilike('word', `%${query}%`)
      .order('word', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error searching words:', error);
      throw error;
    }

    return (data || []).map(convertToWordProfile);
  }

  static async createWordProfile(profile: Partial<WordProfile>): Promise<WordProfile> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can create word profiles');
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('word_profiles')
      .insert({
        word: profile.word,
        morpheme_breakdown: profile.morpheme_breakdown || {},
        etymology: profile.etymology || {},
        definitions: profile.definitions || {},
        word_forms: profile.word_forms || {},
        analysis: profile.analysis || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating word profile:', error);
      throw error;
    }

    return convertToWordProfile(data);
  }

  static async updateWordProfile(id: string, updates: Partial<WordProfile>): Promise<WordProfile> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can update word profiles');
      throw new Error('Insufficient permissions');
    }

    const { data, error } = await supabase
      .from('word_profiles')
      .update({
        morpheme_breakdown: updates.morpheme_breakdown,
        etymology: updates.etymology,
        definitions: updates.definitions,
        word_forms: updates.word_forms,
        analysis: updates.analysis
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating word profile:', error);
      throw error;
    }

    return convertToWordProfile(data);
  }

  static async deleteWordProfile(id: string): Promise<void> {
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can delete word profiles');
      throw new Error('Insufficient permissions');
    }

    const { error } = await supabase
      .from('word_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting word profile:', error);
      throw error;
    }
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
    const isAdmin = await RoleService.hasRole('admin');
    if (!isAdmin) {
      toast.error('Only administrators can view webhook logs');
      return [];
    }

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
