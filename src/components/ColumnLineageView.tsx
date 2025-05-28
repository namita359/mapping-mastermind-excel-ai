
import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MappingFile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Table2 } from "lucide-react";

interface ColumnLineageViewProps {
  mappingFile: MappingFile;
}

const createColumnLineageGraph = (mappingFile: MappingFile) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Track unique columns and their positions
  const sourceColumns = new Map<string, any>();
  const targetColumns = new Map<string, any>();
  
  mappingFile.rows.forEach((row, index) => {
    const sourceKey = `${row.sourceColumn.malcode}.${row.sourceColumn.table}.${row.sourceColumn.column}`;
    const targetKey = `${row.targetColumn.malcode}.${row.targetColumn.table}.${row.targetColumn.column}`;
    
    // Add source column node
    if (!sourceColumns.has(sourceKey)) {
      const sourceNodeId = `source-${sourceKey}`;
      sourceColumns.set(sourceKey, {
        id: sourceNodeId,
        type: 'default',
        data: {
          label: (
            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">{row.sourceColumn.malcode}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Table2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">{row.sourceColumn.table}</span>
              </div>
              <div className="text-sm font-medium text-blue-900">{row.sourceColumn.column}</div>
              <Badge variant="outline" className="mt-1 text-xs">
                {row.sourceColumn.dataType}
              </Badge>
            </div>
          ),
        },
        position: { x: 50, y: sourceColumns.size * 120 }
      });
      nodes.push(sourceColumns.get(sourceKey));
    }
    
    // Add target column node
    if (!targetColumns.has(targetKey)) {
      const targetNodeId = `target-${targetKey}`;
      targetColumns.set(targetKey, {
        id: targetNodeId,
        type: 'default',
        data: {
          label: (
            <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-800">{row.targetColumn.malcode}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Table2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">{row.targetColumn.table}</span>
              </div>
              <div className="text-sm font-medium text-green-900">{row.targetColumn.column}</div>
              <Badge variant="outline" className="mt-1 text-xs">
                {row.targetColumn.dataType}
              </Badge>
            </div>
          ),
        },
        position: { x: 450, y: targetColumns.size * 120 }
      });
      nodes.push(targetColumns.get(targetKey));
    }
    
    // Create edge between source and target columns
    const edgeId = `${sourceKey}-${targetKey}`;
    if (!edges.some(edge => edge.id === edgeId)) {
      edges.push({
        id: edgeId,
        source: `source-${sourceKey}`,
        target: `target-${targetKey}`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: { stroke: '#888' },
        label: row.transformation || 'Direct Copy',
        labelStyle: { fontSize: '12px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 }
      });
    }
  });
  
  return { nodes, edges };
};

const ColumnLineageView = ({ mappingFile }: ColumnLineageViewProps) => {
  const { nodes: initialNodes, edges: initialEdges } = createColumnLineageGraph(mappingFile);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  if (mappingFile.rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Column-wise Lineage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-500 mb-2">No mapping data available</p>
            <p className="text-sm text-gray-400">Generate test data first to view column lineage</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Column-wise Data Lineage
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual representation of source to target column mappings with transformations
        </p>
      </CardHeader>
      <CardContent className="h-full p-0">
        <div className="h-[600px] border rounded-lg bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{ padding: 0.1 }}
          >
            <Controls />
            <MiniMap zoomable pannable />
            <Background color="#aaa" gap={12} size={1} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnLineageView;
