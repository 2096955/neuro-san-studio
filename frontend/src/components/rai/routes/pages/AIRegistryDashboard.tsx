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
import PageLayout from '../layouts/PageLayout';
import Card from '../components/Card';
import { useAIRegistryStats } from '../../../../hooks/useAIRegistryStats';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import RadialBarAIRegistry from '../../charts/RadialBarAIRegistry';

import { Database, Bot, AlertTriangle, CheckCircle, Clock, Building, Plus, Users, RefreshCw } from 'lucide-react';


interface AgentDefinition {
  name: string;
  role: 'frontman' | 'specialist' | 'support';
  capabilities: string[];
  tools: string[];
  instructions?: string;
}

interface AgenticSystemEntry {
  id: string;
  name: string;
  businessDomain: string;
  organisationalRole: 'deployer' | 'provider' | 'other';
  region: string[];
  function: string[];
  industry: string[];
  systemType: 'multi_agent_system' | 'single_agent' | 'tool_augmented' | 'conversational';
  capabilities: string[];
  models: string[];
  agenticConfig: {
    llmConfig: { model_name: string };
    executionLimits: {
      maxIterations: number;
      maxExecutionSeconds: number;
    };
    instructionsPrefix: string;
  };
  agents: AgentDefinition[];
  tools: string[];
  riskProfile: {
    autonomyLevel: 'high' | 'medium' | 'low';
    businessImpact: 'customer_facing' | 'internal' | 'support';
    externalDependencies: string[];
    dataAccess: 'pii' | 'financial' | 'public' | 'internal';
  };
  status: 'active' | 'inactive' | 'pending' | 'maintenance';
  lastUpdated: string;
  registrationDate: string;
}

interface AIRegistryStats {
  totalRegistries: number;
  activeRegistries: number;
  pendingApproval: number;
  multiAgentSystems?: number; // Optional for backward compatibility
  riskCategories: {
    high: number;
    medium: number;
    low: number;
    minimal: number;
  };
  systemTypes: {
    multiAgent: number;
    singleAgent: number;
    toolAugmented: number;
    conversational: number;
  };
  byDepartment: {
    name: string;
    domain?: string;
    count: number;
    percentage: number;
  }[];
  recentActivity: {
    id: string;
    name?: string; // Optional - API uses system_name
    system_name?: string; // API field
    action: string;
    timestamp: string;
    status: 'approved' | 'pending' | 'rejected';
  }[];
}

const AIRegistryDashboard: React.FC = () => {
  // Use real API data
  const { statistics, loading, error, refreshAll } = useAIRegistryStats();
  
  // Local state for UI controls
  const [selectedSystemType, setSelectedSystemType] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Show loading state
  if (loading && !statistics) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading registry data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // Show error state
  if (error && !statistics) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  const data = statistics;
  if (!data) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">No data available</p>
        </div>
      </PageLayout>
    );
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-orange-600" />;
      case 'rejected': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Registry Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive view of AI system registrations and compliance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registries</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalRegistries}</p>
              <p className="text-sm text-green-600 mt-1">+12 this month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Database size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Systems</p>
              <p className="text-3xl font-bold text-gray-900">{data.activeRegistries}</p>
              <p className="text-sm text-green-600 mt-1">80% operational</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Bot size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900">{data.pendingApproval}</p>
              <p className="text-sm text-orange-600 mt-1">Requires review</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock size={24} className="text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Multi-Agent Systems</p>
              <p className="text-3xl font-bold text-gray-900">{data.multiAgentSystems ?? '—'}</p>
              <p className="text-sm text-purple-600 mt-1">Complex orchestration</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* System Types and Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* System Types - Donut Chart */}
        <Card title="System Types" subtitle="Distribution of agentic AI systems by architecture">
          <div className="p-6">
            {(() => {
              const chartData = Object.entries(data.systemTypes).map(([type, typeData]) => {
                const typeConfig = {
                  multiAgent: { label: 'Multi-Agent', color: '#9333ea' },
                  singleAgent: { label: 'Single Agent', color: '#3b82f6' },
                  toolAugmented: { label: 'Tool-Augmented', color: '#f97316' },
                  conversational: { label: 'Conversational', color: '#22c55e' }
                }[type as 'multiAgent' | 'singleAgent' | 'toolAugmented' | 'conversational'];
                
                const count = typeof typeData === 'number' ? typeData : typeData.count;
                
                return {
                  name: typeConfig?.label || type,
                  value: count,
                  color: typeConfig?.color || '#6b7280'
                };
              });

              return (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                  {data.name}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {data.value} systems
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {chartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-700">{entry.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </Card>

        {/* Registry Distribution - Radial Bar Chart */}
        <Card title="By Registry" subtitle="AI systems grouped by registry domain">
          <div className="p-6">
            <RadialBarAIRegistry data={data.byDepartment} />
          </div>
        </Card>
      </div>

      {/* Agentic Systems Registry */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Agentic Systems Registry</h2>
            <p className="text-sm text-gray-600">Registered agentic AI systems and their configurations</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              aria-label="Filter by system type"
              value={selectedSystemType}
              onChange={(e) => setSelectedSystemType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="multi_agent_system">Multi-Agent</option>
              <option value="single_agent">Single Agent</option>
              <option value="tool_augmented">Tool-Augmented</option>
              <option value="conversational">Conversational</option>
            </select>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              <Plus size={16} />
              Create System
            </button>
          </div>
        </div>
        
    
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" subtitle="Latest agentic system registrations and updates">
        <div className="p-6">
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="font-medium text-gray-900">{activity.name || activity.system_name || 'Unknown System'}</p>
                    <p className="text-sm text-gray-600">{activity.id} • {activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.timestamp}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              View All Activity
            </button>
          </div>
        </div>
      </Card>

  
    </PageLayout>
  );
};

export default AIRegistryDashboard;
