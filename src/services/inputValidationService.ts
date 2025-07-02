
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export class InputValidationService {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: []
    });
  }

  // Validate and sanitize text input
  static validateText(
    input: string,
    options: {
      maxLength?: number;
      minLength?: number;
      allowHTML?: boolean;
      required?: boolean;
      pattern?: RegExp;
    } = {}
  ): ValidationResult {
    const errors: string[] = [];
    
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

    const sanitizedValue = options.allowHTML 
      ? this.sanitizeHTML(input)
      : input.replace(/<[^>]*>/g, ''); // Strip all HTML

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  // Validate email format
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: email.toLowerCase().trim()
    };
  }

  // Validate password strength
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password || password.length === 0) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
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
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: password
    };
  }

  // Validate API keys
  static validateAPIKey(apiKey: string): ValidationResult {
    const errors: string[] = [];

    if (!apiKey || apiKey.trim().length === 0) {
      errors.push('API key is required');
    } else {
      // Basic API key validation - most API keys are at least 10 characters
      if (apiKey.length < 10) {
        errors.push('API key must be at least 10 characters long');
      }
      // Check for suspicious patterns that might indicate it's not a real API key
      if (apiKey.toLowerCase().includes('your-api-key') || 
          apiKey.toLowerCase().includes('paste-here') ||
          apiKey === 'sk-' || apiKey === 'hf_') {
        errors.push('Please enter a valid API key');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: apiKey.trim()
    };
  }

  // Validate search queries
  static validateSearchQuery(query: string): ValidationResult {
    return this.validateText(query, {
      maxLength: 100,
      minLength: 1,
      required: true,
      allowHTML: false,
      pattern: /^[a-zA-Z0-9\s\-']+$/
    });
  }

  // Validate user notes
  static validateUserNotes(notes: string): ValidationResult {
    return this.validateText(notes, {
      maxLength: 1000,
      allowHTML: true,
      required: false
    });
  }

  // Rate limiting check (client-side basic implementation)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      toast.error('Too many requests. Please wait before trying again.');
      return false;
    }

    record.count++;
    return true;
  }

  // Sanitize JSON data
  static sanitizeJSONData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeHTML(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeJSONData(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeJSONData(value);
      }
      return sanitized;
    }

    return data;
  }
}
