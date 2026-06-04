/**
 * Guardrails History Service
 * 
 * Service for fetching historical PII leakage data from the backend API
 * Supports time-range filtering and async data loading for charts
 */

import axios from 'axios';
import { formatLocalTimestamp } from '../utils/dateUtils';

import { API_BASE_URL } from '../config/api';

export interface PIIMetricRecord {
  id: number;
  timestamp: string;
  category_name: string;
  detected: number;
  blocked: number;
  leaked: number;
  severity: 'low' | 'medium' | 'high';
  prevention_rate: number;
  session_id?: string;
}

export interface PIILeakageHistoryResponse {
  total_records: number;
  time_range: {
    start: string;
    end: string;
  };
  metrics: PIIMetricRecord[];
}

export interface TimeRangeFilter {
  start_time: string;
  end_time: string;
  category?: string;
  severity?: 'low' | 'medium' | 'high';
  session_id?: string;
}

export interface BiasMetricRecord {
  id: number;
  timestamp: string;
  category_name: string;
  bias_score: number;
  risk_level: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
  model_name?: string;
  session_id?: string;
}

export interface BiasDetectionHistoryResponse {
  total_records: number;
  time_range: {
    start: string;
    end: string;
  };
  metrics: BiasMetricRecord[];
}

export interface BiasTimeRangeFilter {
  start_time: string;
  end_time: string;
  category?: string;
  risk_level?: 'low' | 'medium' | 'high';
  session_id?: string;
}

export interface ToxicityMetricRecord {
  id: number;
  timestamp: string;
  detections: number;
  severity: 'low' | 'medium' | 'high';
  model_name?: string;
  session_id?: string;
}

export interface ToxicityDetectionHistoryResponse {
  total_records: number;
  time_range: {
    start: string;
    end: string;
  };
  metrics: ToxicityMetricRecord[];
}

export interface ToxicityTimeRangeFilter {
  start_time: string;
  end_time: string;
  severity?: 'low' | 'medium' | 'high';
  session_id?: string;
}

class GuardrailsHistoryService {
  /**
   * Calculate time range based on filter value (5m, 1h, 24h, 7d, 30d)
   */
  private calculateTimeRange(filterValue: string): { start: string; end: string } {
    const end = new Date();
    const start = new Date();

    switch (filterValue) {
      case '5m':
        start.setMinutes(end.getMinutes() - 5);
        break;
      case '15m':
        start.setMinutes(end.getMinutes() - 15);
        break;
      case '1h':
        start.setHours(end.getHours() - 1);
        break;
      case '6h':
        start.setHours(end.getHours() - 6);
        break;
      case '24h':
        start.setHours(end.getHours() - 24);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      default:
        start.setHours(end.getHours() - 1); // Default to 1 hour
    }

    return {
      start: this.formatTimestamp(start),
      end: this.formatTimestamp(end)
    };
  }

  /**
   * Format Date object to ISO timestamp format using browser's local timezone
   * Uses centralized utility to ensure consistency
   */
  private formatTimestamp(date: Date): string {
    return formatLocalTimestamp(date);
  }

  /**
   * Build query parameters for API request
   */
  private buildQueryParams(filters: TimeRangeFilter): string {
    const params = new URLSearchParams({
      start_time: filters.start_time,
      end_time: filters.end_time,
    });

    if (filters.category) {
      params.append('category', filters.category);
    }

    if (filters.severity) {
      params.append('severity', filters.severity);
    }

    if (filters.session_id) {
      params.append('session_id', filters.session_id);
    }

    return params.toString();
  }

  /**
   * Fetch PII leakage history data
   */
  async getPIILeakageHistory(filters: TimeRangeFilter): Promise<PIILeakageHistoryResponse> {
    try {
      const queryParams = this.buildQueryParams(filters);
      const url = `${API_BASE_URL}/api/history/pii-leakage?${queryParams}`;

      console.log('🔍 Fetching PII history:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch PII history: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ PII history data received:', data);

      return data;
    } catch (error) {
      console.error('❌ Error fetching PII history:', error);
      throw error;
    }
  }

  /**
   * Fetch PII leakage history by time filter (5m, 1h, 24h, etc.)
   */
  async getPIILeakageByTimeFilter(
    filterValue: string,
    additionalFilters?: Partial<Omit<TimeRangeFilter, 'start_time' | 'end_time'>>
  ): Promise<PIILeakageHistoryResponse> {
    const timeRange = this.calculateTimeRange(filterValue);

    return this.getPIILeakageHistory({
      start_time: timeRange.start,
      end_time: timeRange.end,
      ...additionalFilters
    });
  }

