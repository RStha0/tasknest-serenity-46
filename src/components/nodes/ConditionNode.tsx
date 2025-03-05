
import { Handle, Position } from '@xyflow/react';
import { LucideGitBranch } from 'lucide-react';

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#FF8800]' : 'border-gray-100'} w-[240px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#FFF3EA]">
          <LucideGitBranch className="w-4 h-4 text-[#FF8800]" />
        </div>
        <span className="font-medium text-sm">Check Condition</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">If</div>
        <select className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm mb-2">
          <option>Project priority</option>
          <option>Task status</option>
          <option>Team availability</option>
        </select>
        
        <div className="flex items-center gap-2 mt-2">
          <select className="flex-1 bg-white border border-gray-200 rounded-md py-1 px-2 text-sm">
            <option>is equal to</option>
            <option>is greater than</option>
            <option>contains</option>
          </select>
          <select className="flex-1 bg-white border border-gray-200 rounded-md py-1 px-2 text-sm">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between text-xs">
        <div className="text-[#22C55E]">True ↓</div>
        <div className="text-[#EF4444]">False ↓</div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-[#FF8800] border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-[#22C55E] border-2 border-white left-[30%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-[#EF4444] border-2 border-white left-[70%]"
      />
    </div>
  );
};

export default ConditionNode;
