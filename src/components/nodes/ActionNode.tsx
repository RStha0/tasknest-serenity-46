
import { Handle, Position } from '@xyflow/react';
import { LucidePlayCircle } from 'lucide-react';

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#0091FF]' : 'border-gray-100'} w-[240px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#EAF5FF]">
          <LucidePlayCircle className="w-4 h-4 text-[#0091FF]" />
        </div>
        <span className="font-medium text-sm">Perform Action</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Action type</div>
        <select className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm mb-2">
          <option>Send notification</option>
          <option>Create task</option>
          <option>Update status</option>
        </select>
        
        <div className="text-xs font-medium text-gray-500 mb-2">To</div>
        <select className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm">
          <option>Project owner</option>
          <option>Team members</option>
          <option>Stakeholders</option>
        </select>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-[#0091FF] border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#0091FF] border-2 border-white"
      />
    </div>
  );
};

export default ActionNode;
