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
import { FileText, Info, Settings } from 'lucide-react';
import Form, { type FormSection } from '../ui/Form';

interface PolicyCreationFormProps {
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const PolicyCreationForm: React.FC<PolicyCreationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const formSections: FormSection[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Define the core details of your policy',
      icon: Info,
      fields: [
        {
          id: 'title',
          label: 'Policy Title',
          type: 'text',
          placeholder: 'Enter policy title',
          required: true,
          validation: (value: string) => {
            if (value && value.length < 3) return 'Title must be at least 3 characters';
            if (value && value.length > 100) return 'Title must be less than 100 characters';
            return null;
          }
        },
        {
          id: 'organization',
          label: 'Organization',
          type: 'text',
          placeholder: 'Enter organization name',
          required: true
        },
        {
          id: 'policyType',
          label: 'Policy Type',
          type: 'select',
          required: true,
          options: [
            { value: 'internal', label: 'Internal Policy' },
            { value: 'regulatory', label: 'Regulatory Policy' },
            { value: 'external', label: 'External Guidance' },
            { value: 'standard', label: 'Industry Standard' }
          ]
        },
        {
          id: 'region',
          label: 'Region',
          type: 'select',
          options: [
            { value: '', label: 'Global/Not Applicable' },
            { value: 'USA', label: 'United States' },
            { value: 'Europe', label: 'European Union' },
            { value: 'Asia', label: 'Asia Pacific' }
          ]
        },
        {
          id: 'requirements',
          label: 'Number of Requirements',
          type: 'text',
          placeholder: 'e.g., 12 Requirements or +27',
          description: 'Enter the number of requirements or compliance items'
        },
        {
          id: 'updated',
          label: 'Last Updated',
          type: 'date',
          required: true,
          defaultValue: new Date().toISOString().split('T')[0]
        }
      ]
    },
    {
      id: 'content',
      title: 'Policy Content',
      description: 'Provide detailed information about the policy',
      icon: FileText,
      fields: [
        {
          id: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Enter a detailed description of the policy...',
          required: true,
          rows: 6,
          validation: (value: string) => {
            if (value && value.length < 50) return 'Description must be at least 50 characters';
            if (value && value.length > 1000) return 'Description must be less than 1000 characters';
            return null;
          }
        },
        {
          id: 'scope',
          label: 'Scope',
          type: 'textarea',
          placeholder: 'Define the scope and applicability of this policy...',
          rows: 3,
          description: 'What areas, systems, or processes does this policy cover?'
        },
        {
          id: 'objectives',
          label: 'Objectives',
          type: 'textarea',
          placeholder: 'List the main objectives of this policy...',
          rows: 3,
          description: 'What are the key goals this policy aims to achieve?'
        }
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      description: 'Set up policy parameters and visibility',
      icon: Settings,
      fields: [
        {
          id: 'priority',
          label: 'Priority Level',
          type: 'select',
          required: true,
          defaultValue: 'medium',
          options: [
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'high', label: 'High Priority' },
            { value: 'critical', label: 'Critical Priority' }
          ]
        },
        {
          id: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'Under Review' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' }
          ]
        },
        {
          id: 'tags',
          label: 'Tags',
          type: 'text',
          placeholder: 'Enter tags separated by commas',
          description: 'Add relevant tags for categorization and search'
        },
        {
          id: 'isPublic',
          label: 'Make this policy publicly visible',
          type: 'checkbox',
          defaultValue: false,
          description: 'Check this box to make the policy visible to all users'
        }
      ]
    }
  ];

  return (
    <Form
      title="Create New Policy"
      description="Define a new AI governance policy, regulation, or compliance framework"
      sections={formSections}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Create Policy"
      cancelLabel="Cancel"
      isLoading={isLoading}
      icon={<FileText className="w-6 h-6" />}
    />
  );
};

export default PolicyCreationForm;
