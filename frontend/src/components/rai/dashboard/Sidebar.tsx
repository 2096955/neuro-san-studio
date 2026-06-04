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
import { 
  Home, 
  Activity, 
  Target, 
  Zap, 
  Shield, 
  Leaf, 
  FileCheck,
  Building2,
  FileText,
  Database,
  Users
} from 'lucide-react';
import Logo from './Logo';

export type DashboardSection = 
  | 'overview' 
  | 'trust-framework'
  | 'ai-registry'
  | 'agentic-systems'
  | 'dashboard'
  | 'guardrails-section'
  | 'trust-analytics' 
  | 'performance-reliability' 
  | 'guardrails' 
  | 'sustainability-cost' 
  | 'performance'
  | 'policies'
  | 'create-policy'
  | 'create-guardrail';

interface SidebarItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface SidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  selectedNetwork: string;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  selectedNetwork: _selectedNetwork,
  onClose: _onClose
}) => {
  const sidebarItems: SidebarItem[] = [
    { 
      id: 'overview', 
      label: 'Home', 
      icon: <Home size={18} />,
      description: 'Dashboard home and overview'
    },
    // { 
    //   id: 'trust-framework', 
    //   label: 'Trust Framework', 
    //   icon: <Building2 size={18} />,
    //   description: 'RAI Trust Layer architecture and framework overview'
    // },
    { 
      id: 'ai-registry', 
      label: 'AI Registry', 
      icon: <Database size={18} />,
      description: 'AI system registrations and compliance tracking'
    },
    // { 
    //   id: 'agentic-systems', 
    //   label: 'Agentic Systems', 
    //   icon: <Users size={18} />,
    //   description: 'Multi-agent systems and agentic AI architectures'
    // },
    { 
      id: 'policies', 
      label: 'Policies', 
      icon: <FileText size={18} />,
      description: 'Policy management and documentation'
    },
    { 
      id: 'guardrails-section', 
      label: 'Guardrails', 
      icon: <Shield size={18} />,
      description: 'Guardrail configuration and management'
    },
    { 
      id: 'dashboard', 
      label: 'Live Dashboard (Guardrails)', 
      icon: <Activity size={18} />,
      description: 'Real-time guardrail monitoring and health metrics'
    },
    // { 
    //   id: 'trust-analytics', 
    //   label: 'Red Teaming / Test Runs', 
    //   icon: <Target size={18} />,
    //   description: 'Adversarial testing and security assessments'
    // },
    { 
      id: 'performance-reliability', 
      label: 'Performance & Reliability', 
      icon: <Zap size={18} />,
      description: 'System performance metrics and reliability monitoring'
    },
    // { 
    //   id: 'guardrails', 
    //   label: 'AI Safety & Ethics', 
    //   icon: <Shield size={18} />,
    //   description: 'Safety protocols and ethical AI guidelines'
    // },
    { 
      id: 'sustainability-cost', 
      label: 'Sustainability & Cost', 
      icon: <Leaf size={18} />,
      description: 'Environmental impact and cost optimization'
    },
    // { 
    //   id: 'performance', 
    //   label: 'Governance & Compliance', 
    //   icon: <FileCheck size={18} />,
    //   description: 'Regulatory compliance and governance policies'
    // }
  ];

  return (
    <div 
      className="w-64 flex-shrink-0 flex flex-col border-r border-border"
      style={{ 
        background: '#ffffff'
      }}
    >
      {/* Header with Logo */}
      <div className="px-4 py-6 flex-shrink-0 border-b border-border">
        <Logo variant="light" size="md" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-2 border-0 outline-none focus:outline-none focus:ring-0 ${
              activeSection === item.id
                ? 'bg-primary text-primary-foreground shadow-lg hover:bg-primary-hover'
                : 'text-foreground bg-card hover:bg-accent-light hover:text-primary'
            }`}
            title={item.description}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <div className="flex-1 text-left font-medium">{item.label}</div>
            {item.label === 'Notifications' && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                28
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer - Hidden to match screenshot */}
    </div>
  );
};

export default Sidebar;
