/**
 * useGuardrailsHistory Hook
 * 
 * Custom hook for managing historical guardrails data with async loading
 * Supports multiple parallel API calls for different charts
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  guardrailsHistoryService, 
  type PIILeakageHistoryResponse,
  type PIIMetricRecord,
  type BiasDetectionHistoryResponse,
  type BiasMetricRecord,
  type ToxicityDetectionHistoryResponse,
  type ToxicityMetricRecord
} from '../services/GuardrailsHistoryService';

interface UseGuardrailsHistoryOptions {
  timeFilter: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high';
  sessionId?: string;
  autoFetch?: boolean;
}

interface UseGuardrailsHistoryReturn {
  data: PIILeakageHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  aggregatedByCategory: Map<string, {
    detected: number;
    blocked: number;
    leaked: number;
    count: number;
  }> | null;
  timeSeriesData: Array<{
    timestamp: string;
    detected: number;
    blocked: number;
    leaked: number;
  }> | null;
}

/**
 * Hook for fetching and managing historical PII leakage data
 */
export const useGuardrailsHistory = (
  options: UseGuardrailsHistoryOptions
): UseGuardrailsHistoryReturn => {
  const { timeFilter, category, severity, sessionId, autoFetch = true } = options;

  const [data, setData] = useState<PIILeakageHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await guardrailsHistoryService.getPIILeakageByTimeFilter(
        timeFilter,
        { category, severity, session_id: sessionId }
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('❌ Error fetching guardrails history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, category, severity, sessionId]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  // Compute aggregated data by category
  const aggregatedByCategory = data 
    ? guardrailsHistoryService.aggregateByCategory(data.metrics)
    : null;

  // Compute time series data
  const timeSeriesData = data
    ? guardrailsHistoryService.transformToTimeSeries(data.metrics)
    : null;

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    aggregatedByCategory,
    timeSeriesData
  };
};

/**
 * Hook for fetching multiple categories in parallel
 */
export const useGuardrailsHistoryMultiCategory = (
  timeFilter: string,
  categories: string[]
) => {
  const [data, setData] = useState<Map<string, PIILeakageHistoryResponse>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await guardrailsHistoryService.getPIILeakageByCategories(
        timeFilter,
        categories
      );
      setData(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('❌ Error fetching multi-category data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, categories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchData();
    }
  }, [fetchData, categories.length]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook for fetching multiple severity levels in parallel
 */
export const useGuardrailsHistoryMultiSeverity = (
  timeFilter: string,
  severityLevels: Array<'low' | 'medium' | 'high'>
) => {
  const [data, setData] = useState<Map<string, PIILeakageHistoryResponse>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await guardrailsHistoryService.getPIILeakageBySeverity(
        timeFilter,
        severityLevels
      );
      setData(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('❌ Error fetching multi-severity data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, severityLevels]);

  useEffect(() => {
    if (severityLevels.length > 0) {
      fetchData();
    }
  }, [fetchData, severityLevels.length]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

// ============================================================================
// Bias Detection Hooks
// ============================================================================

interface UseBiasDetectionHistoryOptions {
  timeFilter: string;
  category?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  sessionId?: string;
  autoFetch?: boolean;
}

interface UseBiasDetectionHistoryReturn {
  data: BiasDetectionHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  aggregatedByCategory: Map<string, {
    bias_score: number;
    risk_level: 'low' | 'medium' | 'high';
    trend?: 'up' | 'down' | 'stable';
    count: number;
  }> | null;
}

/**
 * Hook for fetching and managing historical bias detection data
 */
export const useBiasDetectionHistory = (
  options: UseBiasDetectionHistoryOptions
): UseBiasDetectionHistoryReturn => {
  const { timeFilter, category, riskLevel, sessionId, autoFetch = true } = options;

  const [data, setData] = useState<BiasDetectionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await guardrailsHistoryService.getBiasDetectionByTimeFilter(
        timeFilter,
        { category, risk_level: riskLevel, session_id: sessionId }
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bias detection data';
      setError(errorMessage);
      console.error('❌ Error fetching bias detection history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, category, riskLevel, sessionId]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  // Compute aggregated data by category
  const aggregatedByCategory = data 
    ? guardrailsHistoryService.aggregateBiasByCategory(data.metrics)
    : null;

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    aggregatedByCategory
  };
};

// ============================================================================
// Toxicity Detection Hook
// ============================================================================

interface UseToxicityDetectionHistoryOptions {
  timeFilter: string;
  severity?: 'low' | 'medium' | 'high';
  sessionId?: string;
  autoFetch?: boolean;
}

interface UseToxicityDetectionHistoryReturn {
  data: ToxicityDetectionHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing historical toxicity detection data
 */
export const useToxicityDetectionHistory = (
  options: UseToxicityDetectionHistoryOptions
): UseToxicityDetectionHistoryReturn => {
  const { timeFilter, severity, sessionId, autoFetch = true } = options;

  const [data, setData] = useState<ToxicityDetectionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await guardrailsHistoryService.getToxicityDetectionByTimeFilter(
        timeFilter,
        { severity, session_id: sessionId }
      );
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch toxicity detection data';
      setError(errorMessage);
      console.error('❌ Error fetching toxicity detection history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, severity, sessionId]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};
