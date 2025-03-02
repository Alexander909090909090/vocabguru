export interface WordImage {
  id: string;
  url: string;
  alt: string;
}

export interface MorphemeBreakdown {
  prefix?: { text: string; meaning: string };
  root: { text: string; meaning: string };
  suffix?: { text: string; meaning: string };
}

export interface WordDefinition {
  type: 'primary' | 'standard' | 'extended' | 'contextual' | 'specialized';
  text: string;
}

export interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  description: string;
  languageOrigin: string;
  partOfSpeech: string;
  morphemeBreakdown: MorphemeBreakdown;
  etymology: {
    origin: string;
    evolution: string;
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
  featured?: boolean;
}

export const words: Word[] = [
  {
    id: "abundant",
    word: "Abundant",
    pronunciation: "/əˈbʌn.dənt/",
    description: "Describing a resource as abundant highlights its availability and richness.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      root: { text: "abundare", meaning: "to overflow" },
      suffix: { text: "-ant", meaning: "forming adjectives" }
    },
    etymology: {
      origin: "Abundant entered English in the late 14th century.",
      evolution: "Derived from Latin abundantem, meaning overflowing, plentiful.",
      culturalVariations: "The concept of abundance transcends cultures, symbolizing prosperity and plenitude."
    },
    definitions: [
      {
        type: "primary",
        text: "Existing or available in large quantities; plentiful."
      },
      {
        type: "standard",
        text: "Present in great quantity."
      },
      {
        type: "contextual",
        text: "Used in economic contexts to describe a surplus of goods or wealth."
      }
    ],
    forms: {
      noun: "abundance",
      adverb: "abundantly"
    },
    usage: {
      commonCollocations: ["abundant resources", "abundant wildlife"],
      contextualUsage: "Describing a resource as abundant highlights its availability and richness.",
      sentenceStructure: "Abundant can function as an adjective describing nouns rich in quantity.",
      exampleSentence: "The fertile land yielded an abundant harvest, providing sustenance for the entire village."
    },
    synonymsAntonyms: {
      synonyms: ["plentiful", "copious", "ample"],
      antonyms: ["scarce", "rare", "insufficient"]
    },
    images: [
      {
        id: "abundant-1",
        url: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
        alt: "Bird's eye view of abundant green mountains"
      },
      {
        id: "abundant-2",
        url: "https://images.unsplash.com/photo-1587553330562-08537edd9b9f",
        alt: "Abundant flowers in a field"
      },
      {
        id: "abundant-3",
        url: "https://images.unsplash.com/photo-1470685983317-0084951ce1ca",
        alt: "Abundant fruits in a market"
      }
    ],
    featured: true
  },
  {
    id: "superfluous",
    word: "Superfluous",
    pronunciation: "/suːˈpɜː.flu.əs/",
    description: "Beyond what is needed or useful; unnecessary or excessive.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      prefix: { text: "Super-", meaning: "above, over, beyond" },
      root: { text: "fluere", meaning: "to flow" },
      suffix: { text: "-ous", meaning: "forming adjectives" }
    },
    etymology: {
      origin: "The word originated from Latin 'superfluus', combining 'super' (above) and 'fluere' (to flow).",
      evolution: "Has maintained its essential meaning of excess or redundancy over time."
    },
    definitions: [
      {
        type: "primary",
        text: "Exceeding what is sufficient or required; extra, unnecessary."
      },
      {
        type: "standard",
        text: "Beyond what is needed, redundant."
      },
      {
        type: "extended",
        text: "Excessive or surplus in quantity."
      },
      {
        type: "contextual",
        text: "In various fields, refers to elements that are nonessential or redundant."
      }
    ],
    forms: {
      noun: "superfluity",
      adverb: "superfluously"
    },
    usage: {
      commonCollocations: ["superfluous details", "superfluous expenses", "superfluous decorations"],
      contextualUsage: "Often used to critique unnecessary additions or excessive elements.",
      exampleSentence: "The editor removed all superfluous words to make the article more concise."
    },
    synonymsAntonyms: {
      synonyms: ["unnecessary", "excessive", "redundant", "surplus"],
      antonyms: ["necessary", "essential", "required", "vital"]
    },
    images: [
      {
        id: "superfluous-1",
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
        alt: "Excessive decorative elements on a building"
      },
      {
        id: "superfluous-2",
        url: "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
        alt: "Minimalist design contrasting with excess"
      }
    ],
    featured: true
  },
  {
    id: "ephemeral",
    word: "Ephemeral",
    pronunciation: "/ɪˈfem.ər.əl/",
    description: "Lasting for a very short time; transitory.",
    languageOrigin: "Greek",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      root: { text: "ephemeros", meaning: "lasting only a day" },
      suffix: { text: "-al", meaning: "relating to" }
    },
    etymology: {
      origin: "From Greek 'ephemeros', literally meaning 'lasting only a day'.",
      evolution: "Evolved to describe any short-lived phenomenon, not just those lasting exactly one day."
    },
    definitions: [
      {
        type: "primary",
        text: "Lasting for a very short time; transitory."
      },
      {
        type: "standard",
        text: "Short-lived; temporary."
      },
      {
        type: "specialized",
        text: "In biology, refers to plants that complete their life cycle in a single season."
      }
    ],
    forms: {
      noun: "ephemerality",
      adverb: "ephemerally"
    },
    usage: {
      commonCollocations: ["ephemeral beauty", "ephemeral moment", "ephemeral art"],
      contextualUsage: "Often used in artistic or philosophical contexts to discuss impermanence.",
      exampleSentence: "The ephemeral nature of cherry blossoms makes their beauty all the more precious."
    },
    synonymsAntonyms: {
      synonyms: ["fleeting", "transient", "momentary", "brief"],
      antonyms: ["permanent", "enduring", "everlasting", "eternal"]
    },
    images: [
      {
        id: "ephemeral-1",
        url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c",
        alt: "Cherry blossoms exemplifying ephemeral beauty"
      },
      {
        id: "ephemeral-2",
        url: "https://images.unsplash.com/photo-1472614428373-2f05aff79e1a",
        alt: "Dandelion seeds about to be blown away"
      }
    ]
  }
];

export default words;
