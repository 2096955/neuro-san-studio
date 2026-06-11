import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  ReactFlowProvider,
  MarkerType,
  type NodeProps,
  Handle,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import { User, Sparkles } from 'lucide-react';
import 'reactflow/dist/style.css';

import { API_BASE_URL } from '../config/api';
import { neuroSanClient, sessionManager } from '../api/neuroSanClient';

// Friendlier labels for headline demo networks; everything else is title-cased.
const NETWORK_LABELS: Record<string, string> = {
  rhea_clinical_decision_support: 'RHEA · Clinical Decision Support',
};

// Per-network starter prompt shown in the empty chat state.
const NETWORK_HINTS: Record<string, string> = {
  rhea_clinical_decision_support:
    '“My patient just had an MI and has type 2 diabetes and CKD stage 3 — walk me through how you would select an SGLT2 inhibitor strategy.”',
};

interface TopologyNode {
  id: string;
  label: string;
  type?: 'frontman' | 'specialist' | 'user';
  description?: string;
}

interface TopologyConnection {
  from: string;
  to: string;
  type: string;
}

interface Topology {
  nodes: TopologyNode[];
  connections: TopologyConnection[];
}

interface Network {
  name: string;
  display_name: string;
}

// Custom Circular Node Component
const CircularNode: React.FC<NodeProps> = ({ data }) => {
  const isUserNode = data.type === 'frontman' || data.type === 'user';
  const Icon = isUserNode ? User : Sparkles;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-white opacity-0"
      />

      <div className="flex flex-col items-center">
        <div
          className={`
            w-24 h-24 rounded-full flex items-center justify-center shadow-sm
            ${isUserNode ? 'bg-blue-800 border-4 border-blue-700' : 'bg-blue-100 border-4 border-blue-200'}
          `}
        >
          <Icon className={`w-8 h-8 ${isUserNode ? 'text-white' : 'text-blue-600'}`} />
        </div>
        <div className="mt-2 text-sm text-center font-medium text-gray-800 max-w-[160px] break-words leading-tight">
          {data.label}
        </div>
      </div>
    </>
  );
};

