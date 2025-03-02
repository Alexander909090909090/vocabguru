
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
    // Try to fetch from Airtable - using 'Words' as the table name
    const records = await base('Words').select().all();
    
    return records.map((record: any) => {
      const fields = record.fields;
      
      // Build the morpheme breakdown object
      const morphemeBreakdown: any = {
        root: { 
          text: fields.root || '', 
          meaning: fields.rootMeaning || '' 
        }
      };
      
      if (fields.prefix) {
        morphemeBreakdown.prefix = {
          text: fields.prefix,
          meaning: fields.prefixMeaning || ''
        };
      }
      
      if (fields.suffix) {
        morphemeBreakdown.suffix = {
          text: fields.suffix,
          meaning: fields.suffixMeaning || ''
        };
      }
      
      // Process image attachments if they exist
      let images = [];
      if (fields.images) {
        // If images are stored as a JSON string
        if (typeof fields.images === 'string') {
          try {
            images = JSON.parse(fields.images);
          } catch (e) {
            console.error('Failed to parse images JSON:', e);
            images = [];
          }
        } 
        // If images are stored as an array of objects
        else if (Array.isArray(fields.images)) {
          images = fields.images;
        }
        // If images are Airtable attachments
        else if (fields.Attachments && Array.isArray(fields.Attachments)) {
          images = fields.Attachments.map((attachment: any, index: number) => ({
            id: `${record.id}-img-${index}`,
            url: attachment.url,
            alt: `Image ${index+1} for ${fields.word || 'word'}`
          }));
        }
      }
      
      // Map Airtable fields to our Word interface
      return {
        id: record.id,
        word: fields.word || '',
        pronunciation: fields.pronunciation || '',
        description: fields.description || '',
        languageOrigin: fields.languageOrigin || 'Unknown',
        partOfSpeech: fields.partOfSpeech || '',
        featured: !!fields.featured,
        etymology: {
          origin: fields.etymologyOrigin || '',
          evolution: fields.etymologyEvolution || '',
          culturalVariations: fields.culturalVariations
        },
        definitions: [
          {
            type: fields.primaryDefinitionType || 'primary',
            text: fields.primaryDefinition || ''
          },
          ...(fields.secondaryDefinition ? [{
            type: fields.secondaryDefinitionType || 'standard',
            text: fields.secondaryDefinition
          }] : []),
          ...(fields.contextualDefinition ? [{
            type: 'contextual',
            text: fields.contextualDefinition
          }] : [])
        ].filter(def => def.text), // Only include definitions with text
        forms: {
          noun: fields.formNoun,
          verb: fields.formVerb,
          adjective: fields.formAdjective,
          adverb: fields.formAdverb
        },
        usage: {
          commonCollocations: ensureArray(fields.commonCollocations),
          contextualUsage: fields.contextualUsage || '',
          sentenceStructure: fields.sentenceStructure,
          exampleSentence: fields.exampleSentence || ''
        },
        synonymsAntonyms: {
          synonyms: ensureArray(fields.synonyms),
          antonyms: ensureArray(fields.antonyms)
        },
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
    await testBase('Words').select({ maxRecords: 1 }).firstPage();
    return true;
  } catch (error) {
    console.error('Error testing Airtable connection:', error);
    return false;
  }
};
