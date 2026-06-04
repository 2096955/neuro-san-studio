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
import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';

interface SplitGuardrailCreationFormProps {
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
  
  // Configuration toggles
  securityGuardrails: {
    injectionAttack: boolean;
    systemPromptLeak: boolean;
  };
  privacyGuardrails: {
    piiDetector: boolean;
    copyrightIP: boolean;
  };
  complianceGuardrails: {
    policyViolation: boolean;
  };
  moderationGuardrails: {
    toxicityDetector: boolean;
    nsfwDetector: boolean;
    topicDetector: boolean;
    keywordDetector: boolean;
  };
  integrityGuardrails: {
    biasDetection: boolean;
    hallucinationDetection: boolean;
  };
}

const SplitGuardrailCreationForm: React.FC<SplitGuardrailCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    // Basic Info
    name: '',
    category: '',
    detectionType: '',
    riskLevel: '',
    description: '',
    
    // Policy Configuration
    associatedPolicies: [],
    enforcementMode: '',
    policyOverrides: '',
    
    // Detection Configuration
    detectionMethod: '',
    threshold: 0.8,
    monitoringFrequency: '',
    inputValidation: '',
    
    // Advanced Configuration
    confidenceThreshold: 0.8,
    sensitivityLevel: 'medium',
    samplingRate: 100,
    batchSize: 1000,
    customParameters: '',
    
    // Response Configuration
    responseAction: '',
    alerting: true,
    alertRecipients: '',
    customMessage: '',
    enabled: true,
    
    // Configuration toggles
    securityGuardrails: {
      injectionAttack: false,
      systemPromptLeak: false,
    },
    privacyGuardrails: {
      piiDetector: false,
      copyrightIP: false,
    },
    complianceGuardrails: {
      policyViolation: false,
    },
    moderationGuardrails: {
      toxicityDetector: false,
      nsfwDetector: false,
      topicDetector: false,
      keywordDetector: false,
    },
    integrityGuardrails: {
      biasDetection: false,
      hallucinationDetection: false,
    },
  });


  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.detectionType) newErrors.detectionType = 'Detection type is required';
    if (!formData.riskLevel) newErrors.riskLevel = 'Risk level is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.associatedPolicies.length === 0) newErrors.associatedPolicies = 'At least one policy must be selected';
    if (!formData.enforcementMode) newErrors.enforcementMode = 'Enforcement mode is required';
    if (!formData.detectionMethod) newErrors.detectionMethod = 'Detection method is required';
    if (!formData.monitoringFrequency) newErrors.monitoringFrequency = 'Monitoring frequency is required';
    if (!formData.responseAction) newErrors.responseAction = 'Response action is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Guardrails</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Guardrail</h1>
              <p className="text-sm text-gray-600">Define a new AI safety guardrail to protect against specific risks</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              label="Cancel"
              variant="outline"
              onClick={onCancel}
            />
            <Button
              label={isLoading ? 'Creating...' : 'Create Guardrail'}
              onClick={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Form */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="max-w-none">
            <div className="space-y-3">
              {/* Basic Details Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-base font-medium text-gray-900 mb-3">Basic Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardrail Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter a descriptive name for your guardrail"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                      {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Level *
                      </label>
                      <select
                        value={formData.riskLevel}
                        onChange={(e) => updateFormData('riskLevel', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.riskLevel ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select risk level</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                        <option value="critical">Critical Risk</option>
                      </select>
                      {errors.riskLevel && <p className="text-red-500 text-xs mt-1">{errors.riskLevel}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detection Type *
                      </label>
                      <select
                        value={formData.detectionType}
                        onChange={(e) => updateFormData('detectionType', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
                      {errors.detectionType && <p className="text-red-500 text-xs mt-1">{errors.detectionType}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      rows={2}
                      className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe what this guardrail protects against and how it works..."
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>
              
              {/* Policy Configuration Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-base font-medium text-gray-900 mb-3">Policy Configuration</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Associated Policies *
                    </label>
                    <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
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
                        <label key={policy.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
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
                            className="w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-xs text-gray-700">{policy.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.associatedPolicies && <p className="text-red-500 text-xs mt-1">{errors.associatedPolicies}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enforcement Mode *
                      </label>
                      <select
                        value={formData.enforcementMode}
                        onChange={(e) => updateFormData('enforcementMode', e.target.value)}
                        className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.enforcementMode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select enforcement mode</option>
                        <option value="strict">Strict - Block all violations</option>
                        <option value="permissive">Permissive - Warn on violations</option>
                        <option value="audit">Audit - Log violations only</option>
                        <option value="learning">Learning - Collect data for training</option>
                      </select>
                      {errors.enforcementMode && <p className="text-red-500 text-xs mt-1">{errors.enforcementMode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detection Method *
                      </label>
                      <select
                        value={formData.detectionMethod}
                        onChange={(e) => updateFormData('detectionMethod', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.detectionMethod ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select detection method</option>
                        <option value="rule-based">Rule-based Detection</option>
                        <option value="ml-model">Machine Learning Model</option>
                        <option value="statistical">Statistical Analysis</option>
                        <option value="hybrid">Hybrid Approach</option>
                      </select>
                      {errors.detectionMethod && <p className="text-red-500 text-sm mt-1">{errors.detectionMethod}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Policy Override Rules
                    </label>
                    <textarea
                      value={formData.policyOverrides}
                      onChange={(e) => updateFormData('policyOverrides', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Define any specific overrides or exceptions to the attached policies..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Advanced Configuration Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Configuration</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Threshold *
                    </label>
                    <input
                      type="number"
                      value={formData.confidenceThreshold}
                      onChange={(e) => updateFormData('confidenceThreshold', parseFloat(e.target.value))}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="0.8"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum confidence score to trigger (0.0 - 1.0)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sensitivity Level *
                    </label>
                    <select
                      value={formData.sensitivityLevel}
                      onChange={(e) => updateFormData('sensitivityLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="low">Low - Less sensitive, fewer false positives</option>
                      <option value="medium">Medium - Balanced sensitivity</option>
                      <option value="high">High - More sensitive, catches more violations</option>
                      <option value="maximum">Maximum - Highest sensitivity</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sampling Rate (%) *
                    </label>
                    <input
                      type="number"
                      value={formData.samplingRate}
                      onChange={(e) => updateFormData('samplingRate', parseInt(e.target.value))}
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Percentage of requests to analyze</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monitoring Frequency *
                    </label>
                    <select
                      value={formData.monitoringFrequency}
                      onChange={(e) => updateFormData('monitoringFrequency', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.monitoringFrequency ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select frequency</option>
                      <option value="real-time">Real-time</option>
                      <option value="batch-hourly">Hourly Batch</option>
                      <option value="batch-daily">Daily Batch</option>
                      <option value="on-demand">On-demand</option>
                    </select>
                    {errors.monitoringFrequency && <p className="text-red-500 text-sm mt-1">{errors.monitoringFrequency}</p>}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Parameters
                  </label>
                  <textarea
                    value={formData.customParameters}
                    onChange={(e) => updateFormData('customParameters', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder={`Enter JSON configuration for custom parameters...\n{\n  "maxTokens": 1000,\n  "temperature": 0.1\n}`}
                  />
                </div>
              </div>
              
              {/* Response Configuration Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Response Configuration</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Action *
                      </label>
                      <select
                        value={formData.responseAction}
                        onChange={(e) => updateFormData('responseAction', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          errors.responseAction ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select response action</option>
                        <option value="block">Block Request</option>
                        <option value="warn">Issue Warning</option>
                        <option value="log">Log Only</option>
                        <option value="redirect">Redirect to Safe Response</option>
                        <option value="escalate">Escalate to Human Review</option>
                      </select>
                      {errors.responseAction && <p className="text-red-500 text-sm mt-1">{errors.responseAction}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alert Recipients
                      </label>
                      <input
                        type="text"
                        value={formData.alertRecipients}
                        onChange={(e) => updateFormData('alertRecipients', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Enter email addresses separated by commas"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Response Message
                    </label>
                    <textarea
                      value={formData.customMessage}
                      onChange={(e) => updateFormData('customMessage', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter custom message to display when guardrail is triggered..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.alerting}
                        onChange={(e) => updateFormData('alerting', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Enable alert notifications</span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => updateFormData('enabled', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Enable this guardrail</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Configuration Preview */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto flex-shrink-0">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-medium text-gray-900">Configuration Preview</h2>
            </div>
            <p className="text-sm text-gray-600">
              Preview your guardrail configuration and deployment settings
            </p>
          </div>

          <div className="space-y-4">
            {/* Basic Info Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div><span className="font-medium">Name:</span> {formData.name || 'Not set'}</div>
                <div><span className="font-medium">Category:</span> {formData.category || 'Not set'}</div>
                <div><span className="font-medium">Risk Level:</span> {formData.riskLevel || 'Not set'}</div>
                <div><span className="font-medium">Detection Type:</span> {formData.detectionType || 'Not set'}</div>
              </div>
            </div>

            {/* Policy Configuration Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Policy Configuration</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div><span className="font-medium">Policies:</span> {formData.associatedPolicies.length} selected</div>
                <div><span className="font-medium">Enforcement:</span> {formData.enforcementMode || 'Not set'}</div>
                <div><span className="font-medium">Detection:</span> {formData.detectionMethod || 'Not set'}</div>
              </div>
            </div>

            {/* Advanced Settings Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Advanced Settings</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div><span className="font-medium">Confidence:</span> {formData.confidenceThreshold}</div>
                <div><span className="font-medium">Sensitivity:</span> {formData.sensitivityLevel}</div>
                <div><span className="font-medium">Sampling:</span> {formData.samplingRate}%</div>
                <div><span className="font-medium">Frequency:</span> {formData.monitoringFrequency || 'Not set'}</div>
              </div>
            </div>

            {/* Response Configuration Preview */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Response Configuration</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div><span className="font-medium">Action:</span> {formData.responseAction || 'Not set'}</div>
                <div><span className="font-medium">Alerts:</span> {formData.alerting ? 'Enabled' : 'Disabled'}</div>
                <div><span className="font-medium">Status:</span> {formData.enabled ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>

            {/* Deployment Status */}
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <h3 className="text-sm font-medium text-purple-900 mb-2">Deployment Status</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.name && formData.category && formData.detectionType && formData.riskLevel && formData.description ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600">Basic Information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.associatedPolicies.length > 0 && formData.enforcementMode && formData.detectionMethod ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600">Policy Configuration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.monitoringFrequency ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600">Advanced Settings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${formData.responseAction ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-xs text-gray-600">Response Configuration</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Reset form to defaults
                  setFormData(prev => ({
                    ...prev,
                    confidenceThreshold: 0.8,
                    sensitivityLevel: 'medium',
                    samplingRate: 100,
                    alerting: true,
                    enabled: true
                  }));
                }}
                className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => {
                  // Apply recommended settings based on risk level
                  const isHighRisk = formData.riskLevel === 'high' || formData.riskLevel === 'critical';
                  setFormData(prev => ({
                    ...prev,
                    confidenceThreshold: isHighRisk ? 0.7 : 0.8,
                    sensitivityLevel: isHighRisk ? 'high' : 'medium',
                    samplingRate: isHighRisk ? 100 : 80,
                    enforcementMode: isHighRisk ? 'strict' : 'permissive'
                  }));
                }}
                className="w-full px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                Apply Recommended Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitGuardrailCreationForm;
