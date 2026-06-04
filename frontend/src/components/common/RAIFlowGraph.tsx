/**
 * RAI Flow Graph - Specialized graph for RAI Agentic Network
 * Displays circular nodes with icons for RAI agents
 */

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
  type NodeProps,
  Handle,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import { Box, CircularProgress, Alert } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PolicyIcon from '@mui/icons-material/Policy';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import 'reactflow/dist/style.css';
import { API_BASE_URL } from '../../config/api';

import { hoconToGraphConverter, type GraphData } from '../../utils/hoconToGraph';

// Custom Circular Node Component for RAI
const CircularRAINode: React.FC<NodeProps> = ({ data }) => {
  const isRoot = data.type === 'frontman';
  const nodeSize = isRoot ? 100 : 80;
  
  // Icon mapping for RAI node types
  const getIcon = () => {
    const name = data.label?.toLowerCase() || '';
    if (name.includes('trust') || name.includes('coordinator')) return <SecurityIcon sx={{ fontSize: 32 }} />;
    if (name.includes('compliance')) return <VerifiedUserIcon sx={{ fontSize: 28 }} />;
    if (name.includes('safety')) return <PolicyIcon sx={{ fontSize: 28 }} />;
    if (name.includes('security')) return <LockIcon sx={{ fontSize: 28 }} />;
    if (name.includes('privacy')) return <LockIcon sx={{ fontSize: 28 }} />;
    if (name.includes('explainability')) return <VisibilityIcon sx={{ fontSize: 28 }} />;
    if (name.includes('human') || name.includes('intervention')) return <SupervisorAccountIcon sx={{ fontSize: 28 }} />;
    return <SecurityIcon sx={{ fontSize: 28 }} />;
  };
  
  return (
    <>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#10b981', border: '2px solid #059669', opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#10b981', border: '2px solid #059669', opacity: 0 }}
      />
      
      <div
        style={{
          width: nodeSize,
          height: nodeSize,
          borderRadius: '50%',
          background: isRoot 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          border: isRoot ? '3px solid #059669' : '2px solid #7dd3fc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isRoot 
            ? '0 0 30px rgba(16, 185, 129, 0.6), 0 8px 16px rgba(0,0,0,0.2)'
            : '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          color: isRoot ? '#fff' : '#0c4a6e',
          position: 'relative',
        }}
        className="circular-rai-node"
      >
      {/* Glow effect for root node */}
      {isRoot && (
        <div
          style={{
            position: 'absolute',
            width: '120%',
            height: '120%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Icon */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {getIcon()}
      </div>
      
      {/* Label below the circle */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          marginTop: '8px',
          fontSize: '11px',
          fontWeight: isRoot ? '700' : '600',
          color: isRoot ? '#10b981' : '#475569',
          textAlign: 'center',
          width: '120px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {data.label}
      </div>
    </div>
    </>
  );
};

// Edge styles for RAI network - enhanced arrows
const raiEdgeStyle = { 
  stroke: '#10b981', 
  strokeWidth: 3,
  strokeDasharray: '0',
};
const raiMarkerEnd = {
  type: MarkerType.ArrowClosed,
  color: '#10b981',
  width: 25,
  height: 25,
};

export interface RAIFlowGraphProps {
  systemName: string;
  className?: string;
  layoutDirection?: 'LR' | 'TB';
}

// Dagre layout configuration
const nodeWidth = 120;
const nodeHeight = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  // Reduced spacing: nodesep (horizontal) and ranksep (vertical between levels)
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

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
      dragging: false,
    };
  });

  return { nodes: layoutedNodes, edges };
};

const RAIFlowGraphInner: React.FC<RAIFlowGraphProps> = ({ systemName, className = '', layoutDirection = 'LR' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => Object.freeze({ circular: CircularRAINode }), []);
  const edgeTypes = useMemo(() => Object.freeze({}), []);

  // Fetch HOCON data from API
  const fetchHoconData = async (filename: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/systems/hocon/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch HOCON data: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.parsed_content;
  };

  // Load graph data
  useEffect(() => {
    const loadGraph = async () => {
      try {
        setLoading(true);
        setError(null);

        const parsedConfig = await fetchHoconData(systemName);
        const converted = hoconToGraphConverter.convertParsedConfigToGraph(parsedConfig);

        if (!converted?.nodes?.length) {
          throw new Error('No agent network data found in HOCON file');
        }

        setGraphData(converted);

        // Convert to React Flow format with circular nodes
        const flowNodes: Node[] = converted.nodes.map((node) => ({
          id: node.id,
          type: 'circular',
          data: { 
            ...node.data,
            label: node.data.label,
            type: node.type
          },
          position: node.position,
        }));

        const flowEdges: Edge[] = converted.edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          animated: true,
          style: raiEdgeStyle,
          markerEnd: raiMarkerEnd,
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

        // Fit view with top alignment for vertical layout
        const padding = layoutDirection === 'TB' ? 0.05 : 0.2;
        window.requestAnimationFrame(() => {
          if (layoutDirection === 'TB') {
            fitView({ 
              padding, 
              duration: 300,
              nodes: layoutedNodes,
            });
            // Align to top
            setTimeout(() => {
              const viewport = document.querySelector('.react-flow__viewport');
              if (viewport) {
                const currentTransform = viewport.getAttribute('style');
                if (currentTransform) {
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

  if (loading) {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
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
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }
          
          .circular-rai-node:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2) !important;
          }
        `}
      </style>
      <Box
        className={className}
        sx={{
          height: '100%',
          width: '100%',
        }}
      >
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
    </>
  );
};

// Wrap with ReactFlowProvider
const RAIFlowGraph: React.FC<RAIFlowGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <RAIFlowGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default RAIFlowGraph;
