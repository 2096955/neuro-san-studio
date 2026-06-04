/**
 * Convert HOCON parsed config to React Flow graph format
 */

export interface GraphNode {
  id: string;
  type: 'frontman' | 'agent' | 'codedTool';
  data: {
    label: string;
    description?: string;
    instructions?: string;
    tools?: string[];
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  label?: string;
  style?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

class HoconToGraphConverter {
  /**
   * Convert parsed HOCON config to React Flow graph format
   */
  convertParsedConfigToGraph(config: any): GraphData {
    try {
      console.log('Converting parsed config to graph:', config);
      
      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];
      
      // Extract tools (agents) from parsed config
      if (config.tools && Array.isArray(config.tools)) {
        console.log('Found tools array with', config.tools.length, 'tools');
        
        config.tools.forEach((tool: any, index: number) => {
          console.log('Processing tool:', tool.name, tool);
          
          if (tool.name) {
            // Determine node type
            let nodeType: 'frontman' | 'agent' | 'codedTool' = 'agent';
            if (index === 0) {
              nodeType = 'frontman'; // First tool is frontman/entry point
            } else if (tool.class) {
              nodeType = 'codedTool'; // Has class field = coded tool
            }
            
            // Create node
            const node: GraphNode = {
              id: tool.name,
              type: nodeType,
              data: {
                label: this.formatLabel(tool.name),
                description: tool.function?.description || tool.instructions || '',
                instructions: tool.instructions || '',
                tools: tool.tools || []
              },
              position: { x: 0, y: 0 } // Will be set by Dagre layout
            };
            
            nodes.push(node);
            
            // Extract edges from explicit tools array
            if (tool.tools && Array.isArray(tool.tools)) {
              console.log('Found explicit tools array:', tool.tools);
              
              tool.tools.forEach((targetTool: string) => {
                // Only create edge if target tool exists in the tools list
                const targetExists = config.tools.some((t: any) => t.name === targetTool);
                console.log('Target tool', targetTool, 'exists:', targetExists);
                
                if (targetExists) {
                  const edge: GraphEdge = {
                    id: `${tool.name}->${targetTool}`,
                    source: tool.name,
                    target: targetTool,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: '#34a853', strokeWidth: 2 }
                  };
                  
                  console.log('Created edge:', edge);
                  edges.push(edge);
                }
              });
            }
          }
        });
      } else {
        console.log('No tools array found in config');
      }
      
      console.log('Final nodes:', nodes.length, 'Final edges:', edges.length);
      
      return { nodes, edges };
      
    } catch (error) {
      console.error('Error converting parsed config to graph:', error);
      return { nodes: [], edges: [] };
    }
  }
  
  /**
   * Format node label from tool name
   */
  private formatLabel(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  }
}

// Export singleton instance
export const hoconToGraphConverter = new HoconToGraphConverter();