const nodeTypes = {
  circular: CircularNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 150,
    nodesep: 100,
    edgesep: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 120, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 60,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

// Self-contained chat panel (plain Tailwind, matches the accelerator look).
// Talks to the selected network's front-man via /api/chat (real in-process run).
const NetworkChat: React.FC<{
  network: string;
  displayName: string;
  agentCount: number;
  connectionCount: number;
}> = ({ network, displayName, agentCount, connectionCount }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Reset the transcript whenever the selected network changes.
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [network]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const sessionId = sessionManager.getSessionId(network);
      const res = await neuroSanClient.sendMessage(network, text, sessionId);
      setMessages((m) => [...m, { role: 'assistant', content: res.response || '(no response)' }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'error', content: err instanceof Error ? err.message : 'Request failed' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, network]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
        <p className="text-sm text-gray-500 mt-0.5 break-words">{displayName}</p>
        <p className="text-xs text-gray-400 mt-1">
          {agentCount} agents · {connectionCount} connections
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && !loading && (
          <div className="text-sm text-gray-400 text-center mt-8 px-2 leading-relaxed">
            Ask the coordinator about a treatment decision.
            {NETWORK_HINTS[network] && (
              <div className="mt-3 text-gray-500 italic">{NETWORK_HINTS[network]}</div>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : m.role === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-500 shadow-sm flex items-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-600" />
              Thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask the coordinator…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const MultiAgentAcceleratorInner: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [networksLoading, setNetworksLoading] = useState(true);
  const [networksError, setNetworksError] = useState<string | null>(null);
  const [topologyLoading, setTopologyLoading] = useState(false);
  const [topologyError, setTopologyError] = useState<string | null>(null);

  const applyTopology = useCallback((topology: Topology) => {
    // Find frontman: first node or node with no incoming connections
    const targetIds = new Set(topology.connections.map((c) => c.to));
    const frontmanId = topology.nodes.find((n) => !targetIds.has(n.id))?.id ?? topology.nodes[0]?.id;

    const flowNodes: Node[] = topology.nodes.map((node) => {
      // Infer type: frontman (entry), or specialist (default)
      const isFrontman = node.type === 'frontman' || node.type === 'user' || node.id === frontmanId;
      return {
        id: node.id,
        type: 'circular',
        data: {
          label: node.label,
          icon: isFrontman ? User : Sparkles,
          type: isFrontman ? 'frontman' : 'specialist',
        },
        position: { x: 0, y: 0 },
      };
    });

    const flowEdges: Edge[] = topology.connections.map((conn, index) => ({
      id: `edge-${conn.from}-${conn.to}-${index}`,
      source: conn.from,
      target: conn.to,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: '#93c5fd',
        strokeWidth: 2.5,
        opacity: 1,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#93c5fd',
        width: 22,
        height: 22,
      },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges, 'TB');
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [setNodes, setEdges]);

  // Fetch networks list
  const fetchNetworks = useCallback(async () => {
    setNetworksLoading(true);
    setNetworksError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/networks`);
      if (!response.ok) throw new Error('Failed to fetch networks');
      const data = await response.json();
      // Backend may return strings or objects; normalize to Network[]
      const rawNetworks = data.networks ?? [];
      const toLabel = (name: string) =>
        NETWORK_LABELS[name] ?? name.replace(/_/g, ' ').replace(/\//g, ' / ');
      const normalized: Network[] = rawNetworks.map((n: string | Network) =>
        typeof n === 'string' ? { name: n, display_name: toLabel(n) } : n
      );
      // Surface the headline RHEA network first.
      normalized.sort((a, b) =>
        a.name === 'rhea_clinical_decision_support' ? -1 : b.name === 'rhea_clinical_decision_support' ? 1 : 0
      );
      setNetworks(normalized);
      // Auto-select RHEA so the demo lands on the clinical decision-support graph.
      const rhea = normalized.find((n) => n.name === 'rhea_clinical_decision_support');
      if (rhea) {
        setSelectedNetwork((prev) => prev ?? rhea.name);
      }
    } catch (err) {
      console.error('Error fetching networks:', err);
      setNetworksError(err instanceof Error ? err.message : 'Failed to load networks');
      setNetworks([]);
    } finally {
      setNetworksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  // Fetch topology when network is selected (AbortController to avoid race on fast switch)
  useEffect(() => {
    if (!selectedNetwork) {
      setTopologyError(null);
      return undefined;
    }

    const controller = new AbortController();
    const { signal } = controller;
    setTopologyLoading(true);
    setTopologyError(null);

    const fetchTopology = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/topology?network=${selectedNetwork}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch topology');
        const data = await response.json();

        if (signal.aborted) return;
        if (data.status !== 'success' || !data.topology) throw new Error('Invalid topology data');

        applyTopology(data.topology as Topology);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!signal.aborted) {
          console.error('Error fetching topology:', err);
          setTopologyError(err instanceof Error ? err.message : 'Failed to load topology');
        }
      } finally {
        if (!signal.aborted) setTopologyLoading(false);
      }
    };

    fetchTopology();
    return () => controller.abort();
  }, [selectedNetwork, applyTopology]);

  return (
    <>
      <style>{`
        .react-flow__edge-path {
          stroke: #93c5fd !important;
          stroke-width: 2.5px !important;
          opacity: 1 !important;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #60a5fa !important;
          stroke-width: 3px !important;
        }
      `}</style>
      <div className="h-screen w-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <nav className="text-sm text-gray-600">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Multi-Agent Accelerator</span>
          </nav>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Networks</h2>
              <p className="text-sm text-gray-500 mt-1">Select a network to visualize</p>
            </div>
            {networksError && (
              <div className="p-4 space-y-2">
                <p className="text-sm text-red-600">{networksError}</p>
                <button
                  type="button"
                  onClick={fetchNetworks}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              </div>
            )}
            {networksLoading && !networksError && (
              <div className="p-4 text-sm text-gray-500">Loading networks...</div>
            )}
            <div className="p-2">
              {networks.map((network) => (
                <button
                  key={network.name}
                  type="button"
                  onClick={() => setSelectedNetwork(network.name)}
                  className={`
                    w-full text-left px-4 py-3 mb-2 rounded-lg transition-colors
                    ${selectedNetwork === network.name
                      ? 'bg-blue-50 border-2 border-blue-500 text-blue-900'
                      : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="font-medium text-sm max-w-[200px] break-words">
                    {network.display_name || network.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative" data-testid="topology-graph">
            {topologyLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  <p className="mt-4 text-gray-600">Loading topology...</p>
                </div>
              </div>
            )}
            {topologyError && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg max-w-md">
                <span>{topologyError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTopologyError(null);
                    if (selectedNetwork) {
                      setTopologyLoading(true);
                      fetch(`${API_BASE_URL}/api/topology?network=${selectedNetwork}`)
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.status === 'success' && data.topology) {
                            applyTopology(data.topology as Topology);
                            setTopologyError(null);
                          } else {
                            setTopologyError('Invalid topology data');
                          }
                        })
                        .catch((err) => setTopologyError(err instanceof Error ? err.message : 'Failed to load topology'))
                        .finally(() => setTopologyLoading(false));
                    }
                  }}
                  className="text-sm font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: '#93c5fd', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#93c5fd', width: 22, height: 22 },
              }}
              fitView
              attributionPosition="bottom-left"
              minZoom={0.1}
              maxZoom={2}
            >
              <Background color="#e5e7eb" gap={16} />
              <Controls />
            </ReactFlow>
          </div>

          <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {selectedNetwork ? (
              <NetworkChat
                network={selectedNetwork}
                displayName={
                  networks.find((n) => n.name === selectedNetwork)?.display_name || selectedNetwork
                }
                agentCount={nodes.length}
                connectionCount={edges.length}
              />
            ) : (
              <div className="p-6 text-sm text-gray-500">
                Select a network to view its graph and chat.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MultiAgentAcceleratorClean: React.FC = () => {
  return (
    <ReactFlowProvider>
      <MultiAgentAcceleratorInner />
    </ReactFlowProvider>
  );
};

export default MultiAgentAcceleratorClean;
