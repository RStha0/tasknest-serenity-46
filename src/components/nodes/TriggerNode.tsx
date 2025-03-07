
import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideCircleDot } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    triggerType?: string;
    conditionField?: string;
    conditionValue?: string;
    label?: string;
    onDataChange?: (newData: any) => void;
  };
  selected: boolean;
}

const TriggerNode = ({ data, selected }: TriggerNodeProps) => {
  const [triggerType, setTriggerType] = useState(data.triggerType || 'task-created');
  const [showConditions, setShowConditions] = useState(triggerType === 'task-updated');
  const [conditionField, setConditionField] = useState(data.conditionField || 'status');
  const [conditionValue, setConditionValue] = useState(data.conditionValue || 'completed');

  useEffect(() => {
    if (data.onDataChange) {
      data.onDataChange({
        ...data,
        triggerType,
        conditionField,
        conditionValue,
        label: `Task ${triggerType.replace('-', ' ')}`,
      });
    }
  }, [triggerType, conditionField, conditionValue, data]);

  const handleTriggerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTriggerType(value);
    setShowConditions(value === 'task-updated');
  };

  const handleConditionFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConditionField(e.target.value);
  };

  const handleConditionValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConditionValue(e.target.value);
  };

  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#9E77ED]' : 'border-gray-100'} w-[240px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#F4EBFF]">
          <LucideCircleDot className="w-4 h-4 text-[#9E77ED]" />
        </div>
        <span className="font-medium text-sm">Task Trigger</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Trigger when</div>
        <select 
          className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm"
          value={triggerType}
          onChange={handleTriggerChange}
        >
          <option value="task-created">Task is created</option>
          <option value="task-updated">Task is updated</option>
        </select>
      </div>
      
      {showConditions && (
        <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3">
          <div className="text-xs font-medium text-gray-500 mb-2">When field</div>
          <div className="flex gap-2 mb-2">
            <select 
              className="flex-1 bg-white border border-gray-200 rounded-md py-1 px-2 text-sm"
              value={conditionField}
              onChange={handleConditionFieldChange}
            >
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
          
          <div className="text-xs font-medium text-gray-500 mb-2">Is changed to</div>
          <select 
            className="w-full bg-white border border-gray-200 rounded-md py-1 px-2 text-sm"
            value={conditionValue}
            onChange={handleConditionValueChange}
          >
            {conditionField === 'status' && (
              <>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
              </>
            )}
            {conditionField === 'priority' && (
              <>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </>
            )}
            {conditionField === 'assignee' && (
              <>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
                <option value="changed">Changed</option>
              </>
            )}
            {conditionField === 'due_date' && (
              <>
                <option value="added">Added</option>
                <option value="removed">Removed</option>
                <option value="approaching">Approaching</option>
                <option value="overdue">Overdue</option>
              </>
            )}
          </select>
        </div>
      )}
      
      <div className="text-xs text-gray-500">This node starts your workflow when the specified task event occurs</div>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-[#9E77ED] border-2 border-white"
      />
    </div>
  );
};

export default TriggerNode;
