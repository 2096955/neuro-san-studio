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
import { Shield, Settings, AlertTriangle, Activity, Zap } from 'lucide-react';
import PageLayout from '../routes/layouts/PageLayout';

const GuardrailsPage: React.FC = () => {
  return (
    <PageLayout>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Guardrails Dashboard Coming Soon
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive AI safety system for implementing, monitoring, and managing 
            guardrails across all AI operations and model interactions.
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 bg-purple-50 rounded-lg">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Safety Controls</h3>
            <p className="text-sm text-gray-600">
              Implement and configure AI safety guardrails and controls
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Risk Detection</h3>
            <p className="text-sm text-gray-600">
              Real-time detection and prevention of AI safety violations
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <Activity className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Performance Monitoring</h3>
            <p className="text-sm text-gray-600">
              Monitor guardrail effectiveness and system performance
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Custom Rule Configuration</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Automated Response Actions</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Real-time Alerts & Notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">Multi-layer Safety Protocols</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GuardrailsPage;
