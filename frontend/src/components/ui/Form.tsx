// Copyright (C) 2023-2025 Cognizant Digital Business, Evolutionary AI.
// All Rights Reserved.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import Button from './Button';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number; // for textarea
  min?: number; // for number inputs
  max?: number; // for number inputs
  validation?: (value: any) => string | null; // returns error message or null
  description?: string;
  defaultValue?: any;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  icon?: LucideIcon;
}

export interface FormProps {
  title: string;
  description?: string;
  sections: FormSection[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
  icon?: ReactNode;
}

interface FormState {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

const Form: React.FC<FormProps> = ({
  title,
  description,
  sections,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
  className = '',
  icon
}) => {
  const [formData, setFormData] = React.useState<FormState>(() => {
    const initialData: FormState = {};
    sections.forEach(section => {
      section.fields.forEach(field => {
        initialData[field.id] = field.defaultValue || (field.type === 'checkbox' ? false : '');
      });
    });
    return initialData;
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }
    
    if (field.validation) {
      return field.validation(value);
    }
    
    return null;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleFieldBlur = (field: FormField) => {
    setTouched(prev => ({ ...prev, [field.id]: true }));
    
    const error = validateField(field, formData[field.id]);
    if (error) {
      setErrors(prev => ({ ...prev, [field.id]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: FormErrors = {};
    let hasErrors = false;
    
    sections.forEach(section => {
      section.fields.forEach(field => {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          hasErrors = true;
        }
      });
    });
    
    setErrors(newErrors);
    setTouched(
      sections.reduce((acc, section) => {
        section.fields.forEach(field => {
          acc[field.id] = true;
        });
        return acc;
      }, {} as Record<string, boolean>)
    );
    
    if (!hasErrors) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.id] && errors[field.id];
    const baseInputClasses = `w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
      hasError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
    } focus:outline-none focus:ring-2`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={baseInputClasses}
            disabled={isLoading}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={baseInputClasses}
            disabled={isLoading}
          >
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              checked={formData[field.id] || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              onBlur={() => handleFieldBlur(field)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
            disabled={isLoading}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={baseInputClasses}
            disabled={isLoading}
          />
        );
      
      default:
        return (
          <input
            type="text"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            disabled={isLoading}
          />
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-600">{icon}</div>}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                {section.icon && <section.icon className="w-5 h-5 text-gray-600" />}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
              </div>

              {/* Section Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    {field.type !== 'checkbox' && (
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    
                    {renderField(field)}
                    
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                    )}
                    
                    {touched[field.id] && errors[field.id] && (
                      <p className="text-xs text-red-600 mt-1">{errors[field.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              label={cancelLabel}
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            />
          )}
          <Button
            label={submitLabel}
            variant="primary"
            type="submit"
            loading={isLoading}
          />
        </div>
      </form>
    </div>
  );
};

export default Form;
