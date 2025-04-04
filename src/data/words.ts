
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

const words: Word[] = [
  {
    id: "abundant",
    word: "Abundant",
    pronunciation: "/əˈbʌn.dənt/",
    description: "Existing in large quantities; plentiful.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      prefix: { text: "ab-", meaning: "from, away" },
      root: { text: "und", meaning: "wave, flow" },
      suffix: { text: "-ant", meaning: "forming adjectives" }
    },
    etymology: {
      origin: "Latin 'abundare' meaning 'to overflow'",
      evolution: "Latin abundantem → Old French → Middle English",
    },
    definitions: [
      {
        type: "primary",
        text: "Existing or available in large quantities; plentiful."
      },
      {
        type: "standard",
        text: "Present in great quantity."
      }
    ],
    forms: {
      noun: "abundance",
      adverb: "abundantly"
    },
    usage: {
      commonCollocations: ["abundant resources", "abundant wildlife"],
      contextualUsage: "Used to describe resources or items that are plentiful",
      exampleSentence: "The fertile land yielded an abundant harvest."
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
      prefix: { text: "super-", meaning: "above, over, beyond" },
      root: { text: "flu", meaning: "to flow" },
      suffix: { text: "-ous", meaning: "forming adjectives" }
    },
    etymology: {
      origin: "Latin 'superfluus', combining 'super' (above) and 'fluere' (to flow)",
      evolution: "Latin superfluus → Old French → Middle English",
    },
    definitions: [
      {
        type: "primary",
        text: "Exceeding what is sufficient or required; extra, unnecessary."
      },
      {
        type: "standard",
        text: "Beyond what is needed, redundant."
      }
    ],
    forms: {
      noun: "superfluity",
      adverb: "superfluously"
    },
    usage: {
      commonCollocations: ["superfluous details", "superfluous expenses"],
      contextualUsage: "Used to critique unnecessary additions or excessive elements",
      exampleSentence: "The editor removed all superfluous words to make the article more concise."
    },
    synonymsAntonyms: {
      synonyms: ["unnecessary", "excessive", "redundant"],
      antonyms: ["necessary", "essential", "required"]
    },
    images: [
      {
        id: "superfluous-1",
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
        alt: "Excessive decorative elements on a building"
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
      prefix: { text: "ep-", meaning: "on, at, besides" },
      root: { text: "hemer", meaning: "day" },
      suffix: { text: "-al", meaning: "relating to" }
    },
    etymology: {
      origin: "Greek 'ephemeros', literally meaning 'lasting only a day'",
      evolution: "Greek ephemeros → Late Latin → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Lasting for a very short time; transitory."
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
      commonCollocations: ["ephemeral beauty", "ephemeral moment"],
      contextualUsage: "Often used in artistic or philosophical contexts to discuss impermanence",
      exampleSentence: "The ephemeral nature of cherry blossoms makes their beauty all the more precious."
    },
    synonymsAntonyms: {
      synonyms: ["fleeting", "transient", "momentary"],
      antonyms: ["permanent", "enduring", "everlasting"]
    },
    images: [
      {
        id: "ephemeral-1",
        url: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c",
        alt: "Cherry blossoms exemplifying ephemeral beauty"
      }
    ]
  },
  {
    id: "resilient",
    word: "Resilient",
    pronunciation: "/rɪˈzɪl.i.ənt/",
    description: "Able to recover quickly from difficulties; tough.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      prefix: { text: "re-", meaning: "back, again" },
      root: { text: "sili", meaning: "to jump, leap" },
      suffix: { text: "-ent", meaning: "in a state or condition" }
    },
    etymology: {
      origin: "Latin 'resiliens', from 'resilire' meaning 'to rebound'",
      evolution: "Latin resiliens → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Able to recover quickly from difficulties; tough."
      },
      {
        type: "standard",
        text: "Capable of withstanding shock without permanent deformation or rupture."
      }
    ],
    forms: {
      noun: "resilience",
      adverb: "resiliently"
    },
    usage: {
      commonCollocations: ["resilient community", "resilient system"],
      contextualUsage: "Used to describe people or materials that can recover from stress",
      exampleSentence: "Children are often remarkably resilient when facing challenges."
    },
    synonymsAntonyms: {
      synonyms: ["tough", "adaptable", "hardy"],
      antonyms: ["fragile", "weak", "vulnerable"]
    },
    images: [
      {
        id: "resilient-1",
        url: "https://images.unsplash.com/photo-1520810627419-35e362c5dc07",
        alt: "Person climbing a challenging mountain, showing resilience"
      }
    ]
  },
  {
    id: "ubiquitous",
    word: "Ubiquitous",
    pronunciation: "/juːˈbɪk.wɪ.təs/",
    description: "Present, appearing, or found everywhere.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      root: { text: "ubique", meaning: "everywhere" },
      suffix: { text: "-ous", meaning: "full of, having" }
    },
    etymology: {
      origin: "Latin 'ubique' meaning 'everywhere'",
      evolution: "Latin ubique → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Present, appearing, or found everywhere."
      },
      {
        type: "standard",
        text: "Omnipresent; constantly encountered."
      }
    ],
    forms: {
      noun: "ubiquity",
      adverb: "ubiquitously"
    },
    usage: {
      commonCollocations: ["ubiquitous technology", "ubiquitous presence"],
      contextualUsage: "Used to describe things that seem to be everywhere at once",
      exampleSentence: "Smartphones have become ubiquitous in modern society."
    },
    synonymsAntonyms: {
      synonyms: ["omnipresent", "universal", "pervasive"],
      antonyms: ["rare", "scarce", "uncommon"]
    },
    images: [
      {
        id: "ubiquitous-1",
        url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
        alt: "Crowd of people using smartphones, showing their ubiquity"
      }
    ]
  }
];

export default words;
