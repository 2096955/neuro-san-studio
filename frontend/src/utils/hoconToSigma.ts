/**
 * HOCON to Sigma.js Graph Converter
 * 
 * Converts HOCON agent network configurations into Sigma.js graph format
 * with nodes (agents/tools) and edges (relationships/calls)
 */

export interface SigmaNode {
  key: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'agent' | 'tool' | 'frontman';
  metadata?: {
    description?: string;
    model?: string;
    instructions?: string;
    parent?: string;
    children?: string[];
    isFrontman?: boolean;
  };
}

export interface SigmaEdge {
  key: string;
  source: string;
  target: string;
  size: number;
  color: string;
  type: 'calls' | 'uses' | 'parent-child';
  label?: string;
}

export interface SigmaGraphData {
  nodes: SigmaNode[];
  edges: SigmaEdge[];
}

export class HoconToSigmaConverter {
  private nodePositions: Map<string, { x: number; y: number }> = new Map();
  private nodeIndex = 0;

  /**
   * Convert parsed HOCON config to Sigma.js graph data
   */
  convertParsedConfigToGraph(config: any): SigmaGraphData {
    try {
      console.log('Converting parsed config to graph:', config);
      
      const nodes: SigmaNode[] = [];
      const edges: SigmaEdge[] = [];
      
      // Extract tools (agents) from parsed config
      if (config.tools && Array.isArray(config.tools)) {
        console.log('Found tools array with', config.tools.length, 'tools');
        config.tools.forEach((tool: any, index: number) => {
          console.log('Processing tool:', tool.name, tool);
          if (tool.name) {
            const node = this.createAgentNode(tool, index === 0); // First tool is frontman
            nodes.push(node);
            
            // Extract tool calls from explicit tools array
            if (tool.tools && Array.isArray(tool.tools)) {
              console.log('Found explicit tools array:', tool.tools);
              tool.tools.forEach((targetTool: string) => {
                // Only create edge if target tool exists in the tools list
                const targetExists = config.tools.some((t: any) => t.name === targetTool);
                console.log('Target tool', targetTool, 'exists:', targetExists);
                if (targetExists) {
                  const edge = this.createEdge(tool.name, targetTool, 'calls');
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
      
      // Add tree layout positioning
      this.applyTreeLayout(nodes, edges);
      
      return { nodes, edges };
      
    } catch (error) {
      console.error('Error converting parsed config to graph:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Convert HOCON content to Sigma.js graph data (legacy method)
   */
  convertHoconToGraph(hoconContent: string): SigmaGraphData {
    try {
      // Parse HOCON content (simplified JSON-like parsing)
      const config = this.parseHoconContent(hoconContent);
      console.log('Parsed HOCON config:', config);
      
      const nodes: SigmaNode[] = [];
      const edges: SigmaEdge[] = [];
      
      // Extract tools (agents) from HOCON
      if (config.tools && Array.isArray(config.tools)) {
        console.log('Found tools array with', config.tools.length, 'tools');
        config.tools.forEach((tool: any, index: number) => {
          console.log('Processing tool:', tool.name, tool);
          if (tool.name) {
            const node = this.createAgentNode(tool, index === 0); // First tool is frontman
            nodes.push(node);
            
            // Extract tool calls from both instructions and explicit tools array
            const toolCalls = this.extractToolCalls(tool.instructions || '');
            console.log('Tool calls from instructions:', toolCalls);
            
            // Also check for explicit tools array in the tool definition
            if (tool.tools && Array.isArray(tool.tools)) {
              console.log('Found explicit tools array:', tool.tools);
              tool.tools.forEach((targetTool: string) => {
                if (!toolCalls.includes(targetTool)) {
                  toolCalls.push(targetTool);
                }
              });
            }
            
            console.log('Final tool calls for', tool.name, ':', toolCalls);
            
            toolCalls.forEach(targetTool => {
              // Only create edge if target tool exists in the tools list
              const targetExists = config.tools.some((t: any) => t.name === targetTool);
              console.log('Target tool', targetTool, 'exists:', targetExists);
              if (targetExists) {
                const edge = this.createEdge(tool.name, targetTool, 'calls');
                console.log('Created edge:', edge);
                edges.push(edge);
              }
            });
          }
        });
      } else {
        console.log('No tools array found in config');
      }
      
      console.log('Final nodes:', nodes.length, 'Final edges:', edges.length);
      
      // Add tree layout positioning
      this.applyTreeLayout(nodes, edges);
      
      return { nodes, edges };
      
    } catch (error) {
      console.error('Error converting HOCON to graph:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Parse HOCON content (simplified approach)
   */
  private parseHoconContent(content: string): any {
    try {
      // Remove comments but preserve structure
      let cleanContent = content
        .split('\n')
        .map(line => {
          const commentIndex = line.indexOf('#');
          return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
        })
        .join('\n')
        .trim();
      
      console.log('Clean content before JSON parse:', cleanContent.substring(0, 500));
      
      // Try to parse as JSON first
      const parsed = JSON.parse(cleanContent);
      console.log('Successfully parsed as JSON:', parsed);
      return parsed;
    } catch (error) {
      console.log('JSON parsing failed, trying manual extraction:', error);
      // If JSON parsing fails, try manual extraction
      return this.extractToolsManually(content);
    }
  }

  /**
   * Manual extraction of tools from HOCON content using regex
   */
  private extractToolsManually(content: string): any {
    const tools: any[] = [];
    
    // Extract tool definitions using regex patterns
    const toolPattern = /"name":\s*"([^"]+)"/g;
    const functionPattern = /"function":\s*\{[^}]*"description":\s*"([^"]+)"/g;
    const instructionsPattern = /"instructions":\s*"""([^"]*?)"""/gs;
    
    let toolMatch;
    while ((toolMatch = toolPattern.exec(content)) !== null) {
      const toolName = toolMatch[1];
      
      // Find corresponding function description
      functionPattern.lastIndex = 0;
      let funcMatch;
      while ((funcMatch = functionPattern.exec(content)) !== null) {
        if (content.indexOf(funcMatch[0]) > toolMatch.index) {
          const description = funcMatch[1];
          
          // Find instructions
          instructionsPattern.lastIndex = 0;
          const instrMatch = instructionsPattern.exec(content);
          const instructions = instrMatch ? instrMatch[1] : '';
          
          tools.push({
            name: toolName,
            function: { description },
            instructions
          });
          break;
        }
      }
    }
    
    return { tools };
  }

  /**
   * Create agent node from tool definition
   */
  private createAgentNode(tool: any, isFrontman: boolean = false): SigmaNode {
    const nodeType = isFrontman ? 'frontman' : 'agent';
    const color = isFrontman ? '#ff6b35' : '#4285f4'; // Orange for frontman, blue for agents
    
    return {
      key: tool.name,
      label: tool.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      x: 0, // Will be set by layout
      y: 0, // Will be set by layout
      size: isFrontman ? 25 : 18,
      color,
      type: nodeType,
      metadata: {
        description: tool.function?.description || '',
        instructions: tool.instructions || '',
        children: [],
        isFrontman: isFrontman
      }
    };
  }

  /**
   * Extract tool calls from instructions text
   */
  private extractToolCalls(instructions: string): string[] {
    const toolCalls: string[] = [];
    
    // Look for common patterns of tool calls in instructions
    const patterns = [
      /call\s+(?:your\s+)?`?([a-z_]+)`?/gi,
      /calling\s+`?([a-z_]+)`?/gi,
      /use\s+(?:the\s+)?`?([a-z_]+)`?\s+tool/gi,
      /`([a-z_]+)`\s+tool/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(instructions)) !== null) {
        const toolName = match[1].toLowerCase();
        if (!toolCalls.includes(toolName)) {
          toolCalls.push(toolName);
        }
      }
    });
    
    return toolCalls;
  }

  /**
   * Create edge between nodes
   */
  private createEdge(source: string, target: string, type: 'calls' | 'uses' | 'parent-child'): SigmaEdge {
    const colors = {
      calls: '#34a853',
      uses: '#fbbc04',
      'parent-child': '#ea4335'
    };
    
    return {
      key: `${source}->${target}`,
      source,
      target,
      size: 3,
      color: colors[type],
      type,
      label: ''
    };
  }

  /**
   * Apply hierarchical tree layout with better spacing
   */
  private applyTreeLayout(nodes: SigmaNode[], edges: SigmaEdge[]): void {
    // Find frontman (root) node - first node or one marked as frontman
    const frontmanNode = nodes.find(node => node.type === 'frontman') || nodes[0];
    if (!frontmanNode) {
      this.applyCircularLayout(nodes);
      return;
    }

    // Create adjacency map to understand connections
    const adjacencyMap = new Map<string, string[]>();
    const reverseMap = new Map<string, string[]>(); // Who points to this node
    
    edges.forEach(edge => {
      if (!adjacencyMap.has(edge.source)) {
        adjacencyMap.set(edge.source, []);
      }
      adjacencyMap.get(edge.source)!.push(edge.target);
      
      if (!reverseMap.has(edge.target)) {
        reverseMap.set(edge.target, []);
      }
      reverseMap.get(edge.target)!.push(edge.source);
    });

    // Build hierarchy levels using BFS
    const levels: string[][] = [];
    const visited = new Set<string>();
    const queue: Array<{key: string, level: number}> = [{key: frontmanNode.key, level: 0}];
    visited.add(frontmanNode.key);

    while (queue.length > 0) {
      const {key, level} = queue.shift()!;
      
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(key);

      const children = adjacencyMap.get(key) || [];
      children.forEach(child => {
        if (!visited.has(child)) {
          visited.add(child);
          queue.push({key: child, level: level + 1});
        }
      });
    }

    // Add any unvisited nodes to the last level
    nodes.forEach(node => {
      if (!visited.has(node.key)) {
        const lastLevel = levels.length;
        if (!levels[lastLevel]) {
          levels[lastLevel] = [];
        }
        levels[lastLevel].push(node.key);
      }
    });

    // Position nodes by level with better spacing
    const verticalSpacing = 400;
    const horizontalSpacing = 350;

    levels.forEach((levelNodes, levelIndex) => {
      const totalWidth = (levelNodes.length - 1) * horizontalSpacing;
      const startX = -totalWidth / 2;
      const y = levelIndex * verticalSpacing;

      levelNodes.forEach((nodeKey, index) => {
        const node = nodes.find(n => n.key === nodeKey);
        if (node) {
          node.x = startX + (index * horizontalSpacing);
          node.y = y;
        }
      });
    });
  }

  /**
   * Apply circular layout to nodes (fallback)
   */
  private applyCircularLayout(nodes: SigmaNode[]): void {
    const centerX = 0;
    const centerY = 0;
    const radius = 200;
    
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
  }

  /**
   * Convert agent registry data to graph (alternative method)
   */
  convertRegistryToGraph(agents: any[]): SigmaGraphData {
    const nodes: SigmaNode[] = [];
    const edges: SigmaEdge[] = [];
    
    agents.forEach((agent, index) => {
      // Create node for each agent
      const node: SigmaNode = {
        key: agent.id,
        label: agent.system,
        x: 0,
        y: 0,
        size: agent.parent_agent ? 12 : 18, // Larger for parent agents
        color: agent.parent_agent ? '#4285f4' : '#ff6b35',
        type: agent.parent_agent ? 'agent' : 'frontman',
        metadata: {
          description: agent.description,
          model: agent.llm_model,
          parent: agent.parent_agent
        }
      };
      nodes.push(node);
      
      // Create edge to parent if exists
      if (agent.parent_agent) {
        const edge: SigmaEdge = {
          key: `${agent.parent_agent}->${agent.id}`,
          source: agent.parent_agent,
          target: agent.id,
          size: 2,
          color: '#ea4335',
          type: 'parent-child'
        };
        edges.push(edge);
      }
    });
    
    this.applyCircularLayout(nodes);
    return { nodes, edges };
  }
}

// Export singleton instance
export const hoconToSigmaConverter = new HoconToSigmaConverter();
