/**
 * Neuro-SAN Studio API Client
 *
 * Provides methods to interact with the Neuro-SAN Studio backend
 * for agent network visualization, chat, and sustainability/cost data.
 * Merged from ioblend-REPLIT neuroSanClient.js; uses Studio API (config/api.ts).
 */

import { API_BASE_URL } from '../config/api';

export interface TopologyNode {
  id: string;
  type?: string;
  label?: string;
  [key: string]: unknown;
}

export interface TopologyConnection {
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}

export interface Topology {
  nodes: TopologyNode[];
  connections: TopologyConnection[];
}

export interface SendMessageResponse {
  response: string;
  agent?: string;
  model?: string;
  session_id: string;
  [key: string]: unknown;
}

export interface NetworkItem {
  name: string;
  label: string;
  agent_count?: number;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Neuro-SAN API Client
 */
export const neuroSanClient = {
  /**
   * Get network topology (nodes and connections)
   */
  async getTopology(networkName: string): Promise<Topology> {
    const response = await fetch(
      `${API_BASE_URL}/api/topology?network=${encodeURIComponent(networkName)}`
    );
    const data = await response.json();

    if (data.status === 'success') {
      return data.topology as Topology;
    }
    throw new Error((data as { message?: string }).message ?? 'Failed to fetch topology');
  },

  /**
   * Send chat message to agent network
   */
  async sendMessage(
    networkName: string,
    message: string,
    sessionId: string | null = null,
    context: Record<string, unknown> = {}
  ): Promise<SendMessageResponse> {
    const activeSessionId = sessionId ?? generateSessionId();

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        network_name: networkName,
        message,
        session_id: activeSessionId,
        context,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return { ...(data.data as object), session_id: activeSessionId } as SendMessageResponse;
    }
    throw new Error((data as { message?: string }).message ?? 'Failed to send message');
  },

  /**
   * Get current agent activity
   */
  async getActivity(): Promise<Record<string, unknown>> {
    const response = await fetch(`${API_BASE_URL}/api/activity`);
    const data = await response.json();

    if (data.status === 'success') {
      return (data.activity ?? {}) as Record<string, unknown>;
    }
    throw new Error((data as { message?: string }).message ?? 'Failed to fetch activity');
  },

  /**
   * List available networks from backend
   */
  async listNetworks(): Promise<NetworkItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/networks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch networks: ${response.status}`);
    }
    const data = await response.json();

    if (data.status === 'success') {
      const raw = (data.networks ?? []) as string[];
      return raw.map((networkName) => {
        const label = networkName
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
        return {
          name: networkName,
          label,
          agent_count: 0,
        };
      });
    }
    throw new Error((data as { message?: string }).message ?? 'Failed to fetch networks');
  },
};

/**
 * Session management for chat continuity per network
 */
export const sessionManager = {
  getSessionId(networkName: string): string {
    const key = `neuro_san_session_${networkName}`;
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  },

  clearSession(networkName: string): void {
    localStorage.removeItem(`neuro_san_session_${networkName}`);
  },

  clearAllSessions(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('neuro_san_session_')) {
        localStorage.removeItem(key);
      }
    });
  },
};

/**
 * Map Neuro-SAN agent type to React Flow node type
 */
export function mapAgentTypeToNodeType(agentType: string): 'source' | 'transform' | 'sink' {
  switch (agentType) {
    case 'frontman':
      return 'source';
    case 'domain':
      return 'transform';
    case 'specialist':
      return 'sink';
    default:
      return 'source';
  }
}
