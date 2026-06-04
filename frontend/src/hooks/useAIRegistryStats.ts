/**
 * useAIRegistryStats Hook
 * 
 * React hook for managing AI Registry statistics state
 */

import { useState, useEffect } from 'react';
import { aiRegistryStatsService, type RegistryStatistics, type AISystem, type Activity } from '../services/AIRegistryStatsService';

interface UseAIRegistryStatsReturn {
  // Statistics
  statistics: RegistryStatistics | null;
  
  // Systems
  systems: AISystem[];
  
  // Activity
  recentActivity: Activity[];
  
  // Loading states
  loading: boolean;
  statisticsLoading: boolean;
  systemsLoading: boolean;
  activityLoading: boolean;
  
  // Error states
  error: string | null;
  statisticsError: string | null;
  systemsError: string | null;
  activityError: string | null;
  
  // Actions
  refreshStatistics: () => Promise<void>;
  refreshSystems: (filters?: { status?: string; system_type?: string; risk_level?: string }) => Promise<void>;
  refreshActivity: (limit?: number) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useAIRegistryStats = (): UseAIRegistryStatsReturn => {
  // State
  const [statistics, setStatistics] = useState<RegistryStatistics | null>(null);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  
  // Loading states
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  
  // Error states
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [systemsError, setSystemsError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  
  // Computed loading state
  const loading = statisticsLoading || systemsLoading || activityLoading;
  
  // Computed error state
  const error = statisticsError || systemsError || activityError;
  
  /**
   * Fetch statistics
   */
  const refreshStatistics = async () => {
    setStatisticsLoading(true);
    setStatisticsError(null);
    
    try {
      console.log('🔄 Fetching statistics from API...');
      const data = await aiRegistryStatsService.getStatistics();
      console.log('✅ Statistics received:', data);
      setStatistics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setStatisticsError(errorMessage);
      console.error('❌ Error fetching statistics:', err);
    } finally {
      setStatisticsLoading(false);
    }
  };
  
  /**
   * Fetch systems
   */
  const refreshSystems = async (filters?: { status?: string; system_type?: string; risk_level?: string }) => {
    setSystemsLoading(true);
    setSystemsError(null);
    
    try {
      const data = await aiRegistryStatsService.getAllSystems(filters);
      setSystems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch systems';
      setSystemsError(errorMessage);
      console.error('Error fetching systems:', err);
    } finally {
      setSystemsLoading(false);
    }
  };
  
  /**
   * Fetch recent activity
   */
  const refreshActivity = async (limit: number = 10) => {
    setActivityLoading(true);
    setActivityError(null);
    
    try {
      const data = await aiRegistryStatsService.getRecentActivity(limit);
      setRecentActivity(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity';
      setActivityError(errorMessage);
      console.error('Error fetching activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };
  
  /**
   * Refresh all data
   */
  const refreshAll = async () => {
    await Promise.all([
      refreshStatistics(),
      refreshSystems(),
      refreshActivity()
    ]);
  };
  
  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, []);
  
  return {
    // Data
    statistics,
    systems,
    recentActivity,
    
    // Loading states
    loading,
    statisticsLoading,
    systemsLoading,
    activityLoading,
    
    // Error states
    error,
    statisticsError,
    systemsError,
    activityError,
    
    // Actions
    refreshStatistics,
    refreshSystems,
    refreshActivity,
    refreshAll
  };
};

export default useAIRegistryStats;
