import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LucidePlayCircle, LucideLoader2 } from 'lucide-react';
import DynamicInput from '../common/DynamicInput';
import { fetchOptionsForField, validateField } from '@/utils/formUtils';

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  // State for the form fields
  const [actionType, setActionType] = useState(data.actionType || 'notification');
  const [formFields, setFormFields] = useState<Record<string, any>>(data.formFields || {});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [recipientOptions, setRecipientOptions] = useState<Array<{value: string, label: string}>>([]);
  
  // Fields to display based on action type
  const getFormConfig = () => {
    switch (actionType) {
      case 'notification':
        return [
          { id: 'recipient', label: 'Send to', type: 'select', required: true },
          { id: 'subject', label: 'Subject', type: 'text', required: true },
          { id: 'message', label: 'Message', type: 'textarea', required: true },
        ];
      case 'task':
        return [
          { id: 'title', label: 'Task title', type: 'text', required: true },
          { id: 'assignee', label: 'Assign to', type: 'select', required: true },
          { id: 'dueDate', label: 'Due date', type: 'text', required: false },
          { id: 'description', label: 'Description', type: 'textarea', required: false },
        ];
      case 'status':
        return [
          { id: 'entity', label: 'Update', type: 'select', required: true },
          { id: 'status', label: 'New status', type: 'select', required: true },
        ];
      default:
        return [];
    }
  };
  
  // Load recipient options
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const assignees = await fetchOptionsForField('assignee');
        setRecipientOptions(
          assignees.map(name => ({ value: name.toLowerCase().replace(' ', '.'), label: name }))
        );
      } catch (error) {
        console.error('Failed to load options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

  // Update node data when form changes
  useEffect(() => {
    if (data.onDataChange) {
      const actionLabel = getActionLabel();
      
      data.onDataChange({
        ...data,
        actionType,
        formFields,
        label: actionLabel,
      });
    }
  }, [actionType, formFields, data]);
  
  // Generate a descriptive label based on the action type and form fields
  const getActionLabel = () => {
    switch (actionType) {
      case 'notification':
        return formFields.subject 
          ? `Notify: ${formFields.subject.substring(0, 15)}${formFields.subject.length > 15 ? '...' : ''}`
          : 'Send Notification';
      case 'task':
        return formFields.title
          ? `Task: ${formFields.title.substring(0, 15)}${formFields.title.length > 15 ? '...' : ''}`
          : 'Create Task';
      case 'status':
        return `Update ${formFields.entity || 'Status'}`;
      default:
        return 'Perform Action';
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const config = getFormConfig();
    const newErrors: Record<string, string | null> = {};
    
    config.forEach(field => {
      if (field.required) {
        const value = formFields[field.id];
        newErrors[field.id] = validateField(field.type, value);
      }
    });
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === null);
  };
  
  // Handle action type change
  const handleActionTypeChange = (type: string) => {
    setActionType(type);
    // Reset form fields when action type changes
    setFormFields({});
    setErrors({});
  };
  
  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormFields(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };
  
  // Get options for a select field
  const getOptionsForField = (fieldId: string) => {
    if (fieldId === 'recipient' || fieldId === 'assignee') {
      return recipientOptions;
    }
    
    if (fieldId === 'entity') {
      return [
        { value: 'task', label: 'Task' },
        { value: 'project', label: 'Project' }
      ];
    }
    
    if (fieldId === 'status') {
      return [
        { value: 'todo', label: 'To Do' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'in_review', label: 'In Review' },
        { value: 'completed', label: 'Completed' }
      ];
    }
    
    return [];
  };
  
  const formConfig = getFormConfig();
  
  return (
    <div className={`p-4 rounded-xl bg-white shadow-sm border ${selected ? 'border-[#0091FF]' : 'border-gray-100'} w-[280px]`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#EAF5FF]">
          <LucidePlayCircle className="w-4 h-4 text-[#0091FF]" />
        </div>
        <span className="font-medium text-sm">Perform Action</span>
      </div>
      
      <div className="bg-[#F9FAFB] rounded-lg p-3 mb-3 space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Action type</label>
          <select 
            className="w-full bg-white border border-gray-200 rounded-md py-1.5 px-2 text-sm"
            value={actionType}
            onChange={(e) => handleActionTypeChange(e.target.value)}
          >
            <option value="notification">Send notification</option>
            <option value="task">Create task</option>
            <option value="status">Update status</option>
          </select>
        </div>
        
        {isLoadingOptions && (
          <div className="flex items-center justify-center py-4">
            <LucideLoader2 className="animate-spin w-5 h-5 text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Loading options...</span>
          </div>
        )}
        
        {!isLoadingOptions && formConfig.map(field => {
          const inputType = field.type === 'textarea' ? 'textarea' : field.type === 'select' ? 'select' : 'text';
          
          return (
            <DynamicInput
              key={field.id}
              label={field.label}
              value={formFields[field.id] || ''}
              onChange={(value) => handleFieldChange(field.id, value)}
              inputType={inputType}
              options={getOptionsForField(field.id)}
              error={errors[field.id]}
              supportExpressions={true}
            />
          );
        })}
        
        {formConfig.length > 0 && (
          <button
            className="w-full mt-2 py-1.5 px-3 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
            onClick={validateForm}
          >
            Validate Form
          </button>
        )}
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
