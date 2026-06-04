import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, Tooltip, Switch, FormControlLabel } from '@mui/material';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Sigma } from 'sigma';
import Graph from 'graphology';
import { API_BASE_URL } from '../../config/api';
import { hoconToSigmaConverter, type SigmaGraphData } from '../../utils/hoconToSigma';

export interface AgentGraphProps {
  systemName: string;
  className?: string;
}

interface HoconApiResponse {
  filename: string;
  content: string;
  parsed_content: any;
  path: string;
}

const DEG2RAD = Math.PI / 180;

const AgentGraph: React.FC<AgentGraphProps> = ({ systemName, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<SigmaGraphData | null>(null);

  // UI toggles
  const [showLabels, setShowLabels] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);

  // Fetch HOCON data from API
  const fetchHoconData = async (filename: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/systems/hocon/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch HOCON file: ${response.statusText}`);
    const data: HoconApiResponse = await response.json();
    if (data.parsed_content) return data.parsed_content;
    throw new Error('HOCON file could not be parsed by the server');
  };

  // ---------- Layout helpers ----------

  const fitToView = (pad = 100) => {
    const sigma = sigmaRef.current;
    const graph = graphRef.current;
    if (!sigma || !graph || graph.order === 0) return;

    // Compute bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    graph.forEachNode((_, attrs) => {
      minX = Math.min(minX, attrs.x);
      minY = Math.min(minY, attrs.y);
      maxX = Math.max(maxX, attrs.x);
      maxY = Math.max(maxY, attrs.y);
    });

    const width = (containerRef.current?.clientWidth ?? 800) - pad;
    const height = (containerRef.current?.clientHeight ?? 500) - pad;
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const ratio = Math.max(dx / width, dy / height);

    const camera = sigma.getCamera();
    camera.animate(
      { x: (minX + maxX) / 2, y: (minY + maxY) / 2, ratio },
      { duration: 300 }
    );
  };

  const ensureArrowEdgeType = () => 'arrow';

  const colorForNode = (meta: any): string => {
    if (meta?.isEntry || meta?.is_frontman) return '#ff6b35';       // entry/frontman
    if (meta?.type === 'coded_tool' || meta?.class) return '#7e57c2'; // coded tool
    return '#2563eb';                                                 // agent (theme primary)
  };

  const colorForEdge = (label?: string) => {
    if (label && /parent|child/i.test(label)) return '#ea4335';
    return '#34a853';
  };

  // ---- NEW: deterministic hierarchical (left→right) layout ----
  type HierLayoutOpts = {
    roots?: string[];
    hSpacing?: number;
    vSpacing?: number;
    center?: { x: number; y: number };
  };

  const hierarchicalLayout = (graph: Graph, opts: HierLayoutOpts = {}) => {
    const h = opts.hSpacing ?? 240;   // horiz distance between columns
    const v = opts.vSpacing ?? 110;   // vertical distance between nodes in a column
    const cx = opts.center?.x ?? 0;
    const cy = opts.center?.y ?? 0;

    if (graph.order === 0) return;

    // pick roots (prefer frontman/entry, then nodes with in-degree 0)
    let roots = opts.roots && opts.roots.length ? [...opts.roots] : [];
    const entry = graph.nodes().find((n) => !!graph.getNodeAttribute(n, 'isEntry') || !!graph.getNodeAttribute(n, 'is_frontman'));
    if (entry && !roots.includes(entry)) roots = [entry, ...roots];
    if (!roots.length) {
      const inDeg0: string[] = [];
      graph.forEachNode((n) => { if (graph.inDegree(n) === 0) inDeg0.push(n); });
      if (inDeg0.length) roots = inDeg0;
    }
    if (!roots.length) roots = [graph.nodes()[0]];

    // BFS levels from all roots
    const level = new Map<string, number>();
    const q: string[] = [];
    roots.forEach((r) => { level.set(r, 0); q.push(r); });

    while (q.length) {
      const n = q.shift()!;
      const l = level.get(n)!;
      graph.outboundNeighbors(n).forEach((m) => {
        const ml = level.get(m);
        const candidate = l + 1;
        if (ml == null || candidate > ml) {
          level.set(m, candidate);
          q.push(m);
        }
      });
    }

    // handle disconnected nodes: place after deepest level
    let maxLevel = 0;
    level.forEach((l) => (maxLevel = Math.max(maxLevel, l)));
    graph.nodes().forEach((n) => {
      if (!level.has(n)) {
        maxLevel += 1;
        level.set(n, maxLevel);
      }
    });

    // group by level & stable sort by label
    const buckets: Record<number, string[]> = {};
    level.forEach((l, n) => {
      if (!buckets[l]) buckets[l] = [];
      buckets[l].push(n);
    });
    Object.values(buckets).forEach((arr) => {
      arr.sort((a, b) => {
        const la = (graph.getNodeAttribute(a, 'label') || '').toString();
        const lb = (graph.getNodeAttribute(b, 'label') || '').toString();
        return la.localeCompare(lb);
      });
    });

    // assign coordinates
    const levels = Object.keys(buckets).map(Number).sort((a, b) => a - b);
    levels.forEach((L, idx) => {
      const column = buckets[L];
      const x = cx + idx * h;
      const totalHeight = (column.length - 1) * v;
      const yStart = cy - totalHeight / 2;
      column.forEach((n, i) => {
        graph.setNodeAttribute(n, 'x', x);
        graph.setNodeAttribute(n, 'y', yStart + i * v);
      });
    });
  };

  // ---------- Graph init ----------

  const initializeSigma = async (data: SigmaGraphData) => {
    if (!containerRef.current) return;

    // Kill existing
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    if (graphRef.current) {
      graphRef.current.clear();
      graphRef.current = null;
    }

    const graph = new Graph({ type: 'directed', multi: true, allowSelfLoops: true });

    // Nodes
    data.nodes.forEach((n) => {
      const meta = n.metadata || {};
      const color = n.color || colorForNode(meta);
      const isEntry = meta?.isEntry || meta?.is_frontman;
      const size = isEntry ? (n.size ?? 14) : (n.size ?? 10);

      graph.addNode(n.key, {
        label: n.label,
        size,
        color,
        ...meta, // keep metadata accessible
        x: typeof n.x === 'number' ? n.x : Math.random() * 10,
        y: typeof n.y === 'number' ? n.y : Math.random() * 10,
      });
    });

    // Edges
    const preferredEdgeType = ensureArrowEdgeType();
    data.edges.forEach((e, i) => {
      const src = e.source;
      const tgt = e.target;
      if (!graph.hasNode(src) || !graph.hasNode(tgt)) return;

      const key = `${src}->${tgt}:${i}`;
      if (graph.hasEdge(key)) return;

      graph.addEdgeWithKey(key, src, tgt, {
        size: e.size ?? 2,
        color: e.color || colorForEdge(e.label),
        type: preferredEdgeType,
        label: showEdgeLabels ? e.label || '' : '',
      });
    });

    // Store & layout
    graphRef.current = graph;
    hierarchicalLayout(graph); // <<< structured by default

    // Sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: showLabels,
      renderEdgeLabels: showEdgeLabels,
      defaultNodeColor: '#2563eb',
      defaultEdgeColor: '#34a853',
      labelFont: 'Outfit, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
      labelSize: 12,
      labelWeight: '500',
      labelColor: { color: '#1f2937' },
      allowInvalidContainer: true,
      enableEdgeEvents: false,
      zIndex: true,
    });

    // Interactions: drag & hover highlight
    let isDragging = false;
    let draggedNode: string | null = null;

    sigma.on('downNode', (event) => {
      isDragging = true;
      draggedNode = event.node;
      graph.setNodeAttribute(event.node, 'highlighted', true);
    });

    sigma.getMouseCaptor().on('mousemove', (event) => {
      if (!isDragging || !draggedNode) return;
      const pos = sigma.viewportToGraph(event);
      graph.setNodeAttribute(draggedNode, 'x', pos.x);
      graph.setNodeAttribute(draggedNode, 'y', pos.y);
      event.preventSigmaDefault();
      event.original.preventDefault();
      event.original.stopPropagation();
    });

    sigma.getMouseCaptor().on('mouseup', () => {
      if (draggedNode) graph.removeNodeAttribute(draggedNode, 'highlighted');
      isDragging = false;
      draggedNode = null;
    });

    sigma.on('enterNode', (event) => {
      if (isDragging) return;
      graph.setNodeAttribute(event.node, 'highlighted', true);
      sigma.refresh();
    });

    sigma.on('leaveNode', (event) => {
      if (isDragging) return;
      graph.removeNodeAttribute(event.node, 'highlighted');
      sigma.refresh();
    });

    sigma.on('doubleClickStage', () => {
      fitToView();
    });

    sigmaRef.current = sigma;

    // First fit
    sigma.refresh();
    fitToView();
  };

  // Load & process HOCON
  useEffect(() => {
    const load = async () => {
      if (!systemName) return;

      setLoading(true);
      setError(null);
      try {
        const parsedConfig = await fetchHoconData(systemName);
        const converted = hoconToSigmaConverter.convertParsedConfigToGraph(parsedConfig);

        if (!converted?.nodes?.length) {
          throw new Error('No agent network data found in HOCON file');
        }

        setGraphData(converted);
        await initializeSigma(converted);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || 'Failed to load graph data');
        setLoading(false);
      }
    };

    load();

    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
      if (graphRef.current) {
        graphRef.current.clear();
        graphRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemName]);

  // Respond to label toggles without full rebuild
  useEffect(() => {
    const sigma = sigmaRef.current;
    if (!sigma) return;

    sigma.setSettings({ renderLabels: showLabels, renderEdgeLabels: showEdgeLabels });
    const g = sigma.getGraph();
    g.forEachEdge((e, attrs) => {
      g.setEdgeAttribute(e, 'label', showEdgeLabels ? attrs.label || '' : '');
    });
    sigma.refresh();
  }, [showLabels, showEdgeLabels]);

  // Resize handling (debounced)
  useEffect(() => {
    let t: number | null = null;
    const onResize = () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => {
        sigmaRef.current?.refresh();
        fitToView();
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Controls
  const handleRelayout = () => {
    const graph = graphRef.current;
    if (!graph) return;
    hierarchicalLayout(graph);      // run again in case graph changed
    sigmaRef.current?.refresh();
    fitToView();
  };

  if (loading) {
    return (
      <Box className={className} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
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
    <Box className={className} sx={{ border: '1px solid var(--color-border)', borderRadius: 1, overflow: 'hidden' }}>
      {/* Header / Stats */}
      {graphData && (
        <Box sx={{ p: 2, borderBottom: '1px solid var(--color-border)', bgcolor: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 3, fontSize: '0.875rem', color: '#555' }}>
            <span><strong>Agents:</strong> {graphData.nodes.length}</span>
            <span><strong>Connections:</strong> {graphData.edges.length}</span>
            <span><strong>System:</strong> {systemName}</span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={<Switch size="small" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />}
              label="Labels"
            />
            <FormControlLabel
              control={<Switch size="small" checked={showEdgeLabels} onChange={(e) => setShowEdgeLabels(e.target.checked)} />}
              label="Edge labels"
            />
            <Tooltip title="Fit to view">
              <IconButton size="small" onClick={() => fitToView()}>
                <CenterFocusStrongIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hierarchical layout">
              <IconButton size="small" onClick={handleRelayout}>
                <AutoFixHighIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Tips */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid var(--color-border)', bgcolor: 'var(--color-muted)', fontSize: '0.8rem', color: 'var(--color-muted-foreground)', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
          <strong>Controls:</strong>
        </Box>
        <span>Drag nodes to reposition</span>
        <span>Mouse wheel to zoom</span>
        <span>Double-click background to fit view</span>
      </Box>

      {/* Sigma container */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '560px',
          '& canvas': { outline: 'none' },
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      />

      {/* Legend */}
      <Box sx={{ p: 2, bgcolor: 'var(--color-muted)', borderTop: '1px solid var(--color-border)' }}>
        <Box sx={{ display: 'flex', gap: 3, fontSize: '0.75rem', color: '#666', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff6b35' }} />
            <span>Frontman / Entry Agent</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'var(--color-primary)' }} />
            <span>Agent</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#7e57c2' }} />
            <span>Coded Tool</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#34a853' }} />
            <span>Calls</span>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#ea4335' }} />
            <span>Parent / Child</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentGraph;