
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SecureInputValidationService, ValidationResult } from '@/services/secureInputValidationService';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SecureInputProps {
  value: string;
  onChange: (value: string, validation: ValidationResult) => void;
  validation?: {
    maxLength?: number;
    minLength?: number;
    allowHTML?: boolean;
    required?: boolean;
    pattern?: RegExp;
  };
  placeholder?: string;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'textarea' | 'apikey';
  disabled?: boolean;
}

export function SecureInput({ 
  value, 
  onChange, 
  validation = {}, 
  placeholder, 
  className,
  type = 'text',
  disabled 
}: SecureInputProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: []
  });

  const handleChange = (newValue: string) => {
    let result: ValidationResult;

    switch (type) {
      case 'email':
        result = SecureInputValidationService.validateEmail(newValue);
        break;
      case 'password':
        result = SecureInputValidationService.validatePassword(newValue);
        break;
      case 'search':
        result = SecureInputValidationService.validateSearchQuery(newValue);
        break;
      case 'apikey':
        result = SecureInputValidationService.validateAPIKey(newValue);
        break;
      default:
        result = SecureInputValidationService.validateText(newValue, validation);
    }

    setValidationResult(result);
    onChange(result.sanitizedValue || newValue, result);
  };

  const inputProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      handleChange(e.target.value),
    placeholder,
    className: `${className} ${!validationResult.isValid ? 'border-red-500' : ''}`,
    disabled,
    maxLength: validation.maxLength
  };

  // Use password type for both password and apikey to hide the content
  const inputType = (type === 'password' || type === 'apikey') ? 'password' : 
                   (type === 'search' ? 'text' : type);

  return (
    <div className="space-y-2">
      {type === 'textarea' ? (
        <Textarea {...inputProps} />
      ) : (
        <Input {...inputProps} type={inputType} />
      )}
      
      {!validationResult.isValid && validationResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationResult.errors.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
