// BEGIN COPYRIGHT
//
// Copyright (C) 2024 Nuanced Systems, Inc.
// All rights reserved.
//
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { useState } from 'react';
import { Shield, FileText, Settings, Sliders, AlertTriangle, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { Button } from '../ui';

interface ModernGuardrailCreationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormData {
  // Basic Info
  name: string;
  category: string;
  detectionType: string;
  riskLevel: string;
  description: string;
  
  // Policy Configuration
  associatedPolicies: string[];
  enforcementMode: string;
  policyOverrides: string;
  
  // Detection Configuration
  detectionMethod: string;
  threshold: number;
  monitoringFrequency: string;
  inputValidation: string;
  
  // Advanced Configuration
  confidenceThreshold: number;
  sensitivityLevel: string;
  samplingRate: number;
  batchSize: number;
  customParameters: string;
  
  // Response Configuration
  responseAction: string;
  alerting: boolean;
  alertRecipients: string;
  customMessage: string;
  enabled: boolean;
}

const steps = [
  {
    id: 'basic',
    title: 'Basic Info',
    icon: Shield,
    description: 'Core guardrail details'
  },
  {
    id: 'policies',
    title: 'Policies',
    icon: FileText,
    description: 'Policy attachments'
  },
  {
    id: 'detection',
    title: 'Detection',
    icon: AlertTriangle,
    description: 'Detection settings'
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: Sliders,
    description: 'Fine-tuning'
  },
  {
    id: 'response',
    title: 'Response',
    icon: Settings,
    description: 'Response actions'
  }
];

const ModernGuardrailCreationForm: React.FC<ModernGuardrailCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    detectionType: '',
    riskLevel: '',
    description: '',
    associatedPolicies: [],
    enforcementMode: '',
    policyOverrides: '',
    detectionMethod: '',
    threshold: 0.8,
    monitoringFrequency: '',
    inputValidation: '',
    confidenceThreshold: 0.8,
    sensitivityLevel: 'medium',
    samplingRate: 100,
    batchSize: 1000,
    customParameters: '',
    responseAction: '',
    alerting: true,
    alertRecipients: '',
    customMessage: '',
    enabled: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // Basic Info
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.detectionType) newErrors.detectionType = 'Detection type is required';
        if (!formData.riskLevel) newErrors.riskLevel = 'Risk level is required';
        if (!formData.description) newErrors.description = 'Description is required';
        break;
      case 1: // Policies
        if (formData.associatedPolicies.length === 0) newErrors.associatedPolicies = 'At least one policy must be selected';
        if (!formData.enforcementMode) newErrors.enforcementMode = 'Enforcement mode is required';
        break;
      case 2: // Detection
        if (!formData.detectionMethod) newErrors.detectionMethod = 'Detection method is required';
        if (!formData.monitoringFrequency) newErrors.monitoringFrequency = 'Monitoring frequency is required';
        break;
      case 3: // Advanced
        if (formData.confidenceThreshold < 0 || formData.confidenceThreshold > 1) {
          newErrors.confidenceThreshold = 'Confidence threshold must be between 0 and 1';
        }
        if (formData.samplingRate < 1 || formData.samplingRate > 100) {
          newErrors.samplingRate = 'Sampling rate must be between 1 and 100';
        }
        break;
      case 4: // Response
        if (!formData.responseAction) newErrors.responseAction = 'Response action is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const isStepCompleted = (stepIndex: number): boolean => {
    if (stepIndex > currentStep) return false;
    if (stepIndex < currentStep) return true;
    return false;
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = isStepCompleted(index);
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${isActive ? 'border-purple-500 bg-purple-50 text-purple-600' : 
                  isCompleted ? 'border-green-500 bg-green-50 text-green-600' : 
                  'border-gray-300 bg-white text-gray-400'}
              `}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-4 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guardrail Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a descriptive name for your guardrail"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateFormData('category', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select category</option>
            <option value="Security">Security</option>
            <option value="Privacy">Privacy</option>
            <option value="Compliance">Compliance</option>
            <option value="Moderation">Moderation</option>
            <option value="Integrity">Integrity</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Level *
          </label>
          <select
            value={formData.riskLevel}
            onChange={(e) => updateFormData('riskLevel', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.riskLevel ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select risk level</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
          {errors.riskLevel && <p className="text-red-500 text-sm mt-1">{errors.riskLevel}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detection Type *
        </label>
        <select
          value={formData.detectionType}
          onChange={(e) => updateFormData('detectionType', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
            errors.detectionType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select detection type</option>
          <option value="Injection Attack">Injection Attack Detection</option>
          <option value="PII Detector">PII Detection</option>
          <option value="Policy Violation">Policy Violation Monitor</option>
          <option value="Toxicity Detector">Toxicity Detection</option>
          <option value="NSFW Detector">NSFW Content Detection</option>
          <option value="Bias Detection">Bias Detection</option>
          <option value="Hallucination Detection">Hallucination Detection</option>
          <option value="Copyright IP">Copyright IP Detection</option>
          <option value="System Prompt Leak">System Prompt Leak Prevention</option>
        </select>
        {errors.detectionType && <p className="text-red-500 text-sm mt-1">{errors.detectionType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe what this guardrail protects against and how it works..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
    </div>
  );

  const renderPolicyConfiguration = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Associated Policies *
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-4">
          {[
            { value: 'bias-detection-policy', label: 'Bias Detection and Fairness Policy' },
            { value: 'pii-leakage-policy', label: 'PII Leakage Prevention Policy' },
            { value: 'hallucination-policy', label: 'AI Hallucination Mitigation Policy' },
            { value: 'content-safety-policy', label: 'Content Safety and Moderation Policy' },
            { value: 'toxicity-policy', label: 'Toxicity Detection and Prevention Policy' },
            { value: 'copyright-policy', label: 'Copyright and Intellectual Property Policy' },
            { value: 'injection-policy', label: 'Injection Attack Prevention Policy' },
            { value: 'privacy-policy', label: 'Privacy Protection and Data Governance Policy' }
          ].map((policy) => (
            <label key={policy.value} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={formData.associatedPolicies.includes(policy.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateFormData('associatedPolicies', [...formData.associatedPolicies, policy.value]);
                  } else {
                    updateFormData('associatedPolicies', formData.associatedPolicies.filter(p => p !== policy.value));
                  }
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{policy.label}</span>
            </label>
          ))}
        </div>
        {errors.associatedPolicies && <p className="text-red-500 text-sm mt-1">{errors.associatedPolicies}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enforcement Mode *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: 'strict', label: 'Strict', desc: 'Block all violations' },
            { value: 'permissive', label: 'Permissive', desc: 'Warn on violations' },
            { value: 'audit', label: 'Audit', desc: 'Log violations only' },
            { value: 'learning', label: 'Learning', desc: 'Collect data for training' }
          ].map((mode) => (
            <label key={mode.value} className={`
              flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.enforcementMode === mode.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}
            `}>
              <input
                type="radio"
                name="enforcementMode"
                value={mode.value}
                checked={formData.enforcementMode === mode.value}
                onChange={(e) => updateFormData('enforcementMode', e.target.value)}
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-1"
              />
              <div>
                <p className="font-medium text-gray-900">{mode.label}</p>
                <p className="text-sm text-gray-500">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.enforcementMode && <p className="text-red-500 text-sm mt-1">{errors.enforcementMode}</p>}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderPolicyConfiguration();
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Detection Configuration</h3>
              <p className="text-gray-500">Configure how this guardrail detects violations</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Sliders className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Configuration</h3>
              <p className="text-gray-500">Fine-tune detection parameters and thresholds</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Response Configuration</h3>
              <p className="text-gray-500">Define how the system responds when violations are detected</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Guardrail</h1>
          <p className="text-gray-600">Define a new AI safety guardrail to protect against specific risks</p>
        </div>

        {renderProgressBar()}

        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <Button
                label="Previous"
                variant="outline"
                onClick={prevStep}
                icon={<ChevronLeft className="w-4 h-4" />}
                iconPosition="left"
                className=""
              />
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              label="Cancel"
              variant="outline"
              onClick={onCancel}
              icon={<X className="w-4 h-4" />}
              iconPosition="left"
            />
            
            {currentStep < steps.length - 1 ? (
              <Button
                label="Next"
                onClick={nextStep}
                variant="primary"
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
                className="bg-purple-600 hover:bg-purple-700"
              />
            ) : (
              <Button
                label={isLoading ? 'Creating...' : 'Create Guardrail'}
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                variant="success"
                icon={<Check className="w-4 h-4" />}
                iconPosition="left"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernGuardrailCreationForm;
