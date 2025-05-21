
import { MappingFile } from './types';
import { Edge, Node } from 'reactflow';

// Interface for our node data
interface LineageNodeData {
  label: string;
  type: 'source' | 'target';
  columns?: string[];
  pod?: string;
  malcode?: string;
}

// Create a graph representation of our mapping data
export const createLineageGraph = (mappingFile: MappingFile) => {
  const nodes: Node<LineageNodeData>[] = [];
  const edges: Edge[] = [];
  
  // Track tables and their positions
  const sourceTables = new Map<string, number>();
  const targetTables = new Map<string, number>();
  
  // Extract unique source and target tables with their columns
  mappingFile.rows.forEach(row => {
    const sourceTable = extractTableFromDescription(row.sourceColumn.description || '');
    const targetTable = row.targetColumn.name.split('.')[0]; // Assuming format is "table.column"
    
    // Add source table nodes if not already added
    if (!sourceTables.has(sourceTable)) {
      const nodeId = `source-${sourceTable}`;
      sourceTables.set(sourceTable, nodes.length);
      nodes.push({
        id: nodeId,
        type: 'sourceNode',
        data: {
          label: sourceTable,
          type: 'source',
          columns: [],
          pod: row.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", ""),
          malcode: row.comments?.find(c => c.startsWith("Malcode:"))?.replace("Malcode: ", "")
        },
        position: { x: 100, y: sourceTables.size * 150 }
      });
    }
    
    // Add target table nodes if not already added
    if (!targetTables.has(targetTable)) {
      const nodeId = `target-${targetTable}`;
      targetTables.set(targetTable, nodes.length);
      nodes.push({
        id: nodeId,
        type: 'targetNode',
        data: {
          label: targetTable,
          type: 'target',
          columns: []
        },
        position: { x: 500, y: targetTables.size * 150 }
      });
    }
    
    // Add column to the respective table's columns list
    const sourceNodeIndex = sourceTables.get(sourceTable)!;
    const sourceColumn = row.sourceColumn.name;
    if (!nodes[sourceNodeIndex].data.columns!.includes(sourceColumn)) {
      nodes[sourceNodeIndex].data.columns!.push(sourceColumn);
    }
    
    const targetNodeIndex = targetTables.get(targetTable)!;
    const targetColumn = row.targetColumn.name;
    if (!nodes[targetNodeIndex].data.columns!.includes(targetColumn)) {
      nodes[targetNodeIndex].data.columns!.push(targetColumn);
    }
    
    // Create an edge between the tables
    const edgeId = `${sourceTable}-${targetTable}`;
    if (!edges.some(edge => edge.id === edgeId)) {
      edges.push({
        id: edgeId,
        source: `source-${sourceTable}`,
        target: `target-${targetTable}`,
        animated: true,
        label: `${row.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", "") || ''}`
      });
    }
  });
  
  // Adjust node positions for a better layout
  nodes.forEach((node, index) => {
    if (node.data.type === 'source') {
      node.position = { x: 100, y: (index % 5) * 200 };
    } else {
      node.position = { x: 600, y: (index % 8) * 150 };
    }
  });
  
  return { nodes, edges };
};

// Helper function to extract table name from description
function extractTableFromDescription(description: string): string {
  // First try to find "pod - malcode" format and extract malcode as table name
  const parts = description.split(" - ");
  if (parts.length > 1) {
    return parts[1];
  }
  
  // Fallback to using the whole description
  return description || "Unknown";
}
