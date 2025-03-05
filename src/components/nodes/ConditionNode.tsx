
import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideGitBranch, LucideLoader2 } from 'lucide-react';
import DynamicInput from '../common/DynamicInput';
import { fetchOptionsForField, validateField } from '@/utils/formUtils';

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  // State for the condition configuration
  const [conditionField, setConditionField] = useState(data.conditionField || 'project_priority');
  const [operator, setOperator] = useState(data.operator || 'equals');
  const [conditionValue, setConditionValue] = useState(data.conditionValue || '');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Available condition fields
  const conditionFields = [
    { value: 'project_priority', label: 'Project priority' },
    { value: 'task_status', label: 'Task status' },
    { value: 'task_assignee', label: 'Task assignee' },
    { value: 'due_date', label: 'Due date' },
    { value: 'custom_expression', label: 'Custom expression' }
  ];
  
  // Operators based on field type
  const getOperators = () => {
    if (conditionField === 'custom_expression') {
      return [{ value: 'evaluates_to', label: 'Evaluates to' }];
    }
    
    if (conditionField === 'due_date') {
      return [
        { value: 'before', label: 'Is before' },
        { value: 'after', label: 'Is after' },
        { value: 'on', label: 'Is on' }
      ];
    }
    
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Does not equal' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' }
    ];
  };
  
  // Load field options
  useEffect(() => {
    const loadOptions = async () => {
      if (conditionField === 'custom_expression') return;
      
      setIsLoadingOptions(true);
      try {
        let fieldType = '';
        
        switch (conditionField) {
          case 'project_priority':
          case 'task_status':
            fieldType = 'status';
            break;
          case 'task_assignee':
            fieldType = 'assignee';
            break;
          default:
            fieldType = '';
        }
        
        if (fieldType) {
          const options = await fetchOptionsForField(fieldType);
          setFieldOptions(
            options.map(option => ({ value: option.toLowerCase().replace(' ', '_'), label: option }))
          );
        } else {
          setFieldOptions([]);
        }
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, [conditionField]);

  // Update node data when form changes
  useEffect(() => {
    if (data.onDataChange) {
      data.onDataChange({
        ...data,
        conditionField,
        operator,
        conditionValue
      });
    }
  }, [conditionField, operator, conditionValue, data]);
  
  // Validate the condition
  const validateCondition = () => {
    const newErrors: Record<string, string | null> = {};
    
    if (conditionField === 'custom_expression') {
      newErrors.conditionValue = validateField('text', conditionValue);
    } else {
      newErrors.conditionValue = validateField('text', conditionValue);
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };
  
  // Handle field change
  const handleFieldChange = (field: string) => {
    setConditionField(field);
    setConditionValue('');
    setOperator(field === 'custom_expression' ? 'evaluates_to' : 'equals');
    setErrors({});
  };
  
  const operators = getOperators();
  
  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#FF8800]' : 'border-gray-100'} w-[280px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#FFF3EA]">
          <LucideGitBranch className="w-4 h-4 text-[#FF8800]" />
        </div>
        <span className="font-medium text-sm">Check Condition</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">If</label>
          <select 
            className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-2 text-sm"
            value={conditionField}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            {conditionFields.map(field => (
              <option key={field.value} value={field.value}>{field.label}</option>
            ))}
          </select>
        </div>
        
        {conditionField === 'custom_expression' ? (
          <DynamicInput
            label="Expression"
            value={conditionValue}
            onChange={setConditionValue}
            inputType="textarea"
            error={errors.conditionValue}
            supportExpressions={true}
            placeholder="Enter expression, e.g. {{task.priority}} == 'High'"
          />
        ) : (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Operator</label>
              <select 
                className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-2 text-sm"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                {operators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            
            {isLoadingOptions ? (
              <div className="flex items-center justify-center py-2">
                <LucideLoader2 className="animate-spin w-4 h-4 text-orange-500" />
                <span className="ml-2 text-xs text-gray-500">Loading options...</span>
              </div>
            ) : (
              <DynamicInput
                label="Value"
                value={conditionValue}
                onChange={setConditionValue}
                inputType={fieldOptions.length > 0 ? "select" : "text"}
                options={fieldOptions}
                error={errors.conditionValue}
                supportExpressions={true}
              />
            )}
          </>
        )}
        
        <button
          className="w-full mt-2 py-1.5 px-3 bg-orange-50 text-orange-600 rounded-md text-sm font-medium hover:bg-orange-100 transition-colors"
          onClick={validateCondition}
        >
          Validate Condition
        </button>
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
