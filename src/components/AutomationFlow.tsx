import { useCallback, useState, useEffect } from 'react';
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
  NodeChange,
  Node,
  getConnectedEdges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { initialNodes, initialEdges } from '@/data/initialElements';
import TriggerNode from './nodes/TriggerNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import { toast } from 'sonner';
import CustomVariablesModal from './common/CustomVariablesModal';
import { LucideVariable } from 'lucide-react';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

export const AutomationFlow = ({ onFlowChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElements, setSelectedElements] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [customVariablesModalOpen, setCustomVariablesModalOpen] = useState(false);
  
  useEffect(() => {
    if (onFlowChange) {
      onFlowChange({ nodes, edges });
    }
  }, [nodes, edges, onFlowChange]);
  
  const onConnect = useCallback((params: Connection) => {
    const targetIncomingEdges = edges.filter(e => e.target === params.target);
    const sourceOutgoingEdges = edges.filter(e => 
      e.source === params.source && 
      (params.sourceHandle ? e.sourceHandle === params.sourceHandle : true)
    );
    
    const sourceNode = nodes.find(node => node.id === params.source);
    const isConditionNode = sourceNode?.type === 'condition';
    
    if (targetIncomingEdges.length > 0) {
      toast.error("Target node already has an incoming connection", {
        description: "Remove the existing connection first.",
        duration: 3000,
      });
      return;
    }
    
    if (!isConditionNode && sourceOutgoingEdges.length > 0) {
      toast.error("Source node already has an outgoing connection", {
        description: "Remove the existing connection first.",
        duration: 3000,
      });
      return;
    }
    
    if (isConditionNode) {
      const existingTrueEdge = edges.find(e => e.source === params.source && e.sourceHandle === 'true');
      const existingFalseEdge = edges.find(e => e.source === params.source && e.sourceHandle === 'false');
      
      if (params.sourceHandle === 'true' && existingTrueEdge) {
        toast.error("True path already connected", {
          description: "Remove the existing connection first.",
          duration: 3000,
        });
        return;
      }
      
      if (params.sourceHandle === 'false' && existingFalseEdge) {
        toast.error("False path already connected", {
          description: "Remove the existing connection first.",
          duration: 3000,
        });
        return;
      }
    }
    
    let edgeStyle = { stroke: '#A9ADC1', strokeWidth: 1.5 };
    
    if (isConditionNode && params.sourceHandle) {
      if (params.sourceHandle === 'true') {
        edgeStyle = { stroke: '#22C55E', strokeWidth: 1.5 };
      } else if (params.sourceHandle === 'false') {
        edgeStyle = { stroke: '#EF4444', strokeWidth: 1.5 };
      }
    }
    
    setEdges((eds) => 
      addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: edgeStyle.stroke,
        },
      }, eds)
    );
  }, [edges, nodes, setEdges]);

  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
    setSelectedElements({ nodes, edges });
  }, []);

  const deleteSelectedElements = useCallback(() => {
    const triggerNodesToDelete = selectedElements.nodes.filter(node => node.type === 'trigger');
    
    if (triggerNodesToDelete.length > 0) {
      toast.error("Trigger nodes cannot be deleted", {
        description: "Every workflow requires at least one trigger node.",
        duration: 3000,
      });
      return;
    }
    
    if (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0) {
      setNodes((nds) => nds.filter((node) => !selectedElements.nodes.some(n => n.id === node.id)));
      setEdges((eds) => eds.filter((edge) => !selectedElements.edges.some(e => e.id === edge.id)));
      toast.success("Selected elements deleted");
    }
  }, [selectedElements, setNodes, setEdges]);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement || 
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }
    
    if ((event.key === 'Delete' || event.key === 'Backspace') && 
        (selectedElements.nodes.length > 0 || selectedElements.edges.length > 0)) {
      event.preventDefault();
      deleteSelectedElements();
    }
  }, [selectedElements, deleteSelectedElements]);

  const addNode = (type: string) => {
    let initialData = { 
      label: type.charAt(0).toUpperCase() + type.slice(1),
    };
    
    if (type === 'trigger') {
      initialData = {
        ...initialData,
        triggerType: 'task-created',
      };
    } else if (type === 'action') {
      initialData = {
        ...initialData,
        actionType: 'notification',
        formFields: {},
      };
    } else if (type === 'condition') {
      initialData = {
        ...initialData,
        conditionField: 'variable',
        operator: 'equals',
        leftOperand: '',
        rightOperand: '',
      };
    }
    
    const newNode = {
      id: `node_${nodes.length + 1}`,
      type,
      position: { x: 250, y: nodes.length * 100 + 50 },
      data: { 
        ...initialData,
        onDataChange: (newData: any) => {
          updateNodeData(newNode.id, newData);
        }
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...newData,
              onDataChange: node.data.onDataChange,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="h-full w-full" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onSelectionChange={onSelectionChange}
        fitView
        attributionPosition="bottom-right"
        className="bg-[#f8f8f8]"
        deleteKeyCode={[]} // Disable default delete behavior to handle it ourselves
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
            
            <button
              onClick={() => setCustomVariablesModalOpen(true)}
              className="px-3 py-2 flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-600 rounded-md text-sm font-medium hover:from-indigo-100 hover:to-blue-100 transition-colors mt-2 shadow-sm"
            >
              <LucideVariable size={14} />
              <span>Variables Library</span>
            </button>
            
            {selectedElements.nodes.length > 0 || selectedElements.edges.length > 0 ? (
              <button
                onClick={deleteSelectedElements}
                className="mt-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Delete Selected
              </button>
            ) : null}
          </div>
        </Panel>
      </ReactFlow>
      
      <CustomVariablesModal 
        open={customVariablesModalOpen}
        onOpenChange={setCustomVariablesModalOpen}
      />
    </div>
  );
};
