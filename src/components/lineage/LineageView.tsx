
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
import { createLineageGraph } from '@/lib/lineageUtils';

import SourceNode from './SourceNode';
import TargetNode from './TargetNode';

// Define custom node types
const nodeTypes = {
  sourceNode: SourceNode,
  targetNode: TargetNode,
};

interface LineageViewProps {
  mappingFile: MappingFile;
}

const LineageView = ({ mappingFile }: LineageViewProps) => {
  // Generate nodes and edges from mapping data
  const { nodes: initialNodes, edges: initialEdges } = createLineageGraph(mappingFile);

  // Initialize React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges.map(edge => ({
    ...edge,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    style: { stroke: '#888' },
  })));

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background color="#aaa" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default LineageView;
