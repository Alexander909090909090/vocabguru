export interface Morpheme {
  text: string;
  meaning: string;
}

export interface MorphemeBreakdown {
  prefix?: Morpheme;
  root: Morpheme;
  suffix?: Morpheme;
}

export interface WordDefinition {
  type: string;
  text: string;
}

export interface WordImage {
  id: string;
  url: string;
  alt: string;
}

export interface Word {
  id: string;
  word: string;
  description: string;
  languageOrigin: string;
  partOfSpeech: string;
  morphemeBreakdown: MorphemeBreakdown;
  etymology: {
    origin: string;
    evolution?: string;
    culturalVariations?: string;
  };
  definitions: WordDefinition[];
  forms: {
    noun?: string;
    verb?: string;
    adjective?: string;
    adverb?: string;
  };
  usage: {
    commonCollocations: string[];
    contextualUsage: string;
    sentenceStructure?: string;
    exampleSentence: string;
  };
  synonymsAntonyms: {
    synonyms: string[];
    antonyms: string[];
  };
  images: WordImage[];
  featured: boolean;
}
