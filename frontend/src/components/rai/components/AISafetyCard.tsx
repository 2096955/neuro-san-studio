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

interface SafetyMetric {
  category: string;
  description: string;
  score: number;
  risk: 'Low' | 'Medium' | 'High';
}

interface AISafetyCardProps {
  overallScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  lastEvaluated?: string;
  metrics?: SafetyMetric[];
  testPrompts?: number;
  complianceRate?: number;
  interventionRate?: number;
  biasImprovement?: number;
  hallucinationRate?: number;
}

const AISafetyCard: React.FC<AISafetyCardProps> = ({
  overallScore = 85,
  riskLevel = 'Low',
  lastEvaluated = 'Oct 2025',
  metrics = [
    {
      category: 'Prompt Robustness',
      description: 'Resistant to injection or override attempts',
      score: 88,
      risk: 'Low'
    },
    {
      category: 'Toxicity & Bias Filtering',
      description: 'Moderation and fairness accuracy',
      score: 82,
      risk: 'Low'
    },
    {
      category: 'Privacy & PII Safeguards',
      description: 'Redaction and data-protection reliability',
      score: 86,
      risk: 'Low'
    },
    {
      category: 'Output Faithfulness',
      description: 'Factual and contextual accuracy',
      score: 80,
      risk: 'Medium'
    },
    {
      category: 'Hallucination Control',
      description: 'Limiting unsupported responses',
      score: 78,
      risk: 'Medium'
    },
    {
      category: 'Incident Handling',
      description: 'Detection and corrective logging',
      score: 90,
      risk: 'Low'
    }
  ]
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🔴';
      default: return '⚪';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">AI Safety Overview</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Score:</span>
            <span className={`font-bold text-lg ${getScoreColor(overallScore)}`}>{overallScore}%</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Risk Level:</span>
            <span className={`font-semibold ${getRiskColor(riskLevel)}`}>{riskLevel}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Last Evaluated:</span>
            <span className="font-medium text-gray-800">{lastEvaluated}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Assessed for ethical alignment, robustness, and risk mitigation across model-driven workflows.
        </p>
      </div>

      {/* Component Metrics */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Component Metrics</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Description</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Score</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Risk</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-800">{metric.category}</td>
                  <td className="py-3 px-2 text-gray-600">{metric.description}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="flex items-center justify-center gap-1">
                      <span>{getRiskIcon(metric.risk)}</span>
                      <span className={`text-xs font-medium ${getRiskColor(metric.risk)}`}>
                        {metric.risk}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source and Status - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-gray-200 pt-4">
        {/* Source */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Source</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <strong className="font-semibold">Evaluated under</strong> Responsible AI Safety Index v2.3
            </div>
            <div className="text-gray-600">
              Data: Microsoft Research 2025 · OpenAI Safety Eval 2025 · Azure RAI Toolkit
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-lg font-semibold text-green-800 mb-2">Status</h4>
          <div className="space-y-2 text-sm">
            <div className="font-semibold text-green-700">
              Low Safety Risk — compliant with internal Responsible AI standards.
            </div>
            <div className="text-gray-700">
              Continued improvement focus: factual accuracy + faithfulness refinement.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISafetyCard;
