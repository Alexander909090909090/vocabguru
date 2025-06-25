
// Integration service for Calvern 3.0 API
export interface Calvern3Request {
  word: string;
  analysis_type: 'comprehensive_breakdown' | 'chat' | 'explanation';
  context?: string;
}

export interface Calvern3Response {
  word: string;
  breakdown: string;
  formatted_response: any;
  success: boolean;
  error?: string;
}

export class Calvern3Service {
  private static readonly API_URL = 'https://calvern-codex.zapier.app/calvern-3-0';

  static async getComprehensiveBreakdown(word: string): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.trim(),
          analysis_type: 'comprehensive_breakdown'
        } as Calvern3Request)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result: Calvern3Response = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      return result.breakdown || result.formatted_response;
    } catch (error) {
      console.error('Calvern 3.0 API Error:', error);
      throw error;
    }
  }

  static async getChatResponse(message: string, context?: string): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: message,
          analysis_type: 'chat',
          context: context
        } as Calvern3Request)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result: Calvern3Response = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Chat response failed');
      }

      return result.breakdown || result.formatted_response;
    } catch (error) {
      console.error('Calvern 3.0 Chat Error:', error);
      throw error;
    }
  }

  static createFallbackBreakdown(word: string): string {
    return `# Comprehensive Breakdown of "${word}"

## Morpheme Breakdown

* **Root Word:** ${word} - Core meaning analysis
* **Analysis:** Detailed morphological breakdown unavailable - please try again

## Etymology

* **Historical Origins:** Analysis temporarily unavailable
* **Language of Origin:** To be determined
* **Word Evolution:** Evolution data will be provided shortly

## Definitions

* **Primary Definition:** Comprehensive definition analysis in progress

## Word Forms & Inflections

* **Base Form:** ${word}
* **Analysis:** Detailed forms analysis available soon

## Analysis of the Word

* **Parts of Speech:** Analysis in progress
* **Example:** "This is an example using the word ${word}."

---

*Powered by Calvern 3.0 - Advanced Linguistic Intelligence*`;
  }
}
