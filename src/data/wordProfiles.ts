
// This file now serves as a bridge between the old word data format
// and the new database-driven word profiles system
import { WordProfile } from "@/types/wordProfile";
import { WordProfileService } from "@/services/wordProfileService";

// Legacy data structure for backward compatibility
export { words } from "./words";

// New database-driven functions
export const getWordProfiles = async (): Promise<WordProfile[]> => {
  return await WordProfileService.getAllWordProfiles();
};

export const getWordProfile = async (word: string): Promise<WordProfile | null> => {
  return await WordProfileService.getWordProfile(word);
};

export const getFeaturedWordProfiles = async (): Promise<WordProfile[]> => {
  return await WordProfileService.getFeaturedWords();
};

export const searchWordProfiles = async (query: string): Promise<WordProfile[]> => {
  return await WordProfileService.searchWords(query);
};

// Migration function to be called once
export const migrateToDatabase = async (): Promise<void> => {
  const { DataMigration } = await import("@/utils/dataMigration");
  await DataMigration.migrateExistingWords();
};
