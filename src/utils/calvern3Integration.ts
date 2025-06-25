
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
      console.log(`Calling Calvern 3.0 API for word: "${word}"`);
      
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
        console.error(`Calvern 3.0 API request failed: ${response.status} ${response.statusText}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const result: Calvern3Response = await response.json();
      console.log('Calvern 3.0 API response:', result);
      
      if (!result.success) {
        console.error('Calvern 3.0 API returned error:', result.error);
        throw new Error(result.error || 'Analysis failed');
      }

      // Return the breakdown or formatted response as markdown text
      const analysis = result.breakdown || result.formatted_response;
      
      if (typeof analysis === 'string') {
        return analysis;
      } else if (typeof analysis === 'object') {
        // If it's an object, try to stringify it in a readable format
        return JSON.stringify(analysis, null, 2);
      } else {
        console.warn('Unexpected response format from Calvern 3.0:', typeof analysis);
        return this.createFallbackBreakdown(word);
      }
    } catch (error) {
      console.error('Calvern 3.0 API Error:', error);
      throw error;
    }
  }

  static async getChatResponse(message: string, context?: string): Promise<string> {
    try {
      console.log(`Calling Calvern 3.0 chat for message: "${message}"`);
      
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
        console.error(`Calvern 3.0 chat request failed: ${response.status}`);
        throw new Error(`API request failed: ${response.status}`);
      }

      const result: Calvern3Response = await response.json();
      
      if (!result.success) {
        console.error('Calvern 3.0 chat error:', result.error);
        throw new Error(result.error || 'Chat response failed');
      }

      const response_text = result.breakdown || result.formatted_response;
      return typeof response_text === 'string' ? response_text : JSON.stringify(response_text);
    } catch (error) {
      console.error('Calvern 3.0 Chat Error:', error);
      throw error;
    }
  }

  static createFallbackBreakdown(word: string): string {
    console.log(`Creating fallback breakdown for word: "${word}"`);
    
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

*Powered by Calvern 3.0 - Advanced Linguistic Intelligence*

*Note: This is a fallback analysis. Please try again for the full Calvern 3.0 experience.*`;
  }
}
