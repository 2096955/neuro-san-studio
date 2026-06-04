/**
 * AI Registry Statistics Service
 * 
 * Service for fetching AI registry statistics and data from the backend API
 */

import { API_BASE_URL } from '../config/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AISystem {
  id: string;
  name: string;
  hocon_file_name: string | null;
  business_domain: string;
  organisational_role: string;
  region: string; // JSON string
  function: string; // JSON string
  industry: string; // JSON string
  system_type: string;
  autonomy_level: string;
  business_impact: string;
  external_dependencies: string; // JSON string
  data_access: string;
  risk_level: string;
  status: string;
  description: string;
  registration_date: string;
  last_updated: string;
  created_at: string;
}

export interface Activity {
  id: number;
  system_id: string;
  system_name: string;
  action: string;
  status: string;
  description: string | null;
  performed_by: string | null;
  timestamp: string;
}

export interface DepartmentStats {
  name: string;
  domain?: string;  // Registry domain
  count: number;
  percentage: number;
}

export interface RegistryStatistics {
  totalRegistries: number;
  activeRegistries: number;
  pendingApproval: number;
  multiAgentSystems: number;
  riskCategories: {
    high: number;
    medium: number;
    low: number;
    minimal: number;
  };
  systemTypes: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
  byDepartment: DepartmentStats[];
  recentActivity: Activity[];
}

// ============================================================================
// AI Registry Statistics Service
// ============================================================================

class AIRegistryStatsService {
  /**
   * Get comprehensive registry statistics
   */
  async getStatistics(): Promise<RegistryStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registry/statistics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }
      
      const data: RegistryStatistics = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching registry statistics:', error);
      throw error;
    }
  }

  /**
   * Get all AI systems with optional filters
   */
  async getAllSystems(filters?: {
    status?: string;
    system_type?: string;
    risk_level?: string;
  }): Promise<AISystem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.system_type) params.append('system_type', filters.system_type);
      if (filters?.risk_level) params.append('risk_level', filters.risk_level);
      
      const url = `${API_BASE_URL}/api/registry/systems${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch systems: ${response.statusText}`);
      }
      
      const data: AISystem[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching AI systems:', error);
      throw error;
    }
  }

  /**
   * Get a specific system by ID
   */
  async getSystemById(systemId: string): Promise<AISystem> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registry/systems/${systemId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch system: ${response.statusText}`);
      }
      
      const data: AISystem = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching system ${systemId}:`, error);
      throw error;
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registry/activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }
      
      const data: Activity[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }

  /**
   * Get activity for a specific system
   */
  async getSystemActivity(systemId: string, limit: number = 10): Promise<Activity[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/registry/systems/${systemId}/activity?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch system activity: ${response.statusText}`);
      }
      
      const data: Activity[] = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching activity for system ${systemId}:`, error);
      throw error;
    }
  }

  /**
   * Get all departments
   */
  async getDepartments(): Promise<{ id: number; name: string; description: string }[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/registry/departments`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiRegistryStatsService = new AIRegistryStatsService();
export default aiRegistryStatsService;
