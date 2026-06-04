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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import PolicyCreationForm from '../../../forms/PolicyCreationForm';
import { API_BASE_URL } from '../../../../config/api';

const CreatePolicy: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      navigate('/rai?section=policies');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    // Navigate back to policy dashboard without saving
    navigate('/rai?section=policies');
  };

  return (
    <PageLayout>
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
          {submitError}
        </div>
      )}
      <PolicyCreationForm
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isLoading={isLoading}
      />
    </PageLayout>
  );
};

export default CreatePolicy;
