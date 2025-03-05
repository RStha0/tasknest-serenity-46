
import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from '@/data/initialElements';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';

// Register custom node types
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

export const AutomationFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Handle new connections between nodes
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => 
      addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#A9ADC1', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#A9ADC1',
        },
      }, eds)
    );
  }, [setEdges]);

  // Add a new node to the graph
  const addNode = (type: string) => {
    const newNode = {
      id: `node_${nodes.length + 1}`,
      type,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1) },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="bg-[#f8f8f8]"
      >
        <Background gap={24} size={1} />
        <Controls className="bg-white border border-gray-100 rounded-md shadow-sm" />
        <MiniMap 
          nodeStrokeWidth={3}
          className="rounded-md shadow-sm"
          nodeClassName={(node) => `minimap-node-${node.type}`}
        />
        
        <Panel position="top-left" className="p-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-1">Add Node</p>
            <div className="flex gap-2">
              <button 
                onClick={() => addNode('trigger')}
                className="px-3 py-2 bg-[#F4EBFF] border border-[#E9D7FE] text-[#9E77ED] rounded-md text-sm font-medium hover:bg-[#E9D7FE] transition-colors"
              >
                Trigger
              </button>
              <button 
                onClick={() => addNode('action')}
                className="px-3 py-2 bg-[#EAF5FF] border border-[#B2DDFF] text-[#0091FF] rounded-md text-sm font-medium hover:bg-[#B2DDFF] transition-colors"
              >
                Action
              </button>
              <button 
                onClick={() => addNode('condition')}
                className="px-3 py-2 bg-[#FFF3EA] border border-[#FFDDB2] text-[#FF8800] rounded-md text-sm font-medium hover:bg-[#FFDDB2] transition-colors"
              >
                Condition
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
