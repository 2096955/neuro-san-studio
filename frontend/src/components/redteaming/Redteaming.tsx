import { useEffect } from 'react';
import { usePage } from '../../contexts/PageContext';

export default function Redteaming() {
  const { updatePage } = usePage();

  useEffect(() => {
    updatePage('Red Teaming', 'AI adversarial testing and vulnerability assessment');
  }, []); // Run only once on mount

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-card-foreground mb-4">Red Teaming</h2>
            <p className="text-lg text-muted-foreground mb-6">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
