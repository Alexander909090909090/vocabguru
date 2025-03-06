
export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
  dictionary?: {
    source: "free-dictionary" | "merriam-webster";
    word?: string;
    definition?: string;
    etymology?: string;
    partOfSpeech?: string;
  };
}
