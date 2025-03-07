import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucideGitBranch, LucideLoader2 } from 'lucide-react';
import DynamicInput from '../common/DynamicInput';
import { fetchOptionsForField, validateField, getVariableType } from '@/utils/formUtils';

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  // State for the condition configuration
  const [conditionField, setConditionField] = useState(data.conditionField || 'variable');
  const [leftOperand, setLeftOperand] = useState(data.leftOperand || '');
  const [operator, setOperator] = useState(data.operator || 'equals');
  const [rightOperand, setRightOperand] = useState(data.rightOperand || '');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<Array<{value: string, label: string}>>([]);
  const [leftOperandType, setLeftOperandType] = useState('');
  
  // Available condition fields
  const conditionFields = [
    { value: 'variable', label: 'Compare variables' },
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
    
    // Determine operators based on the data type of left operand
    const varType = leftOperandType || getVariableType(leftOperand);
    
    if (varType === 'date' || conditionField === 'due_date') {
      return [
        { value: 'before', label: 'Is before' },
        { value: 'after', label: 'Is after' },
        { value: 'on', label: 'Is on' }
      ];
    }
    
    if (varType === 'number') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
        { value: 'greater_than_or_equals', label: 'Greater than or equals' },
        { value: 'less_than_or_equals', label: 'Less than or equals' }
      ];
    }
    
    if (varType === 'text' || varType === 'email') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'starts_with', label: 'Starts with' },
        { value: 'ends_with', label: 'Ends with' }
      ];
    }
    
    if (varType === 'status' || varType === 'priority' || varType === 'assignee' || varType === 'team') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' }
      ];
    }
    
    // Default operators
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Does not equal' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' }
    ];
  };
  
  // Update left operand type when it changes
  useEffect(() => {
    if (leftOperand) {
      const type = getVariableType(leftOperand);
      setLeftOperandType(type);
      
      // Reset right operand when left operand type changes
      if (type !== leftOperandType) {
        setRightOperand('');
      }
    }
  }, [leftOperand]);
  
  // Load field options
  useEffect(() => {
    const loadOptions = async () => {
      if (conditionField === 'custom_expression' || conditionField === 'variable') return;
      
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

  // Update node data when any condition property changes
  useEffect(() => {
    if (data.onDataChange) {
      data.onDataChange({
        ...data,
        conditionField,
        operator,
        leftOperand,
        rightOperand,
        label: getConditionLabel(),
      });
    }
  }, [conditionField, operator, leftOperand, rightOperand]);
  
  // Create a descriptive label for the condition
  const getConditionLabel = () => {
    if (conditionField === 'custom_expression') {
      return 'Custom Expression';
    }
    
    if (conditionField === 'variable' && leftOperand) {
      const shortLeft = leftOperand.length > 10 ? 
        leftOperand.substring(0, 10) + '...' : leftOperand;
      const shortRight = rightOperand.length > 10 ? 
        rightOperand.substring(0, 10) + '...' : rightOperand;
        
      return `${shortLeft} ${operatorToSymbol(operator)} ${shortRight}`;
    }
    
    return conditionField.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Convert operator to symbol for display
  const operatorToSymbol = (op: string) => {
    switch (op) {
      case 'equals': return '=';
      case 'not_equals': return '≠';
      case 'greater_than': return '>';
      case 'less_than': return '<';
      case 'greater_than_or_equals': return '≥';
      case 'less_than_or_equals': return '≤';
      case 'contains': return 'contains';
      case 'starts_with': return 'starts with';
      case 'ends_with': return 'ends with';
      case 'before': return 'before';
      case 'after': return 'after';
      case 'on': return 'on';
      default: return op;
    }
  };
  
  // Validate the condition
  const validateCondition = () => {
    const newErrors: Record<string, string | null> = {};
    
    if (conditionField === 'custom_expression') {
      newErrors.rightOperand = validateField('text', rightOperand);
    } else if (conditionField === 'variable') {
      newErrors.leftOperand = validateField('text', leftOperand);
      newErrors.rightOperand = validateField('text', rightOperand);
    } else {
      newErrors.rightOperand = validateField('text', rightOperand);
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };
  
  // Handle field change
  const handleFieldChange = (field: string) => {
    setConditionField(field);
    setRightOperand('');
    setLeftOperand(field === 'variable' ? '' : `{{${field}}}`);
    setOperator(field === 'custom_expression' ? 'evaluates_to' : 'equals');
    setErrors({});
  };
  
  // Determine right operand input type based on left operand
  const getRightOperandInputType = () => {
    if (!leftOperand) return "text";
    
    const varType = getVariableType(leftOperand);
    if (varType === 'status' || varType === 'priority' || varType === 'assignee' || varType === 'team') {
      return "select";
    }
    
    return "text";
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
          <label className="text-xs font-medium text-gray-500 mb-1 block">Condition Type</label>
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
            value={rightOperand}
            onChange={setRightOperand}
            inputType="textarea"
            error={errors.rightOperand}
            supportExpressions={true}
            placeholder="Enter expression, e.g. {{task.priority}} == 'High'"
          />
        ) : conditionField === 'variable' ? (
          <>
            <DynamicInput
              label="Left side (variable to check)"
              value={leftOperand}
              onChange={setLeftOperand}
              inputType="text"
              error={errors.leftOperand}
              supportExpressions={true}
              placeholder="Select or enter a variable"
            />
            
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
            
            <DynamicInput
              label="Right side (value to compare against)"
              value={rightOperand}
              onChange={setRightOperand}
              inputType={getRightOperandInputType()}
              error={errors.rightOperand}
              supportExpressions={true}
              placeholder="Static value or variable"
              compatibleWith={leftOperand}
              isRightOperand={true}
            />
          </>
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
                value={rightOperand}
                onChange={setRightOperand}
                inputType={fieldOptions.length > 0 ? "select" : "text"}
                options={fieldOptions}
                error={errors.rightOperand}
                supportExpressions={true}
                compatibleWith={leftOperand}
                isRightOperand={true}
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
