
export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
  structuredData?: {
    morphemeBreakdown?: {
      prefix?: { text: string; meaning: string };
      root: { text: string; meaning: string };
      suffix?: { text: string; meaning: string };
    };
    etymology?: {
      origin: string;
      evolution: string;
    };
    definitions?: {
      type: string;
      text: string;
    }[];
  };
}
