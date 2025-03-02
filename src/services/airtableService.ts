
import Airtable from 'airtable';
import { Word } from '@/data/words';

// Initialize Airtable with your personal access token
let base: any = null;

export const initAirtable = (personalAccessToken: string, baseId: string) => {
  try {
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
      }
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
        ],
        forms: {
          noun: fields.formNoun,
          verb: fields.formVerb,
          adjective: fields.formAdjective,
          adverb: fields.formAdverb
        },
        usage: {
          commonCollocations: fields.commonCollocations ? 
            (typeof fields.commonCollocations === 'string' ? 
              fields.commonCollocations.split(',').map(item => item.trim()) : 
              fields.commonCollocations) : 
            [],
          contextualUsage: fields.contextualUsage || '',
          sentenceStructure: fields.sentenceStructure,
          exampleSentence: fields.exampleSentence || ''
        },
        synonymsAntonyms: {
          synonyms: fields.synonyms ? 
            (typeof fields.synonyms === 'string' ? 
              fields.synonyms.split(',').map(item => item.trim()) : 
              fields.synonyms) : 
            [],
          antonyms: fields.antonyms ? 
            (typeof fields.antonyms === 'string' ? 
              fields.antonyms.split(',').map(item => item.trim()) : 
              fields.antonyms) : 
            []
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
          (typeof fields.images === 'string' ? 
            JSON.parse(fields.images) : 
            fields.images).map((img: any, index: number) => ({
              id: img.id || `${record.id}-img-${index}`,
              url: img.url,
              alt: img.alt || `Image ${index+1} for ${fields.word}`
            })) : 
          []
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
