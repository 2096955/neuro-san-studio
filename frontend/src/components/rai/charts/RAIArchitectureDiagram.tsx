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

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Building2, 
  Database, 
  Shield, 
  Brain,
  MoveDown,
  Settings,
  Target,
  Bot,
  CheckCircle,
  BarChart3,
  Lock,
  Zap,
  Eye,
  DollarSign,
  Layers,
  RefreshCw
} from 'lucide-react';

interface RAIArchitectureDiagramProps {
  className?: string;
}

const RAIArchitectureDiagram: React.FC<RAIArchitectureDiagramProps> = ({ 
  className = "" 
}) => {
  const [clickedComponent, setClickedComponent] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [dataPackets, setDataPackets] = useState<number[]>([]);

  const handleComponentClick = (componentId: string) => {
    setClickedComponent(clickedComponent === componentId ? null : componentId);
  };

  // Animation for Trust Overlay box
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 1000);
    }, 2000);

    return () => clearInterval(pulseInterval);
  }, []);

  // Data packets animation
  useEffect(() => {
    const packetInterval = setInterval(() => {
      const newPacket = Date.now();
      setDataPackets(prev => [...prev, newPacket]);
      
      // Remove packet after animation completes
      setTimeout(() => {
        setDataPackets(prev => prev.filter(id => id !== newPacket));
      }, 1500);
    }, 800);

    return () => clearInterval(packetInterval);
  }, []);
  
  const infrastructureComponents = [
    {
      icon: Cloud,
      title: "Azure/AWS",
      subtitle: "AI/ML\nCloud Services",
      tooltip: {
        title: "Cloud AI/ML Services",
        description: "Enterprise-grade AI and ML services from major cloud providers.",
        features: ["Scalable AI compute", "Managed ML services", "Pre-trained models"]
      }
    },
    {
      icon: Building2,
      title: "Enterprise Apps",
      subtitle: "SAP, Salesforce,\nCustom apps",
      tooltip: {
        title: "Enterprise Applications",
        description: "Core business applications and systems for operations.",
        features: ["ERP systems (SAP)", "CRM platforms", "Custom business apps"]
      }
    },
    {
      icon: Database,
      title: "Data Platform",
      subtitle: "Data Lakes,\nSnowflake, Databricks",
      tooltip: {
        title: "Data Platform & Analytics",
        description: "Modern data infrastructure for analytics and ML training.",
        features: ["Data lakes & warehouses", "Real-time analytics", "ML feature stores"]
      }
    },
    {
      icon: Shield,
      title: "Security Tools",
      subtitle: "SIEM, IAM\nGovernance,",
      tooltip: {
        title: "Security & Governance Tools",
        description: "Security infrastructure protecting data and AI systems.",
        features: ["SIEM monitoring", "Identity management", "Access controls"]
      }
    },
    {
      icon: Brain,
      title: "AI Models",
      subtitle: "OpenAI, Anthropic,\nInternal LLMs",
      tooltip: {
        title: "AI Models & LLMs",
        description: "Large language models and AI systems from various providers.",
        features: ["GPT-4, Claude, Gemini", "Custom fine-tuned models", "Domain-specific LLMs"]
      }
    },
    {
      icon: Settings,
      title: "Cognizant Trust Overlay",
      subtitle: "Trust\nEnablement",
      isOverlay: true,
      tooltip: {
        title: "Cognizant Trust Overlay",
        description: "RAI Trust Layer providing governance and control across AI systems.",
        features: ["Non-invasive integration", "Real-time monitoring", "Policy enforcement"]
      }
    }
  ];

  const controlFrameworkItems = [
    {
      text: "Centralized Governance across all AI initiatives",
      tooltip: "Unified governance framework that defines and enforces AI policies across all organizational AI initiatives, ensuring consistent standards and compliance."
    },
    {
      text: "Agentic Orchestration",
      tooltip: "Intelligent coordination of AI agents and services, managing workflows, dependencies, and interactions between different AI systems."
    },
    {
      text: "Business Logic/Policy Engine",
      tooltip: "Rule-based engine that translates business requirements into executable policies, ensuring AI systems operate within defined business constraints."
    },
    {
      text: "Continuous RAI & Performance Metrics Monitoring",
      tooltip: "Real-time monitoring of Responsible AI metrics including fairness, transparency, accountability, and system performance indicators."
    },
    {
      text: "Compliance Automation & Monitoring",
      tooltip: "Automated compliance checking against regulatory requirements (GDPR, CCPA, AI Act) with continuous monitoring and reporting."
    },
    {
      text: "Risk Management",
      tooltip: "Proactive identification, assessment, and mitigation of AI-related risks including bias, privacy breaches, and operational failures."
    },
    {
      text: "Performance Optimization",
      tooltip: "Continuous optimization of AI system performance, cost efficiency, and resource utilization across the entire AI infrastructure."
    }
  ];

  return (
    <div className={`bg-gray-50 p-6 rounded-lg ${className}`}>
      <style>{`
        @keyframes borderToLayerFlow {
          0% {
            bottom: -2px;
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            bottom: -80px;
            opacity: 0.8;
            transform: translateX(-50%) scale(0.8);
          }
          80% {
            bottom: -140px;
            opacity: 0.6;
            transform: translateX(-50%) scale(0.6);
          }
          100% {
            bottom: -180px;
            opacity: 0;
            transform: translateX(-50%) scale(0.3);
          }
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-200 to-purple-100 text-gray-800 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Cognizant Trust Layer</h1>
            <div className="text-sm opacity-90">
              High-Level Responsible AI Architecture (Governance & Orchestration) View
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm">RAI Trust Layer — Architecture View</div>
            <div className="text-xs text-gray-600 mt-1">
              API-Led Integration · End-to-End Observability · Minimal Invasion
            </div>
          </div>
        </div>
      </div>

      {/* Main Architecture Canvas */}
      <div className="space-y-2">
        {/* Top Row: Infrastructure */}
        <div className="flex gap-6 items-stretch">
          {/* Existing Client Infrastructure */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-600 mb-3">
              Existing Client Infrastructure
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 h-full">
              <div className="grid grid-cols-6 gap-3 h-full">
                {infrastructureComponents.map((component, index) => {
                  const IconComponent = component.icon;
                  const componentId = `component-${index}`;
                  return (
                    <div 
                      key={index}
                      className={`relative ${component.isOverlay ? `bg-gradient-to-b from-green-25 to-green-50 border-2 border-dashed border-green-400 ${pulseAnimation ? 'animate-pulse ring-2 ring-green-400 ring-opacity-75' : ''}` : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200'} rounded-lg p-2 text-center min-h-[50px] flex flex-col justify-center hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-visible`}
                      onClick={() => handleComponentClick(componentId)}
                    >
                      <div className="relative">
                        <IconComponent className={`w-5 h-5 mx-auto mb-1 ${component.isOverlay ? `text-green-600 ${pulseAnimation ? 'animate-spin' : ''}` : 'text-gray-700'} group-hover:scale-110 transition-transform`} />
                        {/* Data packets flowing from border to green layer */}
                        {component.isOverlay && dataPackets.map((packetId) => (
                          <div
                            key={packetId}
                            className="absolute w-2 h-2 bg-green-500 rounded-full"
                            style={{
                              left: '50%',
                              bottom: '-2px',
                              transform: 'translateX(-50%)',
                              animation: 'borderToLayerFlow 2s linear forwards',
                              zIndex: 1000
                            }}
                          />
                        ))}
                      </div>
                      <h4 className={`text-xs font-semibold mb-1 ${component.isOverlay ? 'text-green-700' : 'text-gray-800'}`}>
                        {component.title}
                      </h4>
                      <p className={`text-xs whitespace-pre-line ${component.isOverlay ? 'text-green-600' : 'text-gray-600'}`}>
                        {component.subtitle}
                      </p>
                      
                      {/* Tooltip */}
                      {clickedComponent === componentId && (
                        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg shadow-lg border border-gray-600 text-left">
                          <div className="text-xs font-semibold mb-1 text-blue-200">{component.tooltip.title}</div>
                          <div className="text-xs mb-1 text-gray-200 leading-tight">{component.tooltip.description}</div>
                          <div className="space-y-0.5">
                            {component.tooltip.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center text-xs text-gray-300">
                                <span className="w-1 h-1 bg-blue-400 rounded-full mr-1.5 flex-shrink-0"></span>
                                {feature}
                              </div>
                            ))}
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Arrows pointing down - aligned with box centers */}
        <div className="relative py-2 pb-0">
          <div className="grid grid-cols-6 gap-3 px-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex justify-center">
                <div className="relative">
                  <MoveDown 
                    className="w-7 h-8 text-gray-500 opacity-80 transition-opacity duration-300 hover:opacity-100" 
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RAI Trust Layer Band */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-xl p-4 relative overflow-visible -mt-2 shadow-lg">
          {/* Header with enhanced styling */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="bg-green-600 p-2 rounded-lg shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-bold text-green-800 text-xl">RAI Trust Layer</h2>
            </div>
            <p className="text-green-700 text-sm font-medium">Enterprise AI Governance & Control Platform</p>
          </div>
          
          {/* Feature grid with enhanced design */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center hover:bg-opacity-90 transition-all duration-200 border border-green-200 shadow-sm">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-800 mb-1">API Led</div>
              <div className="text-xs text-green-700">Integration</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center hover:bg-opacity-90 transition-all duration-200 border border-green-200 shadow-sm">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-800 mb-1">End-to-End</div>
              <div className="text-xs text-green-700">Observability</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center hover:bg-opacity-90 transition-all duration-200 border border-green-200 shadow-sm">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-800 mb-1">Immediate</div>
              <div className="text-xs text-green-700">ROI</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center hover:bg-opacity-90 transition-all duration-200 border border-green-200 shadow-sm">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-800 mb-1">Minimally</div>
              <div className="text-xs text-green-700">Invasive</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center hover:bg-opacity-90 transition-all duration-200 border border-green-200 shadow-sm">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-800 mb-1">No Systems</div>
              <div className="text-xs text-green-700">Replacement</div>
            </div>
          </div>
        </div>

        {/* Arrow down to control framework */}
        <div className="flex justify-center relative">
          <MoveDown className="w-8 h-8 text-gray-600" strokeWidth={3} />
        </div>

        {/* Bottom Grid: Control Framework + Dashboard */}
        <div className="grid grid-cols-2 gap-6">
          {/* RAI Control Framework */}
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  RAI Control Framework
                </h3>
                <p className="text-xs text-gray-600">Centralized AI Governance & Policy Engine</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {controlFrameworkItems.map((item, index) => {
                const itemId = `framework-${index}`;
                const iconConfigs = [
                  { Icon: Target, color: 'bg-purple-100', iconColor: 'text-purple-600' },
                  { Icon: Bot, color: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { Icon: Settings, color: 'bg-green-100', iconColor: 'text-green-600' },
                  { Icon: BarChart3, color: 'bg-orange-100', iconColor: 'text-orange-600' },
                  { Icon: CheckCircle, color: 'bg-teal-100', iconColor: 'text-teal-600' },
                  { Icon: Shield, color: 'bg-red-100', iconColor: 'text-red-600' },
                  { Icon: Zap, color: 'bg-yellow-100', iconColor: 'text-yellow-600' }
                ];
                const currentConfig = iconConfigs[index] || iconConfigs[0];
                const IconComponent = currentConfig.Icon;
                
                return (
                  <div 
                    key={index} 
                    className="relative bg-purple-50 border border-purple-200 rounded-lg p-3 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleComponentClick(itemId)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`${currentConfig.color} w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-3.5 h-3.5 ${currentConfig.iconColor}`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 leading-tight">
                          {item.text}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tooltip */}
                    {clickedComponent === itemId && (
                      <div className="absolute z-50 left-full top-0 ml-4 w-56 bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg shadow-lg border border-gray-600 text-left">
                        <div className="text-xs text-gray-200 leading-tight">{item.tooltip}</div>
                        {/* Arrow */}
                        <div className="absolute top-3 right-full w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cognizant Trust Dashboard */}
          <div 
            className="relative bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => handleComponentClick('dashboard')}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="bg-gray-700 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="font-semibold text-gray-800 text-lg">
                Cognizant Trust Dashboard
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Executive view · Guardrails · Red Teaming · Sustainability · Governance
              </div>
            </div>
            
            {/* Tooltip */}
            {clickedComponent === 'dashboard' && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 bg-opacity-70 text-white p-2 rounded-lg shadow-lg border border-gray-600 text-left">
                <div className="text-xs font-semibold mb-1 text-green-200">Cognizant Trust Dashboard</div>
                <div className="text-xs mb-1 text-gray-200 leading-tight">
                  Executive dashboard for AI governance, performance, and risk visibility.
                </div>
                <div className="space-y-0.5">
                  {['Executive KPI monitoring', 'Real-time guardrail status', 'Red team assessments'].map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-xs text-gray-300">
                      <span className="w-1 h-1 bg-green-400 rounded-full mr-1.5 flex-shrink-0"></span>
                      {feature}
                    </div>
                  ))}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RAIArchitectureDiagram;