  /**
   * Fetch data for multiple categories in parallel (async)
   */
  async getPIILeakageByCategories(
    filterValue: string,
    categories: string[]
  ): Promise<Map<string, PIILeakageHistoryResponse>> {
    const results = new Map<string, PIILeakageHistoryResponse>();

    // Fetch all categories in parallel
    const promises = categories.map(async (category) => {
      try {
        const data = await this.getPIILeakageByTimeFilter(filterValue, { category });
        results.set(category, data);
      } catch (error) {
        console.error(`❌ Error fetching data for category ${category}:`, error);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Fetch data for multiple severity levels in parallel (async)
   */
  async getPIILeakageBySeverity(
    filterValue: string,
    severityLevels: Array<'low' | 'medium' | 'high'>
  ): Promise<Map<string, PIILeakageHistoryResponse>> {
    const results = new Map<string, PIILeakageHistoryResponse>();

    // Fetch all severity levels in parallel
    const promises = severityLevels.map(async (severity) => {
      try {
        const data = await this.getPIILeakageByTimeFilter(filterValue, { severity });
        results.set(severity, data);
      } catch (error) {
        console.error(`❌ Error fetching data for severity ${severity}:`, error);
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Aggregate metrics by category from raw records
   */
  aggregateByCategory(records: PIIMetricRecord[]): Map<string, {
    detected: number;
    blocked: number;
    leaked: number;
    count: number;
  }> {
    const aggregated = new Map();

    records.forEach(record => {
      const existing = aggregated.get(record.category_name) || {
        detected: 0,
        blocked: 0,
        leaked: 0,
        count: 0
      };

      aggregated.set(record.category_name, {
        detected: existing.detected + record.detected,
        blocked: existing.blocked + record.blocked,
        leaked: existing.leaked + record.leaked,
        count: existing.count + 1
      });
    });

    return aggregated;
  }

  /**
   * Transform records to time series format for charts
   */
  transformToTimeSeries(records: PIIMetricRecord[]): Array<{
    timestamp: string;
    detected: number;
    blocked: number;
    leaked: number;
  }> {
    return records.map(record => ({
      timestamp: record.timestamp,
      detected: record.detected,
      blocked: record.blocked,
      leaked: record.leaked
    }));
  }

  // ============================================================================
  // Bias Detection Methods
  // ============================================================================

  /**
   * Build query parameters for bias detection API request
   */
  private buildBiasQueryParams(filters: BiasTimeRangeFilter): string {
    const params = new URLSearchParams({
      start_time: filters.start_time,
      end_time: filters.end_time,
    });

    if (filters.category) {
      params.append('category', filters.category);
    }

    if (filters.risk_level) {
      params.append('risk_level', filters.risk_level);
    }

    if (filters.session_id) {
      params.append('session_id', filters.session_id);
    }

    return params.toString();
  }

  /**
   * Fetch bias detection history data
   */
  async getBiasDetectionHistory(filters: BiasTimeRangeFilter): Promise<BiasDetectionHistoryResponse> {
    try {
      const queryParams = this.buildBiasQueryParams(filters);
      const url = `${API_BASE_URL}/api/history/bias-detection?${queryParams}`;

      console.log('🔍 Fetching bias detection history:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch bias detection history: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Bias detection history data received:', data);

      return data;
    } catch (error) {
      console.error('❌ Error fetching bias detection history:', error);
      throw error;
    }
  }

  /**
   * Fetch bias detection history by time filter (5m, 1h, 24h, etc.)
   */
  async getBiasDetectionByTimeFilter(
    filterValue: string,
    additionalFilters?: Partial<Omit<BiasTimeRangeFilter, 'start_time' | 'end_time'>>
  ): Promise<BiasDetectionHistoryResponse> {
    const timeRange = this.calculateTimeRange(filterValue);

    return this.getBiasDetectionHistory({
      start_time: timeRange.start,
      end_time: timeRange.end,
      ...additionalFilters
    });
  }

  /**
   * Aggregate bias metrics by category from raw records
   */
  aggregateBiasByCategory(records: BiasMetricRecord[]): Map<string, {
    bias_score: number;
    risk_level: 'low' | 'medium' | 'high';
    trend?: 'up' | 'down' | 'stable';
    count: number;
  }> {
    const aggregated = new Map();

    records.forEach(record => {
      const existing = aggregated.get(record.category_name);
      
      if (!existing) {
        // First record for this category
        aggregated.set(record.category_name, {
          bias_score: record.bias_score,
          risk_level: record.risk_level,
          trend: record.trend,
          count: 1
        });
      } else {
        // Average the bias scores
        const newCount = existing.count + 1;
        aggregated.set(record.category_name, {
          bias_score: (existing.bias_score * existing.count + record.bias_score) / newCount,
          risk_level: record.risk_level, // Use latest
          trend: record.trend, // Use latest
          count: newCount
        });
      }
    });

    return aggregated;
  }

  // ============================================================================
  // Toxicity Detection Methods
  // ============================================================================

  /**
   * Build query parameters for toxicity detection API request
   */
  private buildToxicityQueryParams(filters: ToxicityTimeRangeFilter): string {
    const params = new URLSearchParams({
      start_time: filters.start_time,
      end_time: filters.end_time,
    });

    if (filters.severity) {
      params.append('severity', filters.severity);
    }

    if (filters.session_id) {
      params.append('session_id', filters.session_id);
    }

    return params.toString();
  }

  /**
   * Fetch toxicity detection history data
   */
  async getToxicityDetectionHistory(filters: ToxicityTimeRangeFilter): Promise<ToxicityDetectionHistoryResponse> {
    try {
      const queryParams = this.buildToxicityQueryParams(filters);
      const url = `${API_BASE_URL}/api/history/toxicity-detection?${queryParams}`;

      console.log('🔍 Fetching toxicity detection history:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch toxicity detection history: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Toxicity detection history data received:', data);

      return data;
    } catch (error) {
      console.error('❌ Error fetching toxicity detection history:', error);
      throw error;
    }
  }

  /**
   * Fetch toxicity detection history by time filter (5m, 1h, 24h, etc.)
   */
  async getToxicityDetectionByTimeFilter(
    filterValue: string,
    additionalFilters?: Partial<Omit<ToxicityTimeRangeFilter, 'start_time' | 'end_time'>>
  ): Promise<ToxicityDetectionHistoryResponse> {
    const timeRange = this.calculateTimeRange(filterValue);

    return this.getToxicityDetectionHistory({
      start_time: timeRange.start,
      end_time: timeRange.end,
      ...additionalFilters
    });
  }
}

// Export singleton instance
export const guardrailsHistoryService = new GuardrailsHistoryService();
