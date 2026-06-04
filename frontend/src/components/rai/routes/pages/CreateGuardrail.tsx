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
import SplitGuardrailCreationForm from '../../../forms/SplitGuardrailCreationForm';
import { API_BASE_URL } from '../../../../config/api';

const CreateGuardrail: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/guardrails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      navigate('/rai?section=guardrails-section');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create guardrail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    // Navigate back to guardrails dashboard without saving
    navigate('/rai?section=guardrails-section');
  };

  return (
    <>
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
          {submitError}
        </div>
      )}
      <SplitGuardrailCreationForm
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isLoading={isLoading}
      />
    </>
  );
};

export default CreateGuardrail;
