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
import { FileCheck, Clock, Scale, Shield } from 'lucide-react';

const GovernancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Main Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-lg">
            <FileCheck className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Governance & Compliance
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-8">
          Regulatory compliance and governance policies management
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg mb-8">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Coming Soon</span>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            What to Expect
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Regulatory Compliance</h3>
                <p className="text-gray-600 text-sm">Monitor and ensure compliance with industry regulations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Policy Management</h3>
                <p className="text-gray-600 text-sm">Create and manage governance policies and procedures</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Audit Trails</h3>
                <p className="text-gray-600 text-sm">Comprehensive audit logging and compliance reporting</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Risk Assessment</h3>
                <p className="text-gray-600 text-sm">Automated risk assessment and compliance monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm">
          This feature is currently under development and will be available in an upcoming release.
        </p>
      </div>
    </div>
  );
};

export default GovernancePage;
