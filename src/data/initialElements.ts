
import { MarkerType, Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'Project Created' },
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 250, y: 200 },
    data: { label: 'Check Priority' },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 100, y: 350 },
    data: { label: 'Notify Team' },
  },
  {
    id: '4',
    type: 'action',
    position: { x: 400, y: 350 },
    data: { label: 'Schedule Review' },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#A9ADC1', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#A9ADC1',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    sourceHandle: 'true',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#22C55E', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#22C55E',
    },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    sourceHandle: 'false',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#EF4444', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: '#EF4444',
    },
  },
];
