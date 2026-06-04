import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePage } from '../contexts/PageContext';
import { useSidebar } from '../contexts/SidebarContext';
import Sidebar from '../components/rai/dashboard/Sidebar';
import RAIRouter from '../components/rai/routes/RAIRouter';
import type { DashboardSection } from '../components/rai/dashboard/Sidebar';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

const RAI: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const { updatePage } = usePage();
  const { isOpen: mainSidebarOpen } = useSidebar();
  const { updateBreadcrumbs } = useBreadcrumb();

  const params = new URLSearchParams(location.search);
  const selectedNetwork = params.get('network') ?? '';
  const [trustScore, setTrustScore] = useState<number | undefined>(undefined);
  const [adversarialMode, setAdversarialMode] = useState(false);

  useEffect(() => {
    const fetchTrustScore = async () => {
      try {
        const { API_BASE_URL } = await import('../config/api');
        const res = await fetch(`${API_BASE_URL}/api/trust/score`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data?.score === 'number') setTrustScore(data.score);
        }
      } catch {
        // No trust score API or not implemented yet
      }
    };
    fetchTrustScore();
  }, []);

  // Section title mapping
  const sectionTitles: Record<DashboardSection, string> = {
    'overview': 'Overview',
    'trust-framework': 'Trust Framework',
    'ai-registry': 'AI Registry',
    'agentic-systems': 'Agentic Systems',
    'dashboard': 'Live Dashboard (Guardrails)',
    'guardrails-section': 'Guardrails',
    'trust-analytics': 'Red Teaming / Test Runs',
    'performance-reliability': 'Performance & Reliability',
    'guardrails': 'AI Safety & Ethics',
    'sustainability-cost': 'Sustainability & Cost',
    'performance': 'Governance & Compliance',
    'policies': 'Policies',
    'create-policy': 'Create Policy',
    'create-guardrail': 'Create Guardrail'
  };

  // Update page context and breadcrumbs when component mounts or section changes
  useEffect(() => {
    //alert(activeSection);
    const sectionTitle = sectionTitles[activeSection] || 'Overview';
    updatePage('Trust', undefined, sectionTitle);
    updateBreadcrumbs([
      { label: 'Trust', path: '/rai' },
      { label: sectionTitle }
    ]);
  }, [activeSection]);

  // Handle URL query parameters for section navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') as DashboardSection;
    if (section) {
      setActiveSection(section);
    }
  }, [location.search]);

  const handleAdversarialToggle = (enabled: boolean) => {
    setAdversarialMode(enabled);
  };


  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* RAI Sidebar - Fixed positioning starting from top */}
      <div className="fixed top-0 w-64 h-screen z-30 border-r border-gray-200 transition-all duration-300" 
           style={{ 
             left: mainSidebarOpen ? '224px' : '64px',
             background: 'linear-gradient(rgb(224, 242, 254) 0%, rgb(219, 234, 254) 50%, rgb(191, 219, 254) 100%)'
           }}>
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            navigate(`/rai?section=${section}`);
          }}
          selectedNetwork={selectedNetwork}
          onClose={() => {}}
        />
      </div>

      {/* Main Content - Adjusted margin for both sidebars */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64" style={{
        marginLeft: mainSidebarOpen ? '270px' : '238px'
      }}>
        {/* Content Area with Router */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-2 pt-0">
          <RAIRouter
            activeSection={activeSection}
            selectedNetwork={selectedNetwork}
            trustScore={trustScore ?? undefined}
            adversarialMode={adversarialMode}
            onAdversarialToggle={handleAdversarialToggle}
            onSectionChange={setActiveSection}
          />
        </div>
      </div>
    </div>
  );
};

export default RAI;
