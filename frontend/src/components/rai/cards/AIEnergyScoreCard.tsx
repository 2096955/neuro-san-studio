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

interface AIEnergyScoreCardProps {
  modelName?: string;
  scoredDate?: string;
  task?: string;
  hardware?: string;
  inferenceEnergy?: string;
  energyPerQuery?: string;
  energyNote?: string;
  co2Equivalence?: string;
  co2Note?: string;
  energyScore?: number;
  efficiencyTier?: string;
}

const AIEnergyScoreCard: React.FC<AIEnergyScoreCardProps> = ({
  modelName = 'GPT-4o (Azure)',
  scoredDate = 'Oct 2025',
  task = 'Text + Multimodal Inference',
  hardware = 'Azure ND H100 (80 GB) GPU Cluster',
  inferenceEnergy = '300 Wh per 1,000 queries',
  energyPerQuery = '≈ 0.30 Wh / query',
  energyNote = 'Based on Azure H100 utilization benchmarks',
  co2Equivalence = '≈ 0.066 kg CO₂ / 1,000 queries',
  co2Note = 'Using Azure avg carbon intensity 0.22 kg CO₂ / kWh',
  energyScore = 3,
  efficiencyTier = 'Moderate Efficiency Tier'
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
    >
      {/* Card Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Energy Score</h3>
        <p className="text-sm text-gray-600">Model energy efficiency and sustainability metrics</p>
      </div>

      {/* Card Content */}
      <div className="space-y-4">
        {/* Model Section */}
        <div className="pb-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Model
          </h4>
          <div className="text-lg font-bold text-gray-900">
            {modelName}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Scored
            </span>
            <span className="text-sm font-medium text-gray-900">
              {scoredDate}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Task
            </span>
            <span className="text-sm font-medium text-gray-900">
              {task}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Hardware
            </span>
            <span className="text-sm font-medium text-gray-900">
              {hardware}
            </span>
          </div>
        </div>

        {/* Energy Metrics */}
        <div className="pb-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Inference Energy
          </h4>
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {energyPerQuery}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            ({inferenceEnergy})
          </div>
          <div className="text-xs text-gray-500 italic">
            {energyNote}
          </div>
        </div>

        {/* CO2 Equivalence */}
        <div className="pb-3">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            CO₂ Equivalence
          </h4>
          <div className="text-sm font-semibold text-gray-900 mb-2">
            {co2Equivalence}
          </div>
          <div className="text-xs text-gray-500 italic">
            {co2Note}
          </div>
        </div>

        {/* Energy Score */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-800">
              Energy Score
            </span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-yellow-600">{energyScore}</span>
              <span className="text-sm text-gray-500">/5 ⭐</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 text-right">
            {efficiencyTier}
          </div>
        </div>

        {/* Footer with Source */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Source Data: Microsoft Research & peer-reviewed energy benchmarks (2025)
          </p>
          <button 
            className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={() => window.open('https://microsoft.com/en-us/research/publication/energy-use-of-ai-inference-efficiency-pathways-and-test-time-compute', '_blank')}
          >
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIEnergyScoreCard;
