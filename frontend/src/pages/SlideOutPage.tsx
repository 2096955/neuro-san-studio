import React, { useState, useEffect } from 'react';
import SlideOutContainer from '../components/common/SlideOutContainer';
import SlideOutDetailHeader from '../components/common/SlideOutDetailHeader';
import AgentFlowGraph from '../components/common/AgentFlowGraph';
import ChatBox from '../components/common/ChatBox';
import SlidingRAIAgentContainer from '../components/common/SlidingRAIAgentContainer';
import { useSelectedSystem } from '../contexts/SelectedSystemContext';
import SystemCards, { type SystemCardData } from '../components/common/SystemCards';
import { aiRegistryService, type AIAgent } from '../services/AIRegistryService';
import { chatService } from '../services/ChatService';
import { useAIRegistry } from '../hooks/useAIRegistry';

/** API response shape for system details */
export interface SystemDetailsResponse {
  system: {
    name: string;
    agents: AIAgent[];
    total_agents: number;
  };
}

/** Parsed HOCON content from getSystemParsedConfig */
export interface ParsedContent {
  llm_config?: { model_name?: string; temperature?: number };
  tools?: Array<{ name?: string; [key: string]: unknown }>;
  execution_limits?: { max_iterations?: number; timeout_seconds?: number; max_tool_calls?: number };
  [key: string]: unknown;
}

export interface ParsedConfigResponse {
  file_name?: string;
  file_path?: string;
  raw_content?: string;
  parsed_content?: ParsedContent;
  error?: string | null;
}

/** RAI network data passed to SlidingRAIAgentContainer (opaque from API) */
export type RaiNetworkData = unknown;

