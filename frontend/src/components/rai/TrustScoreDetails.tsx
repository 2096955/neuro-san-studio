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
import TrustScore from './TrustScore';


interface TrustScoreDetailsProps {
  agentName?: string;
  trustScore?: number;
}

const TrustScoreDetails: React.FC<TrustScoreDetailsProps> = ({
  agentName = 'announcer',
  trustScore = 87
}) => {
  // Calculate risk-related metrics based on trust score

  return (
    <div className="w-full space-y-6">
      {/* Risk Score Gauge at the top */}
  
      
      {/* Pass the agentName and trustScore to the TrustScore component */}
      <TrustScore agentName={agentName} trustScore={trustScore} />
      
      {/* Optional: Display current trust score if needed */}
      {trustScore && (
        <div className="mt-4 p-3 rounded-lg" style={{ 
          backgroundColor: 'var(--config-input-bg)',
          border: '1px solid var(--border-color)'
        }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-color-secondary)' }}>
              Current Trust Score for {agentName}:
            </span>
            <span 
              className="text-lg font-bold"
              style={{ 
                color: trustScore >= 80 ? '#10b981' : trustScore >= 60 ? '#f59e0b' : '#ef4444'
              }}
            >
              {trustScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustScoreDetails;
