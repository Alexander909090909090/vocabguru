
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export class SecureInputValidationService {
  // Sanitize HTML content to prevent XSS - more restrictive configuration
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
    });
  }

  // Validate and sanitize text input with enhanced security
  static validateText(
    input: string,
    options: {
      maxLength?: number;
      minLength?: number;
      allowHTML?: boolean;
      required?: boolean;
      pattern?: RegExp;
      allowedChars?: RegExp;
    } = {}
  ): ValidationResult {
    const errors: string[] = [];
    
    // Type check
    if (typeof input !== 'string') {
      errors.push('Input must be a string');
      return { isValid: false, errors };
    }
    
    if (options.required && (!input || input.trim().length === 0)) {
      errors.push('This field is required');
    }

    if (input && options.minLength && input.length < options.minLength) {
      errors.push(`Minimum length is ${options.minLength} characters`);
    }

    if (input && options.maxLength && input.length > options.maxLength) {
      errors.push(`Maximum length is ${options.maxLength} characters`);
    }

    if (input && options.pattern && !options.pattern.test(input)) {
      errors.push('Invalid format');
    }

    // Check for allowed characters if specified
    if (input && options.allowedChars && !options.allowedChars.test(input)) {
      errors.push('Contains invalid characters');
    }

    // Remove null bytes and control characters except newlines and tabs
    let cleanedInput = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    const sanitizedValue = options.allowHTML 
      ? this.sanitizeHTML(cleanedInput)
      : cleanedInput.replace(/<[^>]*>/g, ''); // Strip all HTML

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedValue.trim()
    };
  }

  // Enhanced email validation with additional security checks
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      // Length check (RFC 5321 limit)
      if (email.length > 254) {
        errors.push('Email address is too long');
      }
      
      // Format validation
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
      
      // Check for suspicious patterns
      if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
        errors.push('Invalid email format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: email.toLowerCase().trim()
    };
  }

  // Enhanced password validation
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (password.length > 128) {
        errors.push('Password must be less than 128 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      
      // Check for common weak patterns
      const commonPatterns = [
        /(.)\1{3,}/, // Repeated characters
        /123456|654321|abcdef|qwerty/i, // Common sequences
        /password|admin|user|login/i // Common words
      ];
      
      for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
          errors.push('Password contains common weak patterns');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: password // Don't trim passwords
    };
  }

  // Enhanced API key validation
  static validateAPIKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey || apiKey.trim().length === 0) {
      errors.push('API key is required');
    } else {
      // Basic API key validation - most API keys are at least 10 characters
      if (apiKey.length < 10) {
        errors.push('API key must be at least 10 characters long');
      }
      
      if (apiKey.length > 512) {
        errors.push('API key is too long');
      }
      
      // Check for suspicious patterns that might indicate it's not a real API key
      const suspiciousPatterns = [
        'your-api-key',
        'paste-here',
        'enter-key-here',
        'api-key-here',
        'your_api_key',
        'insert-key'
      ];
      
      const lowerKey = apiKey.toLowerCase();
      for (const pattern of suspiciousPatterns) {
        if (lowerKey.includes(pattern)) {
          errors.push('Please enter a valid API key');
          break;
        }
      }
      
      // Check for incomplete API key patterns
      if (apiKey === 'sk-' || apiKey === 'hf_' || apiKey.length < 20) {
        errors.push('API key appears to be incomplete');
      }
      
      // Validate character set (most API keys are alphanumeric with some special chars)
      if (!/^[a-zA-Z0-9\-_.:]+$/.test(apiKey)) {
        errors.push('API key contains invalid characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: apiKey.trim()
    };
  }

  // Enhanced search query validation
  static validateSearchQuery(query: string): ValidationResult {
    return this.validateText(query, {
      maxLength: 100,
      minLength: 1,
      required: true,
      allowHTML: false,
      allowedChars: /^[a-zA-Z0-9\s\-'\.]+$/
    });
  }

  // Enhanced user notes validation
  static validateUserNotes(notes: string): ValidationResult {
    return this.validateText(notes, {
      maxLength: 1000,
      allowHTML: true,
      required: false
    });
  }

  // Enhanced rate limiting with sliding window
  private static rateLimitStore = new Map<string, number[]>();

  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }
    
    const timestamps = this.rateLimitStore.get(key)!;
    
    // Remove old timestamps outside the window
    const recentTimestamps = timestamps.filter(time => time > windowStart);
    
    if (recentTimestamps.length >= maxRequests) {
      toast.error('Too many requests. Please wait before trying again.');
      return false;
    }
    
    recentTimestamps.push(now);
    this.rateLimitStore.set(key, recentTimestamps);
    
    return true;
  }

  // Enhanced JSON data sanitization
  static sanitizeJSONData(data: any, maxDepth: number = 10, currentDepth: number = 0): any {
    // Prevent deep recursion attacks
    if (currentDepth > maxDepth) {
      return null;
    }
    
    if (typeof data === 'string') {
      return this.sanitizeHTML(data);
    }

    if (Array.isArray(data)) {
      return data.slice(0, 1000).map(item => this.sanitizeJSONData(item, maxDepth, currentDepth + 1));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      let keyCount = 0;
      
      for (const [key, value] of Object.entries(data)) {
        // Limit number of keys to prevent DoS
        if (keyCount >= 100) break;
        
        // Sanitize key names
        const cleanKey = key.replace(/[<>\"'&]/g, '');
        if (cleanKey.length > 0 && cleanKey.length <= 100) {
          sanitized[cleanKey] = this.sanitizeJSONData(value, maxDepth, currentDepth + 1);
          keyCount++;
        }
      }
      return sanitized;
    }

    return data;
  }

  // Username validation
  static validateUsername(username: string): ValidationResult {
    return this.validateText(username, {
      minLength: 3,
      maxLength: 30,
      required: true,
      allowHTML: false,
      allowedChars: /^[a-zA-Z0-9_-]+$/,
      pattern: /^[a-zA-Z0-9_-]{3,30}$/
    });
  }

  // Learning level validation
  static validateLearningLevel(level: string): ValidationResult {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const errors: string[] = [];

    if (!validLevels.includes(level)) {
      errors.push('Invalid learning level');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: level
    };
  }

  // Daily goal validation
  static validateDailyGoal(goal: number): ValidationResult {
    const errors: string[] = [];

    if (!Number.isInteger(goal) || goal < 1 || goal > 100) {
      errors.push('Daily goal must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: goal
    };
  }
}
