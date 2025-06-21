
import DOMPurify from 'dompurify';

export class InputValidator {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [] 
    });
  }

  // Validate and sanitize text input
  static sanitizeText(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') return '';
    
    // Remove null bytes and control characters except newlines and tabs
    const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim and limit length
    return cleaned.trim().substring(0, maxLength);
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate username format
  static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  // Validate learning level
  static isValidLearningLevel(level: string): boolean {
    return ['beginner', 'intermediate', 'advanced', 'expert'].includes(level);
  }

  // Validate daily goal range
  static isValidDailyGoal(goal: number): boolean {
    return Number.isInteger(goal) && goal >= 1 && goal <= 100;
  }

  // Validate word input
  static isValidWord(word: string): boolean {
    if (typeof word !== 'string') return false;
    const cleanWord = word.trim();
    return cleanWord.length >= 1 && cleanWord.length <= 100 && /^[a-zA-Z\s'-]+$/.test(cleanWord);
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      
      // Remove old requests outside the window
      const recentRequests = userRequests.filter(time => time > windowStart);
      requests.set(identifier, recentRequests);
      
      if (recentRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      recentRequests.push(now);
      return true; // Request allowed
    };
  }
}
