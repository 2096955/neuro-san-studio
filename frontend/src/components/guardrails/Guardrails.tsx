import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';
import Privacy from './privacy/Privacy';

export default function Guardrails() {
  const { updatePage } = usePage();

  useEffect(() => {
    updatePage('Guardrails', 'AI safety controls and governance policies');
  }, []); // Run only once on mount

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        

        {/* Privacy Controls Section */}
        <div className="mt-8">
          <Privacy />
        </div>
      </div>
    </div>
  );
}
