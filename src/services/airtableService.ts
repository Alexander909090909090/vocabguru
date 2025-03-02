
import Airtable from 'airtable';
import { Word } from '@/data/words';

// Initialize Airtable with your personal access token
let base: any = null;

export const initAirtable = (personalAccessToken: string, baseId: string) => {
  Airtable.configure({ apiKey: personalAccessToken });
  base = Airtable.base(baseId);
  
  // Store the credentials in localStorage for future use
  localStorage.setItem('airtablePersonalAccessToken', personalAccessToken);
  localStorage.setItem('airtableBaseId', baseId);
  
  return base;
};

// Check if we have stored credentials and initialize Airtable
export const getAirtableBase = () => {
  if (!base) {
    const personalAccessToken = localStorage.getItem('airtablePersonalAccessToken');
    const baseId = localStorage.getItem('airtableBaseId');
    
    if (personalAccessToken && baseId) {
      initAirtable(personalAccessToken, baseId);
    }
  }
  
  return base;
};

// Function to fetch words from Airtable
export const fetchWordsFromAirtable = async (): Promise<Word[]> => {
  const base = getAirtableBase();
  
  if (!base) {
    throw new Error('Airtable not initialized. Please set your Personal Access Token and Base ID.');
  }
  
  try {
    // Assuming your table is named 'Words'
    const records = await base('Words').select().all();
    
    return records.map((record: any) => {
      const fields = record.fields;
      
      // Map Airtable fields to our Word interface
      // This mapping assumes specific field names in your Airtable
      return {
        id: record.id,
        word: fields.word || '',
        description: fields.description || '',
        languageOrigin: fields.languageOrigin || 'Unknown',
        featured: !!fields.featured,
        etymology: {
          origin: fields.etymologyOrigin || '',
          evolution: fields.etymologyEvolution || ''
        },
        definitions: [
          {
            type: 'primary',
            text: fields.primaryDefinition || ''
          },
          ...(fields.secondaryDefinition ? [{
            type: 'secondary',
            text: fields.secondaryDefinition
          }] : [])
        ],
        usage: {
          contextualUsage: fields.contextualUsage || '',
          exampleSentence: fields.exampleSentence || ''
        },
        morphemeBreakdown: {
          prefix: fields.prefix ? {
            text: fields.prefix || '',
            meaning: fields.prefixMeaning || ''
          } : undefined,
          root: {
            text: fields.root || '',
            meaning: fields.rootMeaning || ''
          },
          suffix: fields.suffix ? {
            text: fields.suffix || '',
            meaning: fields.suffixMeaning || ''
          } : undefined
        },
        images: fields.images ? 
          JSON.parse(fields.images).map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || `Image ${index+1} for ${fields.word}`
          })) 
          : []
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
