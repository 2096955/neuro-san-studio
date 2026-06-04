import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import { Box, CircularProgress, Alert, IconButton, Tooltip, Switch, FormControlLabel } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import 'reactflow/dist/style.css';

import { API_BASE_URL } from '../../config/api';
import { hoconToGraphConverter, type GraphData } from '../../utils/hoconToGraph';

// Define edge styles outside component to prevent recreation
const edgeStyle = { stroke: '#34a853', strokeWidth: 2 };
const markerEnd = {
  type: MarkerType.ArrowClosed,
  color: '#34a853',
};

export interface AgentFlowGraphProps {
  systemName: string;
  className?: string;
  layoutDirection?: 'LR' | 'TB'; // LR = Left-Right (horizontal), TB = Top-Bottom (vertical)
}

interface HoconApiResponse {
  filename: string;
  content: string;
  parsed_content: any;
  path: string;
}

// Node styles defined outside component to prevent recreation
const nodeStyles = {
  frontman: {
    background: '#ff6b35',
    color: '#fff',
    border: '2px solid #e55a2b',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  codedTool: {
    background: '#7e57c2',
    color: '#fff',
    border: '2px solid #6a4ba8',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  agent: {
    background: '#4285f4',
    color: '#fff',
    border: '2px solid #3367d6',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

// Node styling based on type
const getNodeStyle = (type: string) => {
  return nodeStyles[type as keyof typeof nodeStyles] || nodeStyles.agent;
};

// Dagre layout configuration
const nodeWidth = 200;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  // Create a fresh dagre graph every time to prevent accumulation
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 150 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
      // Prevent React Flow from recalculating positions on first render
      dragging: false,
    };
  });

  return { nodes: layoutedNodes, edges };
};

const AgentFlowGraphInner: React.FC<AgentFlowGraphProps> = ({ systemName, className = '', layoutDirection = 'LR' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  
  const { fitView } = useReactFlow();

  // Memoize and freeze nodeTypes/edgeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => Object.freeze({}), []);
  const edgeTypes = useMemo(() => Object.freeze({}), []);

  // Fetch HOCON data from API
  const fetchHoconData = async (filename: string): Promise<any> => {
    console.log(`Fetching HOCON data for: ${filename}`);
    const response = await fetch(`${API_BASE_URL}/api/systems/hocon/${filename}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`Failed to fetch HOCON file: ${response.statusText}`);
    }
    
    const data: HoconApiResponse = await response.json();
    console.log('Received HOCON data:', data);
    
    if (data.parsed_content) {
      return data.parsed_content;
    }
    
    throw new Error('HOCON file could not be parsed by the server');
  };

  // Apply Dagre layout
  const onLayout = useCallback(
    (direction: string = 'LR') => {
      if (nodes.length === 0) return;
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 300 });
      });
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  // Load HOCON data and initialize graph
  useEffect(() => {
    const loadGraph = async () => {
      if (!systemName) return;

      setLoading(true);
      setError(null);

      try {
        const parsedConfig = await fetchHoconData(systemName);
        const converted = hoconToGraphConverter.convertParsedConfigToGraph(parsedConfig);

        if (!converted?.nodes?.length) {
          throw new Error('No agent network data found in HOCON file');
        }

        setGraphData(converted);

        // Convert to React Flow format with styling
        const flowNodes: Node[] = converted.nodes.map((node) => ({
          id: node.id,
          type: 'default',
          data: { 
            ...node.data,
            label: showLabels ? node.data.label : ''
          },
          position: node.position,
          style: getNodeStyle(node.type),
        }));

        const flowEdges: Edge[] = converted.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: false,
          style: edgeStyle,
          markerEnd: markerEnd,
        }));

        // Apply layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges,
          layoutDirection
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);

        // Fit view after layout using requestAnimationFrame
        // Use minimal padding for vertical layout to reduce white space
        // For vertical layout, align to top instead of center
        const padding = layoutDirection === 'TB' ? 0.05 : 0.2;
        window.requestAnimationFrame(() => {
          if (layoutDirection === 'TB') {
            // For vertical layout, fit to top-left instead of center
            fitView({ 
              padding, 
              duration: 300,
              nodes: layoutedNodes,
            });
            // Manually adjust to align to top
            setTimeout(() => {
              const viewport = document.querySelector('.react-flow__viewport');
              if (viewport) {
                const currentTransform = viewport.getAttribute('style');
                if (currentTransform) {
                  // Extract current transform and adjust Y position to top
                  const match = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                  if (match) {
                    const x = match[1];
                    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
                    const scale = scaleMatch ? scaleMatch[1] : '1';
                    viewport.setAttribute('style', `transform: translate(${x}, 20px) scale(${scale})`);
                  }
                }
              }
            }, 350);
          } else {
            fitView({ padding, duration: 300 });
          }
        });

      } catch (err: any) {
        setError(err?.message || 'Failed to load graph data');
        setLoading(false);
      }
    };

    loadGraph();
  }, [systemName, fitView, setNodes, setEdges, layoutDirection]);

  // Update labels when toggle changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          label: showLabels ? (node.data.label || node.id) : '',
        },
      }))
    );
  }, [showLabels, setNodes]);

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const handleRelayout = () => {
    onLayout('LR');
  };

  if (loading) {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '600px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className} sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden',
        height: '700px',
      }}
    >
      {/* Header / Stats */}
      {graphData && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', gap: 3, fontSize: '0.875rem', color: '#555' }}>
            <span>
              <strong>Agents:</strong> {graphData.nodes.length}
            </span>
            <span>
              <strong>Connections:</strong> {graphData.edges.length}
            </span>
            <span>
              <strong>System:</strong> {systemName}
            </span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
              }
              label="Labels"
            />
            <Tooltip title="Fit to view">
              <IconButton size="small" onClick={handleFitView}>
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Re-apply layout">
              <IconButton size="small" onClick={handleRelayout}>
                <AutoFixHighIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* React Flow */}
      <Box sx={{ height: 'calc(100% - 80px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#e0e0e0" gap={16} />
          <Controls />
        </ReactFlow>
      </Box>
    </Box>
  );
};

// Wrap with ReactFlowProvider
const AgentFlowGraph: React.FC<AgentFlowGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <AgentFlowGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default AgentFlowGraph;
