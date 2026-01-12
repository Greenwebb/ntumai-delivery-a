// @ts-nocheck

// Form management hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { UseFormOptions, FormState, FormField } from './types';
import { validationRules, validateForm } from '@/src/utils/validation';

export interface UseFormResult<T> {
  // Form state
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  
  // Field helpers
  getFieldProps: (name: keyof T) => {
    value: any;
    onChangeText: (value: any) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
    dirty: boolean;
  };
  getFieldState: (name: keyof T) => FormField;
  
  // Form actions
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  setFieldTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  
  // Validation
  validateField: (name: keyof T) => Promise<string | undefined>;
  validateForm: () => Promise<boolean>;
  
  // Form submission
  handleSubmit: (onSubmit?: (values: T) => void | Promise<void>) => Promise<void>;
  
  // Reset
  reset: (values?: Partial<T>) => void;
  resetField: (name: keyof T) => void;
  
  // Utilities
  isDirty: boolean;
  hasErrors: boolean;
  canSubmit: boolean;
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T> = {}
): UseFormResult<T> => {
  const {
    initialValues = {} as Partial<T>,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    onSubmit,
    onValidationError,
  } = options;

  // Form state
  const [values, setValuesState] = useState<T>(initialValues as T);
  const [errors, setErrorsState] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouchedState] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [dirty, setDirtyState] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // Refs
  const initialValuesRef = useRef(initialValues);
  const validationTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Computed values
  const isValid = Object.keys(errors).length === 0;
  const isDirty = Object.values(dirty).some(Boolean);
  const hasErrors = Object.keys(errors).length > 0;
  const canSubmit = isValid && !isSubmitting;

  // Clear validation timeout
  const clearValidationTimeout = useCallback((name: string) => {
    if (validationTimeoutRef.current[name]) {
      clearTimeout(validationTimeoutRef.current[name]);
      delete validationTimeoutRef.current[name];
    }
  }, []);

  // Validate single field
  const validateField = useCallback(async (name: keyof T): Promise<string | undefined> => {
    try {
      const value = values[name];
      
      // Use validation schema if provided
      if (validationSchema && validationSchema[name]) {
        const fieldSchema = validationSchema[name];
        
        // Handle different validation schema formats
        if (typeof fieldSchema === 'function') {
          const result = await fieldSchema(value, values);
          return result;
        } else if (Array.isArray(fieldSchema)) {
          // Array of validation rules
          for (const rule of fieldSchema) {
            const result = await rule(value, values);
            if (result) return result;
          }
        } else if (typeof fieldSchema === 'object') {
          // Validation rules object
          const result = validateForm({ [name]: value }, { [name]: fieldSchema });
          return result.errors[name as string];
        }
      }
      
      return undefined;
    } catch (error: any) {
      return error.message || 'Validation error';
    }
  }, [values, validationSchema]);

  // Validate entire form
  const validateFormFields = useCallback(async (): Promise<boolean> => {
    try {
      const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
      
      // Validate all fields
      const validationPromises = Object.keys(values).map(async (key) => {
        const fieldName = key as keyof T;
        const error = await validateField(fieldName);
        if (error) {
          newErrors[fieldName] = error;
        }
      });
      
      await Promise.all(validationPromises);
      
      // Update errors state
      setErrorsState(newErrors);
      
      const hasErrors = Object.keys(newErrors).length > 0;
      
      if (hasErrors && onValidationError) {
        onValidationError(newErrors);
      }
      
      return !hasErrors;
    } catch (error) {
      console.error('Form validation error:', error);
      return false;
    }
  }, [values, validateField, onValidationError]);

  // Set single value
  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [name]: value }));
    
    // Mark field as dirty
    setDirtyState(prev => ({ ...prev, [name]: true }));
    
    // Clear existing error
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    
    // Validate on change if enabled
    if (validateOnChange) {
      clearValidationTimeout(name as string);
      validationTimeoutRef.current[name as string] = setTimeout(async () => {
        const error = await validateField(name);
        if (error) {
          setErrorsState(prev => ({ ...prev, [name]: error }));
        }
      }, 300); // Debounce validation
    }
  }, [validateOnChange, validateField, clearValidationTimeout]);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    // Mark fields as dirty
    const dirtyFields = Object.keys(newValues).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setDirtyState(prev => ({ ...prev, ...dirtyFields }));
    
    // Clear errors for updated fields
    setErrorsState(prev => {
      const newErrors = { ...prev };
      Object.keys(newValues).forEach(key => {
        delete newErrors[key as keyof T];
      });
      return newErrors;
    });
  }, []);

  // Set single error
  const setError = useCallback((name: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(prev => ({ ...prev, ...newErrors }));
  }, []);

  // Set field touched
  const setTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
    
    // Validate on blur if enabled and field is touched
    if (validateOnBlur && isTouched) {
      setTimeout(async () => {
        const error = await validateField(name);
        if (error) {
          setErrorsState(prev => ({ ...prev, [name]: error }));
        }
      }, 0);
    }
  }, [validateOnBlur, validateField]);

  // Set multiple touched fields
  const setFieldTouched = useCallback((touchedFields: Partial<Record<keyof T, boolean>>) => {
    setTouchedState(prev => ({ ...prev, ...touchedFields }));
  }, []);

  // Get field props for input components
  const getFieldProps = useCallback((name: keyof T) => {
    return {
      value: values[name],
      onChangeText: (value: any) => setValue(name, value),
      onBlur: () => setTouched(name, true),
      error: errors[name],
      touched: touched[name] || false,
      dirty: dirty[name] || false,
    };
  }, [values, errors, touched, dirty, setValue, setTouched]);

  // Get field state
  const getFieldState = useCallback((name: keyof T): FormField => {
    return {
      value: values[name],
      error: errors[name],
      touched: touched[name] || false,
      dirty: dirty[name] || false,
      valid: !errors[name],
    };
  }, [values, errors, touched, dirty]);

  // Handle form submission
  const handleSubmit = useCallback(async (submitHandler?: (values: T) => void | Promise<void>) => {
    try {
      setIsSubmitting(true);
      setSubmitCount(prev => prev + 1);
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      setTouchedState(allTouched);
      
      // Validate form if enabled
      if (validateOnSubmit) {
        const isFormValid = await validateFormFields();
        if (!isFormValid) {
          return;
        }
      }
      
      // Call submit handler
      const handler = submitHandler || onSubmit;
      if (handler) {
        await handler(values);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      // You might want to set a global form error here
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateOnSubmit, validateFormFields, onSubmit]);

  // Reset form
  const reset = useCallback((resetValues?: Partial<T>) => {
    const newValues = resetValues || initialValuesRef.current;
    setValuesState(newValues as T);
    setErrorsState({} as Record<keyof T, string>);
    setTouchedState({} as Record<keyof T, boolean>);
    setDirtyState({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
    setSubmitCount(0);
    
    // Clear validation timeouts
    Object.keys(validationTimeoutRef.current).forEach(key => {
      clearValidationTimeout(key);
    });
  }, [clearValidationTimeout]);

  // Reset single field
  const resetField = useCallback((name: keyof T) => {
    const initialValue = initialValuesRef.current[name];
    setValuesState(prev => ({ ...prev, [name]: initialValue }));
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setTouchedState(prev => ({ ...prev, [name]: false }));
    setDirtyState(prev => ({ ...prev, [name]: false }));
    
    clearValidationTimeout(name as string);
  }, [clearValidationTimeout]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.keys(validationTimeoutRef.current).forEach(key => {
        clearValidationTimeout(key);
      });
    };
  }, [clearValidationTimeout]);

  return {
    // Form state
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    submitCount,
    
    // Field helpers
    getFieldProps,
    getFieldState,
    
    // Form actions
    setValue,
    setValues,
    setError,
    setErrors,
    setTouched,
    setFieldTouched,
    
    // Validation
    validateField,
    validateForm: validateFormFields,
    
    // Form submission
    handleSubmit,
    
    // Reset
    reset,
    resetField,
    
    // Utilities
    isDirty,
    hasErrors,
    canSubmit,
  };
};

// Specialized form hooks
export const useLoginForm = () => {
  return useForm<{
    email: string;
    password: string;
    rememberMe: boolean;
  }>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: {
      email: validationRules.email,
      password: validationRules.required,
    },
  });
};

export const useRegisterForm = () => {
  return useForm<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationSchema: {
      firstName: validationRules.required,
      lastName: validationRules.required,
      email: validationRules.email,
      phone: validationRules.phone,
      password: validationRules.password,
      confirmPassword: (value: string, values: any) => {
        if (value !== values.password) {
          return 'Passwords do not match';
        }
      },
      acceptTerms: (value: boolean) => {
        if (!value) {
          return 'You must accept the terms and conditions';
        }
      },
    },
  });
};

export const useProfileForm = (initialData?: any) => {
  return useForm<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }>({
    initialValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
    },
    validationSchema: {
      firstName: validationRules.required,
      lastName: validationRules.required,
      email: validationRules.email,
      phone: validationRules.phone,
      postalCode: validationRules.postalCode,
    },
  });
};
