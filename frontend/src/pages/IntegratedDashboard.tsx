/**
 * Integrated Dashboard: Neuro + Responsible AI
 *
 * Single view combining agent chat (real LLM via backend /api/chat) and RAI metrics.
 * All URLs and network names come from config/API; no hardcoded mocks.
 *
 * Design: Real-time monitoring dashboard (ui-ux-pro-max); accessible, parameterised.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '../contexts/PageContext';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import ChatBox from '../components/common/ChatBox';
import { neuroSanClient, sessionManager } from '../api/neuroSanClient';
import type { NetworkItem } from '../api/neuroSanClient';
import { chatService } from '../services/ChatService';
import { useGuardrailsHistory } from '../hooks/useGuardrailsHistory';
import { API_BASE_URL } from '../config/api';

/** Default time filter for RAI metrics when not provided by URL or env */
const DEFAULT_TIME_FILTER = '1h';

const TIME_FILTER_OPTIONS = [
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
] as const;

const IntegratedDashboard: React.FC = () => {
  const { updatePage } = usePage();
  const { updateBreadcrumbs } = useBreadcrumb();

  const [networks, setNetworks] = useState<NetworkItem[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>(DEFAULT_TIME_FILTER);

  // RAI metrics from real API (GuardrailsHistoryService)
  const {
    data: guardrailsData,
    isLoading: guardrailsLoading,
    error: guardrailsError,
    aggregatedByCategory,
  } = useGuardrailsHistory({ timeFilter, autoFetch: true });

  // Fetch networks from API (parameterised via config)
  useEffect(() => {
    let cancelled = false;
    setNetworkLoading(true);
    setNetworkError(null);
    neuroSanClient
      .listNetworks()
      .then((list) => {
        if (!cancelled) {
          setNetworks(list);
          if (list.length > 0 && !selectedNetwork) {
            setSelectedNetwork(list[0].name);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setNetworkError(err instanceof Error ? err.message : 'Failed to load networks');
        }
      })
      .finally(() => {
        if (!cancelled) setNetworkLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Set selected network when list loads and we have no selection yet
  useEffect(() => {
    if (networks.length > 0 && !selectedNetwork) {
      setSelectedNetwork(networks[0].name);
    }
  }, [networks, selectedNetwork]);

  // Trust score from API (optional endpoint)
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/trust/score`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.score === 'number') {
          setTrustScore(data.score);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Page context and breadcrumbs
  useEffect(() => {
    updatePage('Integrated Dashboard', 'Neuro + Responsible AI in one view');
    updateBreadcrumbs([
      { label: 'Integrated Dashboard', path: '/integrated-dashboard' },
    ]);
  }, [updatePage, updateBreadcrumbs]);

  const handleSendMessage = useCallback(
    async (message: string): Promise<string> => {
      const network = selectedNetwork || networks[0]?.name;
      if (!network) {
        throw new Error('Select a network to chat');
      }
      const sessionId = sessionManager.getSessionId(network);
      const response = await chatService.sendMessage({
        message,
        network_name: network,
        session_id: sessionId,
      });
      return response.response;
    },
    [selectedNetwork, networks]
  );

  const totalRecords = guardrailsData?.total_records ?? 0;
  const categoryCount = aggregatedByCategory ? aggregatedByCategory.size : 0;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-border bg-card px-4 py-3">
        <h1 className="text-xl font-semibold text-foreground">
          Integrated Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Neuro agent chat (real LLM) and Responsible AI metrics in one view
        </p>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Neuro – Network selector + Chat (real LLM) */}
        <section
          className="flex flex-col rounded-lg border border-border bg-card overflow-hidden"
          aria-label="Neuro agent chat"
        >
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center gap-3">
            <label htmlFor="integrated-network-select" className="text-sm font-medium text-foreground">
              Network
            </label>
            <select
              id="integrated-network-select"
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="min-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
              aria-label="Select agent network"
            >
              {networkLoading && (
                <option value="">Loading…</option>
              )}
              {networkError && (
                <option value="">Error: {networkError}</option>
              )}
              {!networkLoading && networks.length === 0 && !networkError && (
                <option value="">No networks</option>
              )}
              {networks.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.label || n.name}
                </option>
              ))}
            </select>
            {selectedNetwork && (
              <span className="text-xs text-muted-foreground">
                Chat uses real LLM (e.g. Gemini) via backend
              </span>
            )}
          </div>
          <div className="flex-1 min-h-[420px]">
            {selectedNetwork ? (
              <ChatBox
                systemName={`${networks.find((n) => n.name === selectedNetwork)?.label || selectedNetwork} Assistant`}
                onSendMessage={handleSendMessage}
                placeholder="Ask anything… (Responsible AI quick tests below)"
                height="100%"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground p-6 text-center">
                {networkLoading
                  ? 'Loading networks…'
                  : networkError
                    ? networkError
                    : 'Select a network to start chatting'}
              </div>
            )}
          </div>
        </section>

        {/* Right: RAI summary + link to full dashboard */}
        <section
          className="flex flex-col rounded-lg border border-border bg-card overflow-hidden"
          aria-label="Responsible AI metrics"
        >
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Responsible AI metrics
            </h2>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              aria-label="Time range for RAI metrics"
            >
              {TIME_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 flex-1 space-y-4">
            {trustScore != null && (
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Trust score
                </div>
                <div className="text-2xl font-semibold text-foreground mt-1">
                  {trustScore}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Guardrails history ({timeFilter})
              </div>
              {guardrailsLoading && (
                <p className="text-sm text-muted-foreground mt-1">Loading…</p>
              )}
              {guardrailsError && (
                <p className="text-sm text-destructive mt-1">{guardrailsError}</p>
              )}
              {!guardrailsLoading && !guardrailsError && (
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {totalRecords} records
                  {categoryCount > 0 && ` across ${categoryCount} categories`}
                </p>
              )}
            </div>
            <Link
              to="/rai?section=dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded cursor-pointer"
            >
              Open full RAI Dashboard
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IntegratedDashboard;
