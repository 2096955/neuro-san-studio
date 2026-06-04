// Copyright (c) 2024 Windsurf AI
// 
// This file is part of Windsurf project.
// It is subject to the license terms in the LICENSE file found in the top-level
// directory of this distribution and at:
// https://github.com/windsurfai/windsurf/blob/main/LICENSE.txt
//
// No part of Windsurf, including this file, may be copied, modified,
// propagated, or distributed except according to the terms contained in the
// LICENSE file.
// Issued under the Academic Public License.
//
// You can be released from the terms, and requirements of the Academic Public
// License by purchasing a commercial license.
// Purchase of a commercial license is mandatory for any use of the
// nsflow SDK Software in commercial settings.
//
// END COPYRIGHT

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, FileCheck, MessageSquareWarning, Zap, 
  UserCheck, Brain, Eye, AlertTriangle, Search, Plus, Filter,
  Grid3X3, Gavel, Target
} from 'lucide-react';
import PageLayout from '../rai/routes/layouts/PageLayout';
import { Button } from '../ui';
import GuardrailCard from './GuardrailCard';

const GuardrailsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Security' | 'Privacy' | 'Compliance' | 'Moderation' | 'Integrity'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'new'>('all');

  const guardrailCards = [
    {
      id: 1,
      title: "Injection Attack Detection",
      category: "Security" as const,
      status: "active" as const,
      description: "Detects and prevents prompt injection attacks, system prompt leaks, and adversarial input manipulation attempts in real-time.",
      associatedPolicies: ["Injection Attack Prevention Policy", "Security Framework Policy"],
      detectionType: "Real-time Analysis",
      riskLevel: "critical" as const,
      lastTriggered: "2 hours ago",
      triggerCount: 3,
      icon: Zap,
      iconColor: "text-red-600"
    },
    {
      id: 2,
      title: "PII Detector",
      category: "Privacy" as const,
      status: "active" as const,
      description: "Identifies and prevents leakage of personally identifiable information including names, addresses, phone numbers, and social security numbers.",
      associatedPolicies: ["PII Leakage Prevention Policy", "Privacy Protection Policy"],
      detectionType: "Pattern Recognition",
      riskLevel: "high" as const,
      lastTriggered: "15 minutes ago",
      triggerCount: 8,
      icon: Lock,
      iconColor: "text-blue-600"
    },
    {
      id: 3,
      title: "Policy Violation Monitor",
      category: "Compliance" as const,
      status: "new" as const,
      description: "Monitors AI outputs for violations of internal policies and regulatory compliance requirements across multiple jurisdictions.",
      associatedPolicies: ["Content Safety Policy", "Regulatory Compliance Framework"],
      detectionType: "Rule-based Analysis",
      riskLevel: "medium" as const,
      lastTriggered: "1 day ago",
      triggerCount: 2,
      icon: FileCheck,
      iconColor: "text-green-600"
    },
    {
      id: 4,
      title: "Toxicity Detector",
      category: "Moderation" as const,
      status: "active" as const,
      description: "Identifies toxic, harmful, or inappropriate content in AI-generated responses to ensure safe user interactions.",
      associatedPolicies: ["Toxicity Detection Policy", "Content Safety Policy"],
      detectionType: "ML Classification",
      riskLevel: "high" as const,
      lastTriggered: "30 minutes ago",
      triggerCount: 5,
      icon: MessageSquareWarning,
      iconColor: "text-orange-600"
    },
    {
      id: 5,
      title: "NSFW Detector",
      category: "Moderation" as const,
      status: "active" as const,
      description: "Detects and filters not-safe-for-work content including explicit imagery, adult content, and inappropriate material.",
      associatedPolicies: ["Content Safety Policy", "Moderation Guidelines"],
      detectionType: "Image & Text Analysis",
      riskLevel: "medium" as const,
      lastTriggered: "1 hour ago",
      triggerCount: 1,
      icon: Eye,
      iconColor: "text-purple-600"
    },
    {
      id: 6,
      title: "Bias Detection",
      category: "Integrity" as const,
      status: "active" as const,
      description: "Monitors AI outputs for algorithmic bias and unfair treatment across different demographic groups and protected characteristics.",
      associatedPolicies: ["Bias Detection Policy", "Fairness Framework"],
      detectionType: "Statistical Analysis",
      riskLevel: "medium" as const,
      lastTriggered: "3 hours ago",
      triggerCount: 4,
      icon: UserCheck,
      iconColor: "text-green-600"
    },
    {
      id: 7,
      title: "Hallucination Detection",
      category: "Integrity" as const,
      status: "active" as const,
      description: "Identifies AI-generated false information, factual inaccuracies, and hallucinated content to maintain information reliability.",
      associatedPolicies: ["AI Hallucination Policy", "Information Accuracy Standards"],
      detectionType: "Fact Verification",
      riskLevel: "high" as const,
      lastTriggered: "45 minutes ago",
      triggerCount: 6,
      icon: Brain,
      iconColor: "text-indigo-600"
    },
    {
      id: 8,
      title: "Copyright IP Detector",
      category: "Compliance" as const,
      status: "active" as const,
      description: "Detects potential copyright infringement and unauthorized use of intellectual property in AI-generated content.",
      associatedPolicies: ["Copyright Policy", "IP Protection Framework"],
      detectionType: "Content Matching",
      riskLevel: "medium" as const,
      lastTriggered: "2 hours ago",
      triggerCount: 2,
      icon: Shield,
      iconColor: "text-purple-600"
    },
    {
      id: 9,
      title: "System Prompt Leak Prevention",
      category: "Security" as const,
      status: "inactive" as const,
      description: "Prevents exposure of system prompts, internal instructions, and sensitive configuration details through adversarial queries.",
      associatedPolicies: ["Security Framework Policy", "Information Protection Policy"],
      detectionType: "Pattern Analysis",
      riskLevel: "critical" as const,
      lastTriggered: "1 week ago",
      triggerCount: 0,
      icon: AlertTriangle,
      iconColor: "text-red-600"
    }
  ];

  const handleCreateGuardrail = () => {
    navigate('/rai?section=create-guardrail');
  };

  const filteredGuardrails = guardrailCards.filter(guardrail => {
    const matchesCategory = selectedCategory === 'all' || guardrail.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || guardrail.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const categoryButtons = [
    { key: 'all', label: 'All Categories', count: guardrailCards.length, icon: Grid3X3 },
    { key: 'Security', label: 'Security', count: guardrailCards.filter(g => g.category === 'Security').length, icon: Shield },
    { key: 'Privacy', label: 'Privacy', count: guardrailCards.filter(g => g.category === 'Privacy').length, icon: Lock },
    { key: 'Compliance', label: 'Compliance', count: guardrailCards.filter(g => g.category === 'Compliance').length, icon: Gavel },
    { key: 'Moderation', label: 'Moderation', count: guardrailCards.filter(g => g.category === 'Moderation').length, icon: MessageSquareWarning },
    { key: 'Integrity', label: 'Integrity', count: guardrailCards.filter(g => g.category === 'Integrity').length, icon: Target },
  ];

  const statusButtons = [
    { key: 'all', label: 'All Status', count: guardrailCards.length },
    { key: 'active', label: 'Active', count: guardrailCards.filter(g => g.status === 'active').length },
    { key: 'inactive', label: 'Inactive', count: guardrailCards.filter(g => g.status === 'inactive').length },
    { key: 'new', label: 'New', count: guardrailCards.filter(g => g.status === 'new').length },
  ];

  return (
    <PageLayout>
      {/* Header with Filters and Actions */}
      <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Category Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                {categoryButtons.map((button) => (
                  <button
                    key={button.key}
                    onClick={() => setSelectedCategory(button.key as any)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedCategory === button.key
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <button.icon size={12} />
                    {button.label}
                    <span className={`px-1 py-0.5 rounded-full text-xs ${
                      selectedCategory === button.key
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {button.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Status Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex gap-2">
                {statusButtons.map((button) => (
                  <button
                    key={button.key}
                    onClick={() => setSelectedStatus(button.key as any)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedStatus === button.key
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {button.label}
                    <span className={`px-1 py-0.5 rounded-full text-xs ${
                      selectedStatus === button.key
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {button.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateGuardrail}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
            label="Create Guardrail"
            icon={<Plus size={16} />}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guardrailCards.filter(g => g.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active Guardrails</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guardrailCards.filter(g => g.riskLevel === 'critical').length}</p>
              <p className="text-sm text-gray-600">Critical Risk</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{guardrailCards.reduce((sum, g) => sum + g.triggerCount, 0)}</p>
              <p className="text-sm text-gray-600">Total Triggers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredGuardrails.length}</p>
              <p className="text-sm text-gray-600">Filtered Results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guardrail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuardrails.map((guardrail) => (
          <GuardrailCard
            key={guardrail.id}
            {...guardrail}
            onClick={() => {
              // Guardrail configuration / detail view not implemented
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredGuardrails.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No guardrails found</h3>
          <p className="text-gray-600 mb-4">No guardrails match your current filter criteria.</p>
          <Button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            variant="secondary"
            label="Clear Filters"
          />
        </div>
      )}
    </PageLayout>
  );
};

export default GuardrailsDashboard;
