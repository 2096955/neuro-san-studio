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
import PageLayout from '../layouts/PageLayout';
import AISafety from '../../AISafety';
import AISafetyCard from '../../components/AISafetyCard';

interface AISafetyPageProps {
  adversarialMode?: boolean;
  onSectionChange?: (section: string) => void;
}

const AISafetyPage: React.FC<AISafetyPageProps> = () => {
  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance & Reliability</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor AI system performance, reliability metrics, and safety benchmarks
        </p>
      </div>

      {/* AI Safety Card */}
      <div className="mb-6">
        <AISafetyCard />
      </div>


    </PageLayout>
  );
};

export default AISafetyPage;
