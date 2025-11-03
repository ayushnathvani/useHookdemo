import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Animated,
} from 'react-native';
import { useDebounce, usePrevious, useToggle } from '@uidotdev/usehooks';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'phone' | 'textarea';
  validation: ValidationRule;
  value: string;
  error: string | null;
  touched: boolean;
  focused: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bio: string;
}

const SmartFormValidationScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  // Validation states
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, toggleSubmitSuccess] = useToggle(false);

  // Change tracking
  const previousFormData = usePrevious(formData);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(0);

  // Debounced validation
  const debouncedFormData = useDebounce(formData, 300);

  // Form configuration
  const formFields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
      type: 'text',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
      },
      value: formData.firstName,
      error: errors.firstName,
      touched: touched.firstName || false,
      focused: focused === 'firstName',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      type: 'text',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s]+$/,
      },
      value: formData.lastName,
      error: errors.lastName,
      touched: touched.lastName || false,
      focused: focused === 'lastName',
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      type: 'email',
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
      value: formData.email,
      error: errors.email,
      touched: touched.email || false,
      focused: focused === 'email',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      type: 'phone',
      validation: {
        required: true,
        pattern: /^\+?[\d\s\-\(\)]{10,}$/,
      },
      value: formData.phone,
      error: errors.phone,
      touched: touched.phone || false,
      focused: focused === 'phone',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Create a secure password',
      type: 'password',
      validation: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
          if (!/(?=.*[a-z])/.test(value)) {
            return 'Password must contain at least one lowercase letter';
          }
          if (!/(?=.*[A-Z])/.test(value)) {
            return 'Password must contain at least one uppercase letter';
          }
          if (!/(?=.*\d)/.test(value)) {
            return 'Password must contain at least one number';
          }
          if (!/(?=.*[@$!%*?&])/.test(value)) {
            return 'Password must contain at least one special character';
          }
          return null;
        },
      },
      value: formData.password,
      error: errors.password,
      touched: touched.password || false,
      focused: focused === 'password',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      type: 'password',
      validation: {
        required: true,
        custom: (value: string) => {
          if (value !== formData.password) {
            return 'Passwords do not match';
          }
          return null;
        },
      },
      value: formData.confirmPassword,
      error: errors.confirmPassword,
      touched: touched.confirmPassword || false,
      focused: focused === 'confirmPassword',
    },
    {
      name: 'bio',
      label: 'Bio (Optional)',
      placeholder: 'Tell us about yourself...',
      type: 'textarea',
      validation: {
        maxLength: 500,
      },
      value: formData.bio,
      error: errors.bio,
      touched: touched.bio || false,
      focused: focused === 'bio',
    },
  ];

  // Validation function
  const validateField = useCallback(
    (
      fieldName: string,
      value: string,
      validation: ValidationRule,
    ): string | null => {
      // Required validation
      if (validation.required && !value.trim()) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }

      // Skip other validations if field is empty and not required
      if (!value.trim() && !validation.required) {
        return null;
      }

      // Min length validation
      if (validation.minLength && value.length < validation.minLength) {
        return `Must be at least ${validation.minLength} characters`;
      }

      // Max length validation
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Must be no more than ${validation.maxLength} characters`;
      }

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(value)) {
        if (fieldName === 'email') {
          return 'Please enter a valid email address';
        }
        if (fieldName === 'phone') {
          return 'Please enter a valid phone number';
        }
        if (fieldName === 'firstName' || fieldName === 'lastName') {
          return 'Only letters and spaces are allowed';
        }
        return 'Invalid format';
      }

      // Custom validation
      if (validation.custom) {
        return validation.custom(value);
      }

      return null;
    },
    [formData.password], // Include password in dependencies for confirmPassword validation
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    formFields.forEach(field => {
      const error = validateField(field.name, field.value, field.validation);
      newErrors[field.name] = error;
      if (error) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formFields, validateField]);

  // Real-time validation effect
  useEffect(() => {
    if (validationTrigger > 0) {
      const newErrors: Record<string, string | null> = {};

      formFields.forEach(field => {
        // Only validate touched fields in real-time
        if (field.touched) {
          const error = validateField(
            field.name,
            field.value,
            field.validation,
          );
          newErrors[field.name] = error;
        }
      });

      setErrors(prev => ({ ...prev, ...newErrors }));
    }
  }, [debouncedFormData, validateField, formFields, validationTrigger]);

  // Track changes
  useEffect(() => {
    if (previousFormData) {
      const hasChanged = Object.keys(formData).some(
        key =>
          formData[key as keyof FormData] !==
          previousFormData[key as keyof FormData],
      );
      setHasChanges(hasChanged);
    }
  }, [formData, previousFormData]);

  // Handle input change
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationTrigger(prev => prev + 1);
  }, []);

  // Handle input focus
  const handleInputFocus = useCallback((field: string) => {
    setFocused(field);
  }, []);

  // Handle input blur
  const handleInputBlur = useCallback((field: string) => {
    setFocused(null);
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = formFields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (isValid) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        toggleSubmitSuccess();

        // Reset form after success
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            bio: '',
          });
          setTouched({});
          setErrors({});
          setHasChanges(false);
          toggleSubmitSuccess();
        }, 2000);
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } else {
      Alert.alert(
        'Validation Error',
        'Please fix the errors before submitting.',
      );
    }

    setIsSubmitting(false);
  }, [formFields, validateForm, toggleSubmitSuccess]);

  // Handle form reset
  const handleReset = useCallback(() => {
    Alert.alert('Reset Form', 'Are you sure you want to reset all fields?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            bio: '',
          });
          setTouched({});
          setErrors({});
          setFocused(null);
          setHasChanges(false);
        },
      },
    ]);
  }, []);

  // Get field border color
  const getFieldBorderColor = (field: FormField) => {
    if (field.focused) {
      return '#1976d2';
    }
    if (field.error && field.touched) {
      return '#f44336';
    }
    if (field.value && !field.error) {
      return '#4caf50';
    }
    return isDarkMode ? '#555' : '#ddd';
  };

  // Calculate form completion percentage
  const completionPercentage = Math.round(
    (Object.values(formData).filter(value => value.trim()).length /
      Object.values(formData).length) *
      100,
  );

  // Count valid fields
  const validFields = formFields.filter(
    field =>
      field.value && !validateField(field.name, field.value, field.validation),
  ).length;

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Smart Form Validation
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkDescription]}>
          Real-time validation with user experience optimizations
        </Text>

        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Text
              style={[styles.progressNumber, isDarkMode && styles.darkText]}
            >
              {completionPercentage}%
            </Text>
            <Text
              style={[
                styles.progressLabel,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Completed
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={[styles.progressNumber, { color: '#4caf50' }]}>
              {validFields}
            </Text>
            <Text
              style={[
                styles.progressLabel,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Valid Fields
            </Text>
          </View>
          <View style={styles.progressItem}>
            <Text
              style={[
                styles.progressNumber,
                { color: hasChanges ? '#ff9800' : '#666' },
              ]}
            >
              {hasChanges ? 'Yes' : 'No'}
            </Text>
            <Text
              style={[
                styles.progressLabel,
                isDarkMode && styles.darkDescription,
              ]}
            >
              Changes
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${completionPercentage}%` }]}
          />
        </View>
      </View>

      {/* Form Fields */}
      <View style={[styles.formContainer, isDarkMode && styles.darkCard]}>
        {formFields.map(field => (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, isDarkMode && styles.darkText]}>
              {field.label}
              {field.validation.required && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>

            <View
              style={[
                styles.inputContainer,
                { borderColor: getFieldBorderColor(field) },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  field.type === 'textarea' && styles.textareaInput,
                  isDarkMode && styles.darkInput,
                ]}
                placeholder={field.placeholder}
                placeholderTextColor={isDarkMode ? '#888' : '#666'}
                value={field.value}
                onChangeText={value => handleInputChange(field.name, value)}
                onFocus={() => handleInputFocus(field.name)}
                onBlur={() => handleInputBlur(field.name)}
                secureTextEntry={field.type === 'password'}
                keyboardType={
                  field.type === 'email'
                    ? 'email-address'
                    : field.type === 'phone'
                    ? 'phone-pad'
                    : 'default'
                }
                multiline={field.type === 'textarea'}
                numberOfLines={field.type === 'textarea' ? 4 : 1}
                maxLength={field.validation.maxLength}
                autoCapitalize={
                  field.type === 'email'
                    ? 'none'
                    : field.type === 'password'
                    ? 'none'
                    : 'words'
                }
                autoCorrect={
                  field.type !== 'email' && field.type !== 'password'
                }
              />

              {/* Field status indicator */}
              <View style={styles.statusContainer}>
                {field.focused && <Text style={styles.focusIndicator}></Text>}
                {field.value && !field.error && !field.focused && (
                  <Text style={styles.validIndicator}>✅</Text>
                )}
                {field.error && field.touched && !field.focused && (
                  <Text style={styles.errorIndicator}></Text>
                )}
              </View>
            </View>

            {/* Character count for fields with maxLength */}
            {field.validation.maxLength && field.value && (
              <Text
                style={[
                  styles.charCount,
                  isDarkMode && styles.darkDescription,
                  field.value.length > field.validation.maxLength * 0.9 &&
                    styles.charCountWarning,
                ]}
              >
                {field.value.length}/{field.validation.maxLength}
              </Text>
            )}

            {/* Error message */}
            {field.error && field.touched && (
              <Animated.View style={styles.errorContainer}>
                <Text style={styles.errorText}>{field.error}</Text>
              </Animated.View>
            )}

            {/* Validation hints */}
            {field.focused && field.name === 'password' && (
              <View style={styles.hintsContainer}>
                <Text
                  style={[styles.hintsTitle, isDarkMode && styles.darkText]}
                >
                  Password Requirements:
                </Text>
                <Text
                  style={[
                    styles.hintItem,
                    formData.password.length >= 8 && styles.hintValid,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • At least 8 characters
                </Text>
                <Text
                  style={[
                    styles.hintItem,
                    /(?=.*[a-z])/.test(formData.password) && styles.hintValid,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • One lowercase letter
                </Text>
                <Text
                  style={[
                    styles.hintItem,
                    /(?=.*[A-Z])/.test(formData.password) && styles.hintValid,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • One uppercase letter
                </Text>
                <Text
                  style={[
                    styles.hintItem,
                    /(?=.*\d)/.test(formData.password) && styles.hintValid,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • One number
                </Text>
                <Text
                  style={[
                    styles.hintItem,
                    /(?=.*[@$!%*?&])/.test(formData.password) &&
                      styles.hintValid,
                    isDarkMode && styles.darkDescription,
                  ]}
                >
                  • One special character (@$!%*?&)
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Form Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.resetButton, isDarkMode && styles.darkResetButton]}
          onPress={handleReset}
          disabled={!hasChanges}
        >
          <Text
            style={[
              styles.resetButtonText,
              !hasChanges && styles.disabledButtonText,
              isDarkMode && styles.darkText,
            ]}
          >
            Reset Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submittingButton,
            submitSuccess && styles.successButton,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || submitSuccess}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? 'Submitting...'
              : submitSuccess
              ? 'Success! ✅'
              : 'Submit Form'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Summary */}
      <View style={[styles.summaryContainer, isDarkMode && styles.darkCard]}>
        <Text style={[styles.summaryTitle, isDarkMode && styles.darkText]}>
          Form Summary
        </Text>
        <Text
          style={[styles.summaryText, isDarkMode && styles.darkDescription]}
        >
          • Total fields: {formFields.length}
        </Text>
        <Text
          style={[styles.summaryText, isDarkMode && styles.darkDescription]}
        >
          • Completed: {Object.values(formData).filter(v => v.trim()).length}
        </Text>
        <Text
          style={[styles.summaryText, isDarkMode && styles.darkDescription]}
        >
          • Valid fields: {validFields}
        </Text>
        <Text
          style={[styles.summaryText, isDarkMode && styles.darkDescription]}
        >
          • Has changes: {hasChanges ? 'Yes' : 'No'}
        </Text>
        <Text
          style={[styles.summaryText, isDarkMode && styles.darkDescription]}
        >
          • Form ready:{' '}
          {completionPercentage === 100 &&
          validFields ===
            formFields.filter(f => f.validation.required || f.value).length
            ? 'Yes'
            : 'No'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  darkCard: {
    backgroundColor: '#2a2a2a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textareaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  darkInput: {
    backgroundColor: '#333',
    color: '#fff',
  },
  statusContainer: {
    paddingRight: 12,
  },
  focusIndicator: {
    fontSize: 16,
  },
  validIndicator: {
    fontSize: 16,
  },
  errorIndicator: {
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  charCountWarning: {
    color: '#ff9800',
  },
  errorContainer: {
    marginTop: 4,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  hintsContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  hintsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hintItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  hintValid: {
    color: '#4caf50',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  darkResetButton: {
    backgroundColor: '#444',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  submittingButton: {
    backgroundColor: '#ff9800',
  },
  successButton: {
    backgroundColor: '#4caf50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#888',
  },
});

export default SmartFormValidationScreen;
