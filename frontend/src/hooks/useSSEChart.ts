/**
 * 🎯 Event-Driven Chart Subscription Pattern
 * 
 * Reusable SSE hook for automatic chart updates.
 * Each chart subscribes to its specific event type from a single SSE endpoint.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSSEUrl } from '../config/api';

interface SSEChartHookOptions {
  eventType: string;
  onData?: (data: any) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

interface SSEChartState {
  data: any;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useSSEChart = (options: SSEChartHookOptions) => {
  const { eventType, onData, autoReconnect = true, reconnectDelay = 3000 } = options;
  
  const [state, setState] = useState<SSEChartState>({
    data: null,
    isConnected: false,
    error: null,
    lastUpdate: null
  });

  // Use ref to maintain stable reference to onData callback
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  const updateData = useCallback((newData: any) => {
    setState(prev => ({
      ...prev,
      data: newData,
      lastUpdate: new Date(),
      error: null
    }));
    onDataRef.current?.(newData);
  }, []); // Empty dependency array - stable reference

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return; // Don't connect if component is unmounted
      
      try {
        eventSource = new EventSource(getSSEUrl('/api/sse'));
        
        eventSource.onopen = () => {
          if (isCleanedUp) return;
          setState(prev => ({ ...prev, isConnected: true, error: null }));
          console.log(`🔗 SSE connected for ${eventType}`);
        };

        // Listen for the specific event type
        eventSource.addEventListener(eventType, (event) => {
          if (isCleanedUp) return;
          try {
            const data = JSON.parse(event.data);
            updateData(data);
          } catch (error) {
            console.error(`❌ Failed to parse SSE data for ${eventType}:`, error);
          }
        });

        // Also listen for pii_timeseries_data if this is a pii_category_data connection
        if (eventType === 'pii_category_data') {
          eventSource.addEventListener('pii_timeseries_data', (event) => {
            if (isCleanedUp) return;
            try {
              const data = JSON.parse(event.data);
              updateData(data);
            } catch (error) {
              console.error(`❌ Failed to parse SSE data for pii_timeseries_data:`, error);
            }
          });
        }

        eventSource.onerror = () => {
          if (isCleanedUp) return;
          setState(prev => ({ ...prev, isConnected: false, error: 'Connection lost' }));
          
          if (autoReconnect && !isCleanedUp) {
            reconnectTimeout = window.setTimeout(() => {
              if (!isCleanedUp) {
                console.log(`🔄 Reconnecting SSE for ${eventType}...`);
                connect();
              }
            }, reconnectDelay);
          }
        };

      } catch (error) {
        if (!isCleanedUp) {
          setState(prev => ({ ...prev, error: 'Failed to connect', isConnected: false }));
        }
      }
    };

    connect();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        console.log(`🔌 SSE disconnected for ${eventType}`);
      }
    };
  }, [eventType, autoReconnect, reconnectDelay]); // Removed updateData from dependencies

  return state;
};
