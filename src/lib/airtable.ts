
import { Word, MorphemeBreakdown, WordDefinition, WordImage } from "@/data/words";

// Airtable API types
export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface AirtableRecord {
  id: string;
  fields: AirtableWordFields;
  createdTime: string;
}

export interface AirtableWordFields {
  Word_ID?: string;
  Given_Word?: string;
  Primary_Definition?: string;
  Standard_Definition?: string;
  Sentence_Structure?: string;
  Prefix?: string;
  Root_Word?: string;
  Suffix?: string;
  Historical_Origins?: string;
  Language_of_Origin?: string;
  Word_Evolution?: string;
  Cultural_and_Regional_Variations?: string;
  Common_Collocations?: string;
  Example_Sentences?: string;
  Contextual_Usage?: string;
  Contextual_Definitions?: string;
  Synonyms_Antonyms?: string;
  Tense_Variation?: string;
  Image?: string[];
  User?: string[];
  Daily_Words?: boolean;
  Softr_Record_ID?: string;
}

// Function to fetch words from Airtable
export async function fetchWordsFromAirtable(): Promise<Word[]> {
  try {
    const response = await fetch(
      "https://api.airtable.com/v0/appnBGu9aH4LmZzNi/Word_Analysis",
      {
        headers: {
          Authorization: "Bearer patAPIKeyGoesHere",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from Airtable: ${response.statusText}`);
    }

    const data: AirtableResponse = await response.json();
    return convertAirtableRecordsToWords(data.records);
  } catch (error) {
    console.error("Error fetching from Airtable:", error);
    return [];
  }
}

// Convert Airtable records to our Word format
function convertAirtableRecordsToWords(records: AirtableRecord[]): Word[] {
  return records.map((record) => {
    const fields = record.fields;
    
    // Extract synonyms and antonyms from the combined field
    const synonymsAntonyms = parseSynonymsAntonyms(fields.Synonyms_Antonyms || "");
    
    // Create morpheme breakdown
    const morphemeBreakdown: MorphemeBreakdown = {
      root: { 
        text: fields.Root_Word || "unknown", 
        meaning: "" // We don't have meaning in Airtable schema
      }
    };
    
    if (fields.Prefix) {
      morphemeBreakdown.prefix = { text: fields.Prefix, meaning: "" };
    }
    
    if (fields.Suffix) {
      morphemeBreakdown.suffix = { text: fields.Suffix, meaning: "" };
    }
    
    // Create definitions array
    const definitions: WordDefinition[] = [];
    
    if (fields.Primary_Definition) {
      definitions.push({
        type: "primary",
        text: fields.Primary_Definition
      });
    }
    
    if (fields.Standard_Definition) {
      definitions.push({
        type: "standard",
        text: fields.Standard_Definition
      });
    }
    
    if (fields.Contextual_Definitions) {
      definitions.push({
        type: "contextual",
        text: fields.Contextual_Definitions
      });
    }
    
    // Parse comma-separated collocations
    const commonCollocations = fields.Common_Collocations 
      ? fields.Common_Collocations.split(',').map(item => item.trim())
      : [];
    
    // Create images array if present
    const images: WordImage[] = [];
    if (fields.Image && fields.Image.length > 0) {
      fields.Image.forEach((url, index) => {
        images.push({
          id: `${record.id}-image-${index}`,
          url,
          alt: `Image for ${fields.Given_Word || "word"}`
        });
      });
    }
    
    // Create word object
    return {
      id: fields.Word_ID || record.id,
      word: fields.Given_Word || "Unknown Word",
      description: fields.Primary_Definition || "No definition available",
      languageOrigin: fields.Language_of_Origin || "Unknown",
      partOfSpeech: "unknown", // Not in the Airtable schema
      morphemeBreakdown,
      etymology: {
        origin: fields.Historical_Origins || "Unknown origin",
        evolution: fields.Word_Evolution || "Unknown evolution",
        culturalVariations: fields.Cultural_and_Regional_Variations
      },
      definitions,
      forms: parseTenseVariations(fields.Tense_Variation || ""),
      usage: {
        commonCollocations,
        contextualUsage: fields.Contextual_Usage || "No contextual usage information",
        sentenceStructure: fields.Sentence_Structure,
        exampleSentence: fields.Example_Sentences || "No example sentence available"
      },
      synonymsAntonyms,
      images,
      featured: fields.Daily_Words || false
    };
  });
}

// Helper to parse synonyms and antonyms from combined field (separated by semicolon)
function parseSynonymsAntonyms(combined: string): { synonyms: string[], antonyms: string[] } {
  const parts = combined.split(';');
  
  const synonyms = parts.length > 0 && parts[0].trim() !== "" 
    ? parts[0].split(',').map(s => s.trim()) 
    : [];
    
  const antonyms = parts.length > 1 && parts[1].trim() !== "" 
    ? parts[1].split(',').map(a => a.trim()) 
    : [];
    
  return { synonyms, antonyms };
}

// Parse tense variations into word forms
function parseTenseVariations(tenseVar: string): {
  noun?: string;
  verb?: string;
  adjective?: string;
  adverb?: string;
} {
  const forms: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  } = {};
  
  if (!tenseVar) return forms;
  
  // Simple parsing - this could be improved based on the actual format of your data
  if (tenseVar.includes("noun:")) {
    const nounMatch = tenseVar.match(/noun:\s*([^,;]+)/i);
    if (nounMatch && nounMatch[1]) forms.noun = nounMatch[1].trim();
  }
  
  if (tenseVar.includes("verb:")) {
    const verbMatch = tenseVar.match(/verb:\s*([^,;]+)/i);
    if (verbMatch && verbMatch[1]) forms.verb = verbMatch[1].trim();
  }
  
  if (tenseVar.includes("adjective:")) {
    const adjMatch = tenseVar.match(/adjective:\s*([^,;]+)/i);
    if (adjMatch && adjMatch[1]) forms.adjective = adjMatch[1].trim();
  }
  
  if (tenseVar.includes("adverb:")) {
    const advMatch = tenseVar.match(/adverb:\s*([^,;]+)/i);
    if (advMatch && advMatch[1]) forms.adverb = advMatch[1].trim();
  }
  
  return forms;
}

// Get a single word by ID
export async function fetchWordById(wordId: string): Promise<Word | null> {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/appnBGu9aH4LmZzNi/Word_Analysis?filterByFormula={Word_ID}="${wordId}"`,
      {
        headers: {
          Authorization: "Bearer patAPIKeyGoesHere",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch word: ${response.statusText}`);
    }

    const data: AirtableResponse = await response.json();
    
    if (data.records.length === 0) {
      return null;
    }
    
    const words = convertAirtableRecordsToWords(data.records);
    return words[0];
  } catch (error) {
    console.error("Error fetching word:", error);
    return null;
  }
}
