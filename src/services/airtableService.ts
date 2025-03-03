
import Airtable from 'airtable';
import { Word } from '@/data/words';

// Initialize Airtable with your personal access token
let base: any = null;

export const initAirtable = (personalAccessToken: string, baseId: string) => {
  try {
    // Configure Airtable with the personal access token
    Airtable.configure({ apiKey: personalAccessToken });
    base = Airtable.base(baseId);
    
    // Store the credentials in localStorage for future use
    localStorage.setItem('airtablePersonalAccessToken', personalAccessToken);
    localStorage.setItem('airtableBaseId', baseId);
    
    return base;
  } catch (error) {
    console.error("Error initializing Airtable:", error);
    throw error;
  }
};

// Check if we have stored credentials and initialize Airtable
export const getAirtableBase = () => {
  if (!base) {
    const personalAccessToken = localStorage.getItem('airtablePersonalAccessToken');
    const baseId = localStorage.getItem('airtableBaseId');
    
    if (personalAccessToken && baseId) {
      try {
        initAirtable(personalAccessToken, baseId);
      } catch (error) {
        console.error("Error getting Airtable base:", error);
        // Clear stored credentials if there's an error
        localStorage.removeItem('airtablePersonalAccessToken');
        localStorage.removeItem('airtableBaseId');
        return null;
      }
    } else {
      return null;
    }
  }
  
  return base;
};

// Ensure that arrays are properly handled
const ensureArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(item => item.trim());
  return [];
};

// Function to fetch words from Airtable
export const fetchWordsFromAirtable = async (): Promise<Word[]> => {
  const base = getAirtableBase();
  
  if (!base) {
    throw new Error('Airtable not initialized. Please set your Personal Access Token and Base ID.');
  }
  
  try {
    // Try to fetch from Airtable - using 'Word_Analysis' as the table name based on the new schema
    const records = await base('Word_Analysis').select().all();
    
    return records.map((record: any) => {
      const fields = record.fields;
      
      // Build the morpheme breakdown object
      const morphemeBreakdown: any = {
        root: { 
          text: fields.Root_Word || '', 
          meaning: '' // Root word meaning not explicitly in schema
        }
      };
      
      if (fields.Prefix) {
        morphemeBreakdown.prefix = {
          text: fields.Prefix,
          meaning: '' // Prefix meaning not explicitly in schema
        };
      }
      
      if (fields.Suffix) {
        morphemeBreakdown.suffix = {
          text: fields.Suffix,
          meaning: '' // Suffix meaning not explicitly in schema
        };
      }
      
      // Process image attachments if they exist
      let images = [];
      if (fields.Image) {
        // If images are stored as attachments
        if (Array.isArray(fields.Image)) {
          images = fields.Image.map((attachment: any, index: number) => ({
            id: `${record.id}-img-${index}`,
            url: attachment.url,
            alt: `Image ${index+1} for ${fields.Given_Word || 'word'}`
          }));
        }
      }
      
      // Parse synonyms/antonyms
      const synonymsAntonyms = { synonyms: [], antonyms: [] };
      if (fields.Synonyms_Antonyms) {
        try {
          // Try to parse as JSON
          const parsed = typeof fields.Synonyms_Antonyms === 'string' 
            ? JSON.parse(fields.Synonyms_Antonyms)
            : fields.Synonyms_Antonyms;
            
          if (parsed.synonyms) synonymsAntonyms.synonyms = ensureArray(parsed.synonyms);
          if (parsed.antonyms) synonymsAntonyms.antonyms = ensureArray(parsed.antonyms);
        } catch (e) {
          // If it's not JSON, treat as comma-separated list (assuming synonyms only)
          synonymsAntonyms.synonyms = ensureArray(fields.Synonyms_Antonyms);
        }
      }
      
      // Map Airtable fields to our Word interface based on the new schema
      return {
        id: record.id,
        word: fields.Given_Word || '',
        pronunciation: '',  // Not in schema
        description: fields.Primary_Definition || '',
        languageOrigin: fields.Language_of_Origin || 'Unknown',
        partOfSpeech: '',  // Not explicitly in schema
        featured: !!fields.Daily_Words,
        etymology: {
          origin: fields.Historical_Origins || '',
          evolution: fields.Word_Evolution || '',
          culturalVariations: fields.Cultural_and_Regional_Variations || ''
        },
        definitions: [
          {
            type: 'primary',
            text: fields.Primary_Definition || ''
          },
          ...(fields.Standard_Definition ? [{
            type: 'standard',
            text: fields.Standard_Definition
          }] : []),
          ...(fields.Contextual_Definitions ? [{
            type: 'contextual',
            text: fields.Contextual_Definitions
          }] : [])
        ].filter(def => def.text), // Only include definitions with text
        forms: {
          noun: fields.Tense_Variation ? fields.Tense_Variation.noun : '',
          verb: fields.Tense_Variation ? fields.Tense_Variation.verb : '',
          adjective: fields.Tense_Variation ? fields.Tense_Variation.adjective : '',
          adverb: fields.Tense_Variation ? fields.Tense_Variation.adverb : ''
        },
        usage: {
          commonCollocations: ensureArray(fields.Common_Collocations),
          contextualUsage: fields.Contextual_Usage || '',
          sentenceStructure: fields.Sentence_Structure || '',
          exampleSentence: fields.Example_Sentences || ''
        },
        synonymsAntonyms,
        morphemeBreakdown,
        images
      };
    });
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
    throw error;
  }
};

// Function to check if Airtable is connected
export const isAirtableConnected = () => {
  return !!getAirtableBase();
};

// Function to disconnect from Airtable
export const disconnectAirtable = () => {
  localStorage.removeItem('airtablePersonalAccessToken');
  localStorage.removeItem('airtableBaseId');
  base = null;
  return true;
};

// Function to test the Airtable connection
export const testAirtableConnection = async (personalAccessToken: string, baseId: string): Promise<boolean> => {
  try {
    const testBase = new Airtable({ apiKey: personalAccessToken }).base(baseId);
    // Try to fetch a single record from the Words table
    await testBase('Word_Analysis').select({ maxRecords: 1 }).firstPage();
    return true;
  } catch (error) {
    console.error('Error testing Airtable connection:', error);
    return false;
  }
};
