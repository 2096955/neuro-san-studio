import { useEffect } from 'react';
import { usePage } from '../contexts/PageContext';
import RAILabel from './common/RAILabel';

export default function Dashboard() {
  const { updatePage } = usePage();

  useEffect(() => {
    updatePage('Dashboard', 'Overview of AI system performance and key metrics');
  }, []); // Run only once on mount
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-card-foreground mb-3">Welcome to RAI Dashboard</h2>
            <p className="text-base text-muted-foreground mb-5">Your comprehensive platform for responsible AI monitoring and governance</p>
            
            {/* RAI Label */}
            <div className="flex justify-center mb-8">
              <RAILabel score="B" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-background border border-border/50 rounded-lg p-6">
                <div className="text-xl font-semibold text-primary mb-1">12</div>
                <div className="text-xs text-muted-foreground">Active Models</div>
              </div>
              <div className="bg-background border border-border/50 rounded-lg p-6">
                <div className="text-xl font-semibold text-secondary mb-1">98.5%</div>
                <div className="text-xs text-muted-foreground">Fairness Score</div>
              </div>
              <div className="bg-background border border-border/50 rounded-lg p-6">
                <div className="text-xl font-semibold text-primary mb-1">24/7</div>
                <div className="text-xs text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
