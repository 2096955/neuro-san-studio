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

import React from 'react';
import { Shield, Settings, AlertTriangle, FileText, Sliders } from 'lucide-react';
import Form, { type FormSection } from '../ui/Form';

interface GuardrailCreationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const GuardrailCreationForm: React.FC<GuardrailCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const formSections: FormSection[] = [
    {
      id: 'basic-info',
      title: 'Guardrail Information',
      description: 'Define the core details of your AI guardrail',
      icon: Shield,
      fields: [
        {
          id: 'name',
          label: 'Guardrail Name',
          type: 'text',
          placeholder: 'Enter guardrail name',
          required: true,
          validation: (value: string) => {
            if (value && value.length < 3) return 'Name must be at least 3 characters';
            if (value && value.length > 50) return 'Name must be less than 50 characters';
            return null;
          }
        },
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          required: true,
          options: [
            { value: 'Security', label: 'Security' },
            { value: 'Privacy', label: 'Privacy' },
            { value: 'Compliance', label: 'Compliance' },
            { value: 'Moderation', label: 'Moderation' },
            { value: 'Integrity', label: 'Integrity' }
          ]
        },
        {
          id: 'detectionType',
          label: 'Detection Type',
          type: 'select',
          required: true,
          options: [
            { value: 'Injection Attack', label: 'Injection Attack Detection' },
            { value: 'PII Detector', label: 'PII Detection' },
            { value: 'Policy Violation', label: 'Policy Violation Monitor' },
            { value: 'Toxicity Detector', label: 'Toxicity Detection' },
            { value: 'NSFW Detector', label: 'NSFW Content Detection' },
            { value: 'Bias Detection', label: 'Bias Detection' },
            { value: 'Hallucination Detection', label: 'Hallucination Detection' },
            { value: 'Copyright IP', label: 'Copyright IP Detection' },
            { value: 'System Prompt Leak', label: 'System Prompt Leak Prevention' }
          ]
        },
        {
          id: 'riskLevel',
          label: 'Risk Level',
          type: 'select',
          required: true,
          options: [
            { value: 'low', label: 'Low Risk' },
            { value: 'medium', label: 'Medium Risk' },
            { value: 'high', label: 'High Risk' },
            { value: 'critical', label: 'Critical Risk' }
          ]
        },
        {
          id: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Describe what this guardrail protects against...',
          required: true,
          rows: 4,
          validation: (value: string) => {
            if (value && value.length < 20) return 'Description must be at least 20 characters';
            return null;
          }
        }
      ]
    },
    {
      id: 'policy-attachment',
      title: 'Policy Configuration',
      description: 'Attach policies and configure enforcement rules',
      icon: FileText,
      fields: [
        {
          id: 'associatedPolicies',
          label: 'Associated Policies',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'bias-detection-policy', label: 'Bias Detection and Fairness Policy' },
            { value: 'pii-leakage-policy', label: 'PII Leakage Prevention Policy' },
            { value: 'hallucination-policy', label: 'AI Hallucination Mitigation Policy' },
            { value: 'content-safety-policy', label: 'Content Safety and Moderation Policy' },
            { value: 'toxicity-policy', label: 'Toxicity Detection and Prevention Policy' },
            { value: 'copyright-policy', label: 'Copyright and Intellectual Property Policy' },
            { value: 'injection-policy', label: 'Injection Attack Prevention Policy' },
            { value: 'privacy-policy', label: 'Privacy Protection and Data Governance Policy' }
          ],
          description: 'Select one or more policies that this guardrail will enforce'
        },
        {
          id: 'enforcementMode',
          label: 'Enforcement Mode',
          type: 'select',
          required: true,
          options: [
            { value: 'strict', label: 'Strict - Block all violations' },
            { value: 'permissive', label: 'Permissive - Warn on violations' },
            { value: 'audit', label: 'Audit - Log violations only' },
            { value: 'learning', label: 'Learning - Collect data for training' }
          ]
        },
        {
          id: 'policyOverrides',
          label: 'Policy Override Rules',
          type: 'textarea',
          placeholder: 'Define any specific overrides or exceptions to the attached policies...',
          rows: 3,
          description: 'Optional: Specify any custom rules that override default policy behavior'
        }
      ]
    },
    {
      id: 'detection',
      title: 'Detection Configuration',
      description: 'Configure how this guardrail detects violations',
      icon: AlertTriangle,
      fields: [
        {
          id: 'detectionMethod',
          label: 'Detection Method',
          type: 'select',
          required: true,
          options: [
            { value: 'rule-based', label: 'Rule-based Detection' },
            { value: 'ml-model', label: 'Machine Learning Model' },
            { value: 'statistical', label: 'Statistical Analysis' },
            { value: 'hybrid', label: 'Hybrid Approach' }
          ]
        },
        {
          id: 'threshold',
          label: 'Detection Threshold',
          type: 'number',
          placeholder: '0.8',
          min: 0,
          max: 1,
          description: 'Confidence threshold for triggering this guardrail (0.0 - 1.0)'
        },
        {
          id: 'monitoringFrequency',
          label: 'Monitoring Frequency',
          type: 'select',
          required: true,
          options: [
            { value: 'real-time', label: 'Real-time' },
            { value: 'batch-hourly', label: 'Hourly Batch' },
            { value: 'batch-daily', label: 'Daily Batch' },
            { value: 'on-demand', label: 'On-demand' }
          ]
        },
        {
          id: 'inputValidation',
          label: 'Input Validation Rules',
          type: 'textarea',
          placeholder: 'Define input validation criteria...',
          rows: 3,
          description: 'Specify what inputs should be validated by this guardrail'
        }
      ]
    },
    {
      id: 'advanced-config',
      title: 'Advanced Configuration',
      description: 'Fine-tune detection parameters and thresholds',
      icon: Sliders,
      fields: [
        {
          id: 'confidenceThreshold',
          label: 'Confidence Threshold',
          type: 'number',
          placeholder: '0.8',
          min: 0,
          max: 1,
          defaultValue: 0.8,
          description: 'Minimum confidence score to trigger this guardrail (0.0 - 1.0)',
          required: true
        },
        {
          id: 'sensitivityLevel',
          label: 'Sensitivity Level',
          type: 'select',
          required: true,
          options: [
            { value: 'low', label: 'Low - Less sensitive, fewer false positives' },
            { value: 'medium', label: 'Medium - Balanced sensitivity' },
            { value: 'high', label: 'High - More sensitive, catches more violations' },
            { value: 'maximum', label: 'Maximum - Highest sensitivity' }
          ],
          defaultValue: 'medium'
        },
        {
          id: 'samplingRate',
          label: 'Sampling Rate (%)',
          type: 'number',
          placeholder: '100',
          min: 1,
          max: 100,
          defaultValue: 100,
          description: 'Percentage of requests to analyze (1-100%)',
          required: true
        },
        {
          id: 'batchSize',
          label: 'Batch Processing Size',
          type: 'number',
          placeholder: '1000',
          min: 1,
          max: 10000,
          defaultValue: 1000,
          description: 'Number of requests to process in each batch'
        },
        {
          id: 'customParameters',
          label: 'Custom Parameters',
          type: 'textarea',
          placeholder: 'Enter JSON configuration for custom parameters...\n{\n  "maxTokens": 1000,\n  "temperature": 0.1\n}',
          rows: 4,
          description: 'JSON configuration for guardrail-specific parameters'
        }
      ]
    },
    {
      id: 'response',
      title: 'Response Configuration',
      description: 'Define how the system responds when violations are detected',
      icon: Settings,
      fields: [
        {
          id: 'responseAction',
          label: 'Response Action',
          type: 'select',
          required: true,
          options: [
            { value: 'block', label: 'Block Request' },
            { value: 'warn', label: 'Issue Warning' },
            { value: 'log', label: 'Log Only' },
            { value: 'redirect', label: 'Redirect to Safe Response' },
            { value: 'escalate', label: 'Escalate to Human Review' }
          ]
        },
        {
          id: 'alerting',
          label: 'Alert Notifications',
          type: 'checkbox',
          defaultValue: true,
          description: 'Send notifications when this guardrail is triggered'
        },
        {
          id: 'alertRecipients',
          label: 'Alert Recipients',
          type: 'text',
          placeholder: 'Enter email addresses separated by commas',
          description: 'Who should be notified when violations occur?'
        },
        {
          id: 'customMessage',
          label: 'Custom Response Message',
          type: 'textarea',
          placeholder: 'Enter custom message to display when guardrail is triggered...',
          rows: 3,
          description: 'Optional custom message shown to users when this guardrail activates'
        },
        {
          id: 'enabled',
          label: 'Enable this guardrail',
          type: 'checkbox',
          defaultValue: true,
          description: 'Uncheck to disable this guardrail temporarily'
        }
      ]
    }
  ];

  return (
    <Form
      title="Create New Guardrail"
      description="Define a new AI safety guardrail to protect against specific risks"
      sections={formSections}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Create Guardrail"
      cancelLabel="Cancel"
      isLoading={isLoading}
      icon={<Shield className="w-6 h-6" />}
    />
  );
};

export default GuardrailCreationForm;
