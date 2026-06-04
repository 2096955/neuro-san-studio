/**
 * AI Registry Service - Frontend service for AI systems and agents
 * 
 * Provides access to AI agent data from the backend HOCON parser API.
 */

import { API_BASE_URL } from '../config/api';

// Type definitions for AI agent data
export interface AIAgent {
  agent_id: string;
  system_name: string;
  system_description: string;
  model_name: string;
  file_name: string;
  file_path: string;
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  description?: string;
  system?: string;
  filename?: string;
  type?: string;
  total_agents?: number;
  total_subagents?: number;
  connections?: number;
  llm_model?: string;
  tools?: string[];
}

export interface AIAgentsResponse {
  agents: AIAgent[];
  total_count: number;
}

class AIRegistryService {
  /**
   * Fetch all AI agents from all HOCON files
   */
  async getAllAgents(): Promise<AIAgentsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/systems/allSystem`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      const data: AIAgentsResponse = await response.json();
      
      // Map new API response to include legacy fields for backward compatibility
      const mappedData: AIAgentsResponse = {
        agents: data.agents.map(agent => ({
          ...agent,
          // Map new fields to legacy fields
          id: agent.agent_id,
          name: agent.agent_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: agent.system_description,
          system: agent.system_name,
          filename: agent.file_name,
          llm_model: agent.model_name,
          type: 'agent',
          connections: 0,
          total_agents: 0,
          tools: []
        })),
        total_count: data.total_count
      };
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      throw error;
    }
  }

  /**
   * Filter agents by system name
   */
  async getAgentsBySystem(systemName: string): Promise<AIAgent[]> {
    try {
      const data = await this.getAllAgents();
      return data.agents.filter(agent => agent.system === systemName);
    } catch (error) {
      console.error(`Error fetching agents for system ${systemName}:`, error);
      throw error;
    }
  }

  /**
   * Filter agents by LLM model
   */
  async getAgentsByModel(modelName: string): Promise<AIAgent[]> {
    try {
      const data = await this.getAllAgents();
      return data.agents.filter(agent => 
        (agent.llm_model || agent.model_name || '').toLowerCase().includes(modelName.toLowerCase())
      );
    } catch (error) {
      console.error(`Error fetching agents for model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Filter agents by filename
   */
  async getAgentsByFilename(filename: string): Promise<AIAgent[]> {
    try {
      const data = await this.getAllAgents();
      return data.agents.filter(agent => (agent.filename || agent.file_name) === filename);
    } catch (error) {
      console.error(`Error fetching agents for file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Search agents by name or description
   */
  async searchAgents(query: string): Promise<AIAgent[]> {
    try {
      const data = await this.getAllAgents();
      const lowerQuery = query.toLowerCase();
      
      return data.agents.filter(agent => 
        (agent.name || agent.agent_id || '').toLowerCase().includes(lowerQuery) ||
        (agent.description || agent.system_description || '').toLowerCase().includes(lowerQuery) ||
        (agent.id || agent.agent_id || '').toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error(`Error searching agents with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get agents with high connectivity (many connections)
   */
  async getHighConnectivityAgents(minConnections: number = 3): Promise<AIAgent[]> {
    try {
      const data = await this.getAllAgents();
      return data.agents.filter(agent => (agent.connections || 0) >= minConnections);
    } catch (error) {
      console.error(`Error fetching high connectivity agents:`, error);
      throw error;
    }
  }

  /**
   * Get unique systems from all agents
   */
  async getUniqueSystems(): Promise<string[]> {
    try {
      const data = await this.getAllAgents();
      const systems = new Set(data.agents.map(agent => agent.system || agent.system_name).filter(Boolean));
      return Array.from(systems).sort();
    } catch (error) {
      console.error('Error fetching unique systems:', error);
      throw error;
    }
  }

  /**
   * Get unique LLM models from all agents
   */
  async getUniqueLLMModels(): Promise<string[]> {
    try {
      const data = await this.getAllAgents();
      const models = new Set(data.agents.map(agent => agent.llm_model || agent.model_name).filter(Boolean));
      return Array.from(models).sort();
    } catch (error) {
      console.error('Error fetching unique LLM models:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific system by name
   */
  async getSystemDetails(systemName: string): Promise<{
    system: {
      name: string;
      agents: AIAgent[];
      total_agents: number;
    }
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/systems/system/${systemName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch system details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching system details for ${systemName}:`, error);
      throw error;
    }
  }

  /**
   * Get raw HOCON configuration for a system
   */
  async getSystemHoconConfig(systemName: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/systems/hocon/${systemName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch HOCON config: ${response.statusText}`);
      }
      
      // Parse JSON response to extract content field
      const data = await response.json();
      
      // Extract the content field which contains the actual HOCON
      if (data.content) {
        return data.content;
      }
      
      // Fallback if content field doesn't exist
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error(`Error fetching HOCON config for ${systemName}:`, error);
      throw error;
    }
  }

  /**
   * Get parsed HOCON content with agents and tools
   */
  async getSystemParsedConfig(fileName: string): Promise<{
    file_name: string;
    file_path: string;
    raw_content: string;
    parsed_content: any;
    error: string | null;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/systems/allSystem/${fileName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch parsed config: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching parsed config for ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics about the AI registry
   */
  async getRegistryStats(): Promise<{
    totalAgents: number;
    totalSystems: number;
    totalConnections: number;
    averageConnectionsPerAgent: number;
    modelDistribution: Record<string, number>;
    systemDistribution: Record<string, number>;
  }> {
    try {
      const data = await this.getAllAgents();
      
      const totalAgents = data.total_count;
      const totalSystems = new Set(data.agents.map(agent => agent.system || agent.system_name).filter(Boolean)).size;
      const totalConnections = data.agents.reduce((sum, agent) => sum + (agent.connections || 0), 0);
      const averageConnectionsPerAgent = totalAgents > 0 ? totalConnections / totalAgents : 0;
      
      // Model distribution
      const modelDistribution: Record<string, number> = {};
      data.agents.forEach(agent => {
        const model = agent.llm_model || agent.model_name;
        if (model) {
          modelDistribution[model] = (modelDistribution[model] || 0) + 1;
        }
      });
      
      // System distribution
      const systemDistribution: Record<string, number> = {};
      data.agents.forEach(agent => {
        const system = agent.system || agent.system_name;
        if (system) {
          systemDistribution[system] = (systemDistribution[system] || 0) + 1;
        }
      });
      
      return {
        totalAgents,
        totalSystems,
        totalConnections,
        averageConnectionsPerAgent: Math.round(averageConnectionsPerAgent * 100) / 100,
        modelDistribution,
        systemDistribution
      };
    } catch (error) {
      console.error('Error calculating registry stats:', error);
      throw error;
    }
  }

}

// Export singleton instance
export const aiRegistryService = new AIRegistryService();
export default aiRegistryService;
