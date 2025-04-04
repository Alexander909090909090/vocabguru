
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
  },
  {
    id: "ambivalent",
    word: "Ambivalent",
    pronunciation: "/æmˈbɪv.ə.lənt/",
    description: "Having mixed feelings or contradictory ideas about something or someone.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      prefix: { text: "ambi-", meaning: "both, on both sides" },
      root: { text: "val", meaning: "strength, worth" },
      suffix: { text: "-ent", meaning: "in a state or condition" }
    },
    etymology: {
      origin: "Latin combination of 'ambi' (both) and 'valere' (to be strong)",
      evolution: "Modern Latin 'ambivalentia' (20th century) → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Having mixed feelings or contradictory ideas about something or someone."
      },
      {
        type: "extended",
        text: "In psychology, simultaneously experiencing opposing emotional attitudes toward a person or object."
      }
    ],
    forms: {
      noun: "ambivalence",
      adverb: "ambivalently"
    },
    usage: {
      commonCollocations: ["ambivalent feelings", "ambivalent relationship"],
      contextualUsage: "Used to describe complex emotional or intellectual states of uncertainty",
      exampleSentence: "She felt ambivalent about accepting the job offer abroad."
    },
    synonymsAntonyms: {
      synonyms: ["conflicted", "uncertain", "indecisive"],
      antonyms: ["decisive", "certain", "resolute"]
    },
    images: [
      {
        id: "ambivalent-1",
        url: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17",
        alt: "Person with a conflicted, thoughtful expression"
      }
    ]
  },
  {
    id: "nefarious",
    word: "Nefarious",
    pronunciation: "/nɪˈfeə.ri.əs/",
    description: "Extremely wicked or villainous; infamous for being wicked.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      root: { text: "nefas", meaning: "crime, wrong, impiety" },
      suffix: { text: "-ious", meaning: "characterized by" }
    },
    etymology: {
      origin: "Latin 'nefarius' from 'nefas' meaning 'crime or wrongdoing'",
      evolution: "Latin nefarius → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Extremely wicked or villainous; infamous for being wicked."
      },
      {
        type: "standard",
        text: "Morally reprehensible; evil or sinister."
      }
    ],
    forms: {
      adverb: "nefariously",
      noun: "nefariousness"
    },
    usage: {
      commonCollocations: ["nefarious scheme", "nefarious activities"],
      contextualUsage: "Often used to describe criminal or morally reprehensible plans or actions",
      exampleSentence: "The detective uncovered the criminal's nefarious plot to steal the priceless artifacts."
    },
    synonymsAntonyms: {
      synonyms: ["villainous", "evil", "wicked"],
      antonyms: ["virtuous", "honorable", "righteous"]
    },
    images: [
      {
        id: "nefarious-1",
        url: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1",
        alt: "Shadowy figure symbolizing nefarious intentions"
      }
    ]
  },
  {
    id: "serendipity",
    word: "Serendipity",
    pronunciation: "/ˌser.ənˈdɪp.ə.ti/",
    description: "The occurrence and development of events by chance in a happy or beneficial way.",
    languageOrigin: "English (coined)",
    partOfSpeech: "noun",
    morphemeBreakdown: {
      root: { text: "serendip", meaning: "Sri Lanka (in old Persian tales)" },
      suffix: { text: "-ity", meaning: "quality or state" }
    },
    etymology: {
      origin: "Coined by Horace Walpole in 1754 from the Persian fairy tale 'The Three Princes of Serendip'",
      evolution: "Walpole's coinage → Modern English",
    },
    definitions: [
      {
        type: "primary",
        text: "The occurrence and development of events by chance in a happy or beneficial way."
      },
      {
        type: "extended",
        text: "The faculty of making fortunate discoveries by accident."
      }
    ],
    forms: {
      adjective: "serendipitous",
      adverb: "serendipitously"
    },
    usage: {
      commonCollocations: ["happy serendipity", "serendipity moment"],
      contextualUsage: "Used to describe fortunate coincidences or unexpected but valuable discoveries",
      exampleSentence: "By serendipity, she found her dream job while helping a friend with an interview."
    },
    synonymsAntonyms: {
      synonyms: ["chance", "fortune", "luck"],
      antonyms: ["misfortune", "design", "intention"]
    },
    images: [
      {
        id: "serendipity-1",
        url: "https://images.unsplash.com/photo-1494059980473-813e73ee784b",
        alt: "Sun rays through forest trees, representing an unexpected beautiful discovery"
      }
    ]
  },
  {
    id: "quintessential",
    word: "Quintessential",
    pronunciation: "/ˌkwɪn.tɪˈsen.ʃəl/",
    description: "Representing the most perfect or typical example of a quality or class.",
    languageOrigin: "Latin",
    partOfSpeech: "adjective",
    morphemeBreakdown: {
      prefix: { text: "quint-", meaning: "five, fifth" },
      root: { text: "essent", meaning: "being, essence" },
      suffix: { text: "-ial", meaning: "relating to, characterized by" }
    },
    etymology: {
      origin: "Medieval Latin 'quinta essentia' meaning 'fifth essence'",
      evolution: "Medieval Latin → French → English",
    },
    definitions: [
      {
        type: "primary",
        text: "Representing the most perfect or typical example of a quality or class."
      },
      {
        type: "extended",
        text: "The pure, highly concentrated essence of something."
      }
    ],
    forms: {
      noun: "quintessence",
      adverb: "quintessentially"
    },
    usage: {
      commonCollocations: ["quintessential example", "quintessential British"],
      contextualUsage: "Used to describe perfect or archetypal examples of something",
      exampleSentence: "The small cottage with a garden is the quintessential English country home."
    },
    synonymsAntonyms: {
      synonyms: ["archetypal", "classic", "exemplary"],
      antonyms: ["atypical", "uncharacteristic", "unusual"]
    },
    images: [
      {
        id: "quintessential-1",
        url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65",
        alt: "A quintessential cottage in the countryside"
      }
    ]
  },
  {
    id: "juxtaposition",
    word: "Juxtaposition",
    pronunciation: "/ˌdʒʌk.stə.pəˈzɪʃ.ən/",
    description: "The act of placing two things next to each other, especially for comparison or contrast.",
    languageOrigin: "Latin",
    partOfSpeech: "noun",
    morphemeBreakdown: {
      prefix: { text: "juxta-", meaning: "next to, close to" },
      root: { text: "posit", meaning: "placed" },
      suffix: { text: "-ion", meaning: "action or condition" }
    },
    etymology: {
      origin: "Latin 'juxta' (next to) + 'positionem' (position)",
      evolution: "Latin → French → English",
    },
    definitions: [
      {
        type: "primary",
        text: "The act of placing two things next to each other, especially for comparison or contrast."
      },
      {
        type: "contextual",
        text: "In art and literature, placing contrasting elements close together to emphasize their differences."
      }
    ],
    forms: {
      verb: "juxtapose",
      adjective: "juxtaposed"
    },
    usage: {
      commonCollocations: ["interesting juxtaposition", "stark juxtaposition"],
      contextualUsage: "Used in art, literature, and general language to describe the placement of contrasting elements",
      exampleSentence: "The juxtaposition of the modern skyscraper next to the historic church created a striking visual contrast."
    },
    synonymsAntonyms: {
      synonyms: ["contrast", "comparison", "proximity"],
      antonyms: ["separation", "isolation", "disconnection"]
    },
    images: [
      {
        id: "juxtaposition-1",
        url: "https://images.unsplash.com/photo-1504719219507-85f2e359b1e9",
        alt: "Modern glass building next to historic architecture, showing juxtaposition"
      }
    ]
  }
];

export default words;