export interface SlideOutPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlideOutPage: React.FC<SlideOutPageProps> = ({ isOpen, onClose }) => {
  const [selectedSystem, setSelectedSystem] = useState<SystemCardData | null>(null);
  const [currentView, setCurrentView] = useState<'cards' | 'detail'>('cards');
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'agents-tools' | 'raw-config'>('overview');
  const [systemDetails, setSystemDetails] = useState<SystemDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hoconConfig, setHoconConfig] = useState<string | null>(null);
  const [loadingHocon, setLoadingHocon] = useState(false);
  const [hoconError, setHoconError] = useState<string | null>(null);
  const [parsedConfig, setParsedConfig] = useState<ParsedConfigResponse | null>(null);
  const [loadingParsedConfig, setLoadingParsedConfig] = useState(false);
  const [parsedConfigError, setParsedConfigError] = useState<string | null>(null);
  const [isRAINetworkOpen, setIsRAINetworkOpen] = useState(false);
  const [raiNetworkData, setRaiNetworkData] = useState<RaiNetworkData>(null);

  // Use global context for selected system
  const { setSelectedSystem: setGlobalSelectedSystem } = useSelectedSystem();

  // Use real AI registry data
  const {
    filteredAgents,
    loading,
    error
  } = useAIRegistry();

  // Sync local state with global context
  useEffect(() => {
    if (selectedSystem) {
      setGlobalSelectedSystem(selectedSystem);
    }
  }, [selectedSystem, setGlobalSelectedSystem]);

  // Fetch HOCON config when raw-config tab is selected
  useEffect(() => {
    const fetchHoconConfig = async () => {
      if (activeTab === 'raw-config' && selectedSystem && !hoconConfig) {
        setLoadingHocon(true);
        setHoconError(null);
        
        try {
          const systemName = selectedSystem.metadata.system;
          console.log(`Fetching HOCON config for: ${systemName}`);
          const config = await aiRegistryService.getSystemHoconConfig(systemName);
          setHoconConfig(config);
        } catch (error) {
          console.error('Error fetching HOCON config:', error);
          setHoconError(error instanceof Error ? error.message : 'Failed to load HOCON configuration');
        } finally {
          setLoadingHocon(false);
        }
      }
    };

    fetchHoconConfig();
  }, [activeTab, selectedSystem, hoconConfig]);

  // Fetch parsed config when agents-tools tab is selected
  useEffect(() => {
    const fetchParsedConfig = async () => {
      if (activeTab === 'agents-tools' && selectedSystem && !parsedConfig) {
        setLoadingParsedConfig(true);
        setParsedConfigError(null);
        
        try {
          // Use the system name as the filename (it should match the .hocon filename)
          // The API will add .hocon extension if needed
          const fileName = selectedSystem.metadata.system;
          console.log(`Fetching parsed config for file: ${fileName}`);
          const config = await aiRegistryService.getSystemParsedConfig(fileName);
          
          // Verify we got the right system's data
          if (config.parsed_content) {
            console.log(`Loaded agents and tools for: ${fileName}`);
            setParsedConfig(config);
          } else {
            throw new Error('No parsed content available for this system');
          }
        } catch (error) {
          console.error('Error fetching parsed config:', error);
          setParsedConfigError(error instanceof Error ? error.message : 'Failed to load agents and tools');
        } finally {
          setLoadingParsedConfig(false);
        }
      }
    };

    fetchParsedConfig();
  }, [activeTab, selectedSystem, parsedConfig]);

  // Transform agents data into accordion items format
  const accordionItems = filteredAgents.map((agent, index) => {
    // Determine risk level based on connections (simple heuristic)
    const connections = agent.connections || 0;
    const riskLevel = connections > 5 ? 'high' : connections > 2 ? 'medium' : 'low';
    
    // Use new fields with fallback to legacy fields
    const agentId = agent.id || agent.agent_id;
    const systemName = agent.system || agent.system_name;
    const agentName = agent.name || agent.agent_id;
    const description = agent.description || agent.system_description || '';
    const modelName = agent.llm_model || agent.model_name || 'unknown';
    const agentType = agent.type || 'agent';
    const tools = agent.tools || [];
    
    return {
      id: `${agentId}-${systemName}-${index}`, // Make unique by combining id, system, and index
      title: systemName,
      subtitle: agentName,
      badge: {
        text: riskLevel === 'high' ? 'High Risk' : 
              riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk',
        variant: riskLevel === 'high' ? 'error' as const : 
                 riskLevel === 'medium' ? 'warning' as const : 'success' as const
      },
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
        </svg>
      ),
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Type:</span>
              <p className="text-gray-900">{agentType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Risk Level:</span>
              <p className={riskLevel === 'high' ? 'text-red-600' : 
                          riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">System:</span>
              <p className="text-gray-900">{systemName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Connections:</span>
              <p className="text-gray-900">{connections}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Model:</span>
              <p className="text-gray-900">{modelName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Tools:</span>
              <p className="text-gray-900">{tools.length} Available</p>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        </div>
      ),
      metadata: {
        type: agentType,
        riskLevel: riskLevel,
        system: systemName,
        connections: connections,
        model: modelName,
        toolCount: tools.length
      },
      description: description
    };
  });

  const handleSystemSelect = async (system: SystemCardData) => {
    // Temporarily set the selected system with card data (for immediate UI feedback)
    setSelectedSystem(system);
    setCurrentView('detail');
    setActiveTab('overview'); // Reset to overview tab when selecting new system
    
    // Reset HOCON config and parsed config when switching systems
    setHoconConfig(null);
    setHoconError(null);
    setParsedConfig(null);
    setParsedConfigError(null);
    
    // Call the system details API
    setLoadingDetails(true);
    try {
      const systemName = system.metadata.system;
      console.log(`Fetching system details for: ${systemName}`);
      const details = await aiRegistryService.getSystemDetails(systemName);
      console.log('System details received:', details);
      
      // Store the system details in state
      setSystemDetails(details);
      
      // Update selectedSystem with data from API response
      if (details.system && details.system.agents && details.system.agents.length > 0) {
        const primaryAgent = details.system.agents[0];
        
        // Determine risk level based on connections
        const connections = primaryAgent.connections || 0;
        const riskLevel = connections > 5 ? 'high' : connections > 2 ? 'medium' : 'low';
        
        // Create updated system card data from API response
        const updatedSystem: SystemCardData = {
          id: primaryAgent.id || system.id,
          title: details.system.name,
          subtitle: (primaryAgent.name || primaryAgent.id || 'Unknown Agent'),
          badge: {
            text: riskLevel === 'high' ? 'High Risk' : 
                  riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk',
            variant: riskLevel === 'high' ? 'error' as const : 
                     riskLevel === 'medium' ? 'warning' as const : 'success' as const
          },
          icon: system.icon, // Keep the same icon
          content: system.content, // Keep the same content
          metadata: {
            type: primaryAgent.type || 'agent',
            riskLevel: riskLevel,
            system: details.system.name,
            connections: primaryAgent.connections || 0,
            model: primaryAgent.llm_model || primaryAgent.model_name || 'unknown',
            toolCount: primaryAgent.total_subagents || primaryAgent.tools?.length || 0
          },
          description: primaryAgent.description || primaryAgent.system_description || ''
        };
        
        setSelectedSystem(updatedSystem);
      }
    } catch (error) {
      console.error('Error fetching system details:', error);
      // Handle error gracefully - the UI will still show the card data
      setSystemDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToCards = () => {
    setCurrentView('cards');
    // Keep selectedSystem in memory, don't reset to null
  };

  const handleSlideOutClose = () => {
    // Don't reset state when closing - preserve current view and selected system
    onClose();
  };

  // Handle chat messages
  const handleChatMessage = async (message: string): Promise<string> => {
    try {
      console.log('🚀 Sending message to backend API:', message.substring(0, 50) + '...');
      const response = await chatService.sendMessage({
        message,
        network_name: selectedSystem?.metadata.system ?? undefined,
        system_name: selectedSystem?.metadata.system,
      });

      return response.response;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  };

  const getTitle = () => {
    if (currentView === 'detail' && selectedSystem) {
      return selectedSystem.title;
    }
    return `AI Use Cases ${loading ? '(Loading...)' : `(${accordionItems.length})`}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{selectedSystem?.title}</h1>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedSystem?.badge.variant === 'success' ? 'bg-green-100 text-green-800' :
                  selectedSystem?.badge.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  selectedSystem?.badge.variant === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSystem?.badge.text}
                </div>
              </div>
              <p className="text-lg text-gray-600">{selectedSystem?.subtitle}</p>
              <p className="text-gray-700 leading-relaxed">{selectedSystem?.description}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedSystem?.metadata.type}</div>
                <div className="text-sm text-gray-500 mt-1">Type</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600">{selectedSystem?.metadata.model}</div>
                <div className="text-sm text-gray-500 mt-1">Model</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-purple-600">{selectedSystem?.metadata.connections}</div>
                )}
                <div className="text-sm text-gray-500 mt-1">Connections</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center relative">
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-orange-600">{selectedSystem?.metadata.toolCount}</div>
                )}
                <div className="text-sm text-gray-500 mt-1">Tools</div>
              </div>
            </div>

            {/* System Status — placeholder until /api/systems/{name}/metrics is available */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <p className="text-sm text-gray-500 mb-4">Metrics will appear here when backend provides <code className="bg-gray-100 px-1 rounded">/api/systems/&#123;name&#125;/metrics</code>.</p>
              <div className="grid grid-cols-2 gap-6 text-sm text-gray-400">
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Health Status</span><span>—</span></div>
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Last Active</span><span>—</span></div>
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Uptime</span><span>—</span></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Response Time</span><span>—</span></div>
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Requests Today</span><span>—</span></div>
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-600">Success Rate</span><span>—</span></div>
                </div>
              </div>
            </div>

            {/* Recent Activity — placeholder until activity API is available */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-sm text-gray-500">Activity feed will appear here when backend provides an activity endpoint.</p>
            </div>
          </div>
        );
      case 'graph':
        return (
          <div className="flex flex-col h-full">
            {/* Sliding RAI Agent Container */}
            <SlidingRAIAgentContainer
              isOpen={isRAINetworkOpen}
              onClose={() => setIsRAINetworkOpen(false)}
              systemName={selectedSystem?.metadata.system}
              raiNetworkData={raiNetworkData}
              onDataFetched={setRaiNetworkData}
            />
            
            {/* Main Content */}
            <div className="flex-1 p-4 overflow-hidden">
              {selectedSystem ? (
                <div className="flex flex-col h-full gap-4">
                  {/* Toggle Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsRAINetworkOpen(!isRAINetworkOpen)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {isRAINetworkOpen ? 'Hide' : 'Show'} RAI Network
                    </button>
                  </div>
                  
                  {/* Graph and ChatBox */}
                  <div className="flex gap-4 flex-1 overflow-hidden">
                    {/* Graph on the left - 60% width */}
                    <div className="flex-[3] overflow-hidden">
                      <AgentFlowGraph 
                        systemName={selectedSystem.metadata.system}
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* ChatBox on the right - 40% width */}
                    <div className="flex-[2] overflow-hidden">
                      <ChatBox
                        systemName={`${selectedSystem.metadata.system} Assistant`}
                        onSendMessage={handleChatMessage}
                        placeholder={`Ask about ${selectedSystem.metadata.system}...`}
                        height="100%"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-gray-800">Graph View</h2>
                  <p className="text-gray-600 mt-2">Select a system to view its agent network</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'agents-tools':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Agents & Tools</h2>
              <p className="text-sm text-gray-600 mt-1">
                Detailed breakdown of agents and tools for {selectedSystem?.metadata.system}
              </p>
            </div>

            {loadingParsedConfig ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading agents and tools...</span>
              </div>
            ) : parsedConfigError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">Error loading agents and tools</span>
                </div>
                <p className="text-red-700 text-sm mt-2">{parsedConfigError}</p>
              </div>
            ) : parsedConfig?.parsed_content ? (
              <div className="space-y-6">
                {/* LLM Configuration */}
                {parsedConfig.parsed_content.llm_config && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">LLM Configuration</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Model</span>
                        <p className="text-base text-gray-900 mt-1 font-mono">{parsedConfig.parsed_content.llm_config.model_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Temperature</span>
                        <p className="text-base text-gray-900 mt-1">{parsedConfig.parsed_content.llm_config.temperature ?? 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Agents/Tools */}
                {parsedConfig.parsed_content.tools && parsedConfig.parsed_content.tools.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                          </svg>
                          <h3 className="text-lg font-semibold text-gray-900">Agents</h3>
                        </div>
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                          {parsedConfig.parsed_content.tools.length} {parsedConfig.parsed_content.tools.length === 1 ? 'Agent' : 'Agents'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {parsedConfig.parsed_content.tools.map((tool: { name?: string; function?: { description?: string; parameters?: { properties?: Record<string, unknown> } }; type?: string }, index: number) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-gray-900 mb-1">{tool.name || `Agent ${index + 1}`}</h4>
                              {tool.function?.description && (
                                <p className="text-sm text-gray-600 leading-relaxed">{tool.function.description}</p>
                              )}
                            </div>
                            {tool.type && (
                              <span className="ml-3 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                                {tool.type}
                              </span>
                            )}
                          </div>

                          {/* Function Parameters */}
                          {tool.function?.parameters?.properties && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Parameters</span>
                              <div className="mt-2 space-y-1.5">
                                {Object.entries(tool.function.parameters.properties).map(([key, value]: [string, any]) => (
                                  <div key={key} className="flex items-start gap-2 text-sm">
                                    <span className="font-mono text-purple-600 font-medium text-xs">{key}</span>
                                    <span className="text-gray-400">:</span>
                                    <span className="text-gray-700 text-xs">{value.type || 'any'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Limits */}
                {parsedConfig.parsed_content.execution_limits && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Execution Limits</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {parsedConfig.parsed_content.execution_limits.max_iterations && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Max Iterations</span>
                          <p className="text-base text-gray-900 mt-1 font-semibold">{parsedConfig.parsed_content.execution_limits.max_iterations}</p>
                        </div>
                      )}
                      {parsedConfig.parsed_content.execution_limits.timeout_seconds && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Timeout</span>
                          <p className="text-base text-gray-900 mt-1 font-semibold">{parsedConfig.parsed_content.execution_limits.timeout_seconds}s</p>
                        </div>
                      )}
                      {parsedConfig.parsed_content.execution_limits.max_tool_calls && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Max Tool Calls</span>
                          <p className="text-base text-gray-900 mt-1 font-semibold">{parsedConfig.parsed_content.execution_limits.max_tool_calls}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                </svg>
                <p>No agents or tools configuration available</p>
              </div>
            )}
          </div>
        );
      case 'raw-config':
        return (
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">HOCON Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">
                Raw configuration file for {selectedSystem?.metadata.system}
              </p>
            </div>

            {loadingHocon ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading configuration...</span>
              </div>
            ) : hoconError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800 font-medium">Error loading configuration</span>
                </div>
                <p className="text-red-700 text-sm mt-2">{hoconError}</p>
              </div>
            ) : hoconConfig ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <span className="text-gray-700 text-sm font-mono font-medium">
                    {selectedSystem?.metadata.system}.hocon
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(hoconConfig);
                    }}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-xs px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-6 overflow-x-auto max-h-[600px] overflow-y-auto">
                  <pre className="text-sm leading-relaxed">
                    <code className="text-gray-800 font-mono whitespace-pre">
                      {hoconConfig}
                    </code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No configuration available</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (currentView === 'detail' && selectedSystem) {
      return (
        <div className="flex flex-col h-full">
          {/* Compact Header with Back button and Tabs */}
          <div className="bg-white border-b border-gray-200">
            {/* Back button - larger */}
            <div className="px-4 py-2.5 border-b border-gray-100">
              <button
                onClick={handleBackToCards}
                className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Systems
              </button>
            </div>
            
            {/* Detail Header with Tabs - no extra padding */}
            <SlideOutDetailHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          {/* Tab Content - remove top padding */}
          <div className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      );
    }
    
    return (
      <SystemCards
        systems={accordionItems}
        loading={loading}
        error={error || undefined}
        onSystemSelect={handleSystemSelect}
        searchable={true}
      />
    );
  };

  return (
    <SlideOutContainer
      isOpen={isOpen}
      onClose={handleSlideOutClose}
      title={getTitle()}
      showOverlay={false}
      width="xl"
    >
      {renderContent()}
    </SlideOutContainer>
  );
};

export default SlideOutPage;
