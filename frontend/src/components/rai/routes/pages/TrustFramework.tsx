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
import RAIArchitectureDiagram from '../../charts/RAIArchitectureDiagram';
import PageLayout from '../layouts/PageLayout';

const TrustFramework: React.FC = () => {
  return (
    <PageLayout>
      {/* Architecture Diagram */}
      <div className="mb-4">
        <RAIArchitectureDiagram className="w-full" />
      </div>

      {/* Additional Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Benefits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Key Benefits
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">
                <strong>API-Led Integration:</strong> Seamless integration with existing infrastructure
              </span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">
                <strong>End-to-End Observability:</strong> Complete visibility across all AI operations
              </span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">
                <strong>Immediate ROI:</strong> Quick value realization with minimal setup
              </span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">
                <strong>Minimally Invasive:</strong> No disruption to existing systems
              </span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700">
                <strong>No Systems Replacement:</strong> Works with your current technology stack
              </span>
            </li>
          </ul>
        </div>

        {/* Implementation Approach */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Implementation Approach
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">Phase 1: Assessment</h3>
              <p className="text-gray-600 text-sm">
                Evaluate existing infrastructure and identify integration points
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-gray-900">Phase 2: Integration</h3>
              <p className="text-gray-600 text-sm">
                Deploy Trust Layer overlay with minimal system disruption
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900">Phase 3: Optimization</h3>
              <p className="text-gray-600 text-sm">
                Fine-tune governance policies and performance monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Supported Platforms</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Azure AI/ML Services</li>
              <li>• AWS AI/ML Services</li>
              <li>• Google Cloud AI Platform</li>
              <li>• On-premises deployments</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Integration Methods</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• REST API endpoints</li>
              <li>• SDK integrations</li>
              <li>• Webhook notifications</li>
              <li>• Event-driven architecture</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Compliance Standards</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• SOC 2 Type II</li>
              <li>• GDPR compliance</li>
              <li>• HIPAA ready</li>
              <li>• ISO 27001 certified</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TrustFramework;
