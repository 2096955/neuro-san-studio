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
import type { DashboardSection } from '../dashboard/Sidebar';
import TrustLayerConsole from '../TrustLayerConsole';
import OverviewPage from './pages/OverviewPage';
import DashboardPage from './pages/DashboardPage';
import TrustFramework from './pages/TrustFramework';
import GovernancePage from '../../governance/GovernancePage';
import PolicyDashboard from '../../policies/PolicyDashboard';
import CreatePolicy from './pages/CreatePolicy';
import CreateGuardrail from './pages/CreateGuardrail';
import GuardrailsDashboard from '../../guardrails/GuardrailsDashboard';
import AIRegistryDashboard from './pages/AIRegistryDashboard';
import SustainabilityPage from './pages/SustainabilityPage';
import AISafetyPage from './pages/AISafetyPage';


interface RAIRouterProps {
  activeSection: DashboardSection;
  selectedNetwork: string;
  trustScore: number | undefined;
  adversarialMode: boolean;
  onAdversarialToggle: (enabled: boolean) => void;
  onSectionChange: (section: DashboardSection) => void;
}

// Route configuration for better maintainability
const sectionComponents: Record<DashboardSection, { 
  component: React.ComponentType<any>; 
  props?: (routerProps: RAIRouterProps) => any;
}> = {
  'overview': { 
    component: OverviewPage, 
    props: (routerProps) => ({ 
      trustScore: routerProps.trustScore,
      adversarialMode: routerProps.adversarialMode,
      onSectionChange: routerProps.onSectionChange
    })
  },
  'trust-framework': { 
    component: TrustFramework, 
    props: () => ({})
  },
  'ai-registry': { 
    component: AIRegistryDashboard, 
    props: () => ({})
  },
  'agentic-systems': { 
    component: AIRegistryDashboard, 
    props: () => ({})
  },
  'dashboard': { component: DashboardPage, props: (routerProps) => ({ trustScore: routerProps.trustScore }) },
  'guardrails-section': { 
    component: GuardrailsDashboard, 
    props: () => ({})
  },
  'trust-analytics': { 
    component: TrustLayerConsole,
    props: (props) => ({
      adversarialMode: props.adversarialMode,
      onAdversarialToggle: props.onAdversarialToggle
    })
  },
  'performance-reliability': {
    component: AISafetyPage,
    props: () => ({})
  },
  'guardrails': {
    component: GuardrailsDashboard,
    props: () => ({})
  },
  'sustainability-cost': {
    component: SustainabilityPage, // Sustainability & Cost page
    props: () => ({})
  },
  'performance': {
    component: GovernancePage,
    props: () => ({})
  },
  'policies': {
    component: PolicyDashboard,
    props: () => ({})
  },
  'create-policy': {
    component: CreatePolicy,
    props: () => ({})
  },
  'create-guardrail': {
    component: CreateGuardrail,
    props: () => ({})
  }
};

const RAIRouter: React.FC<RAIRouterProps> = (props) => {
  const { activeSection } = props;
  
  const route = sectionComponents[activeSection];
  
  if (!route) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Section Not Found</h2>
          <p className="text-gray-600">The requested section "{activeSection}" could not be found.</p>
        </div>
      </div>
    );
  }

  const Component = route.component;
  const componentProps = route.props ? route.props(props) : {};

  return (
    <div className="space-y-6">
      <Component {...componentProps} />
    </div>
  );
};

export default RAIRouter;
