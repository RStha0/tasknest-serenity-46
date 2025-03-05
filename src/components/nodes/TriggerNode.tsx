
import { Handle, Position } from '@xyflow/react';
import { LucideCircleDot } from 'lucide-react';

const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#9E77ED]' : 'border-gray-100'} w-[240px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F4EBFF]">
          <LucideCircleDot className="w-4 h-4 text-[#9E77ED]" />
        </div>
        <span className="font-medium text-sm">Project Trigger</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Trigger when</div>
        <select className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm">
          <option>Project is created</option>
          <option>Task is assigned</option>
          <option>Deadline is approaching</option>
        </select>
      </div>
      
      <div className="text-xs text-gray-500">This node starts your workflow</div>
      
      {/* Only output handle for trigger node */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#9E77ED] border-2 border-white"
      />
    </div>
  );
};

export default TriggerNode;
