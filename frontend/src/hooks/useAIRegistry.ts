import { useState, useEffect, useCallback, useMemo } from 'react';
import { aiRegistryService, type AIAgent, type AIAgentsResponse } from '../services/AIRegistryService';

interface UseAIRegistryReturn {
  // Data state
  agents: AIAgent[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAgents: () => Promise<void>;
  refreshAgents: () => Promise<void>;
  
  // Slide-out panel state
  isSlideOutOpen: boolean;
  selectedSystem: string | null;
  openSlideOut: () => void;
  closeSlideOut: () => void;
  selectSystem: (systemName: string) => void;
  
  // Accordion state
  expandedItems: Set<string>;
  searchQuery: string;
  filteredAgents: AIAgent[];
  toggleAccordionItem: (id: string) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useAIRegistry = (): UseAIRegistryReturn => {
  // Data state
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Slide-out panel state
  const [isSlideOutOpen, setIsSlideOutOpen] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  
  // Accordion state
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch agents from API
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: AIAgentsResponse = await aiRegistryService.getAllAgents();
      setAgents(response.agents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      console.error('Error fetching AI agents:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh agents (force reload)
  const refreshAgents = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  // Slide-out panel actions
  const openSlideOut = useCallback(() => {
    setIsSlideOutOpen(true);
  }, []);

  const closeSlideOut = useCallback(() => {
    setIsSlideOutOpen(false);
    setSelectedSystem(null);
  }, []);

  const selectSystem = useCallback((systemName: string) => {
    setSelectedSystem(systemName);
  }, []);

  // Accordion actions
  const toggleAccordionItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Filter agents based on search query (safe optional access for API response shape)
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) {
      return agents;
    }
    const query = searchQuery.toLowerCase();
    const safe = (s: string | undefined): string => (s ?? '').toLowerCase();
    const safeList = (arr: string[] | undefined): string[] => arr ?? [];
    return agents.filter(agent =>
      safe(agent.name ?? agent.agent_id).includes(query) ||
      safe(agent.description ?? agent.system_description).includes(query) ||
      safe(agent.id ?? agent.agent_id).includes(query) ||
      safe(agent.system ?? agent.system_name).includes(query) ||
      safe(agent.llm_model ?? agent.model_name).includes(query) ||
      safeList(agent.tools).some(tool => safe(tool).includes(query))
    );
  }, [agents, searchQuery]);

  // Initial fetch on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    // Data state
    agents,
    loading,
    error,
    
    // Actions
    fetchAgents,
    refreshAgents,
    
    // Slide-out panel state
    isSlideOutOpen,
    selectedSystem,
    openSlideOut,
    closeSlideOut,
    selectSystem,
    
    // Accordion state
    expandedItems,
    searchQuery,
    filteredAgents,
    toggleAccordionItem,
    setSearchQuery,
    clearSearch
  };
};
