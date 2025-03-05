
import { useState, useRef } from "react";
import { LucideVariable } from "lucide-react";
import { containsExpression, validateExpression } from "@/utils/formUtils";
import VariableSelector from "./VariableSelector";

interface DynamicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  supportExpressions?: boolean;
  className?: string;
  inputType?: "text" | "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
  error?: string | null;
}

const DynamicInput = ({
  value,
  onChange,
  placeholder = "",
  label,
  supportExpressions = true,
  className = "",
  inputType = "text",
  options = [],
  error = null,
}: DynamicInputProps) => {
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  
  const handleVariableButtonClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorPosition({ 
      x: rect.left, 
      y: rect.bottom + 5
    });
    setShowVariableSelector(!showVariableSelector);
  };
  
  const handleSelectVariable = (variable: string) => {
    // If there's a selection, replace it with the variable
    if (inputRef.current && 'selectionStart' in inputRef.current && 
        inputRef.current.selectionStart !== null && 
        inputRef.current.selectionEnd !== null) {
      
      const selectionStart = inputRef.current.selectionStart;
      const selectionEnd = inputRef.current.selectionEnd;
      
      const newValue = 
        value.substring(0, selectionStart) + 
        variable + 
        value.substring(selectionEnd);
      
      onChange(newValue);
    } else {
      // Just append the variable
      onChange(value + " " + variable);
    }
  };
  
  // Determine if the current value is an expression
  const isExpression = supportExpressions && containsExpression(value);
  const isValidExpression = isExpression ? validateExpression(value) : true;
  
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {inputType === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-white border rounded-md py-1.5 px-3 text-sm pr-8 ${
              isExpression 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200'
            } ${!isValidExpression ? 'border-red-400' : ''} ${
              error ? 'border-red-400' : ''
            }`}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : inputType === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white border rounded-md py-1.5 px-3 text-sm ${
              isExpression 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200'
            } ${!isValidExpression ? 'border-red-400' : ''} ${
              error ? 'border-red-400' : ''
            }`}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white border rounded-md py-1.5 px-3 text-sm ${
              isExpression 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200'
            } ${!isValidExpression ? 'border-red-400' : ''} ${
              error ? 'border-red-400' : ''
            }`}
          />
        )}
        
        {supportExpressions && (
          <button
            type="button"
            className={`absolute right-2 p-1 rounded-md hover:bg-gray-100 ${
              isExpression ? 'text-blue-600' : 'text-gray-400'
            }`}
            onClick={handleVariableButtonClick}
            title="Insert variable"
          >
            <LucideVariable size={16} />
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
      
      {!isValidExpression && (
        <div className="text-xs text-red-500 mt-1">Invalid expression format</div>
      )}
      
      <VariableSelector
        isOpen={showVariableSelector}
        onClose={() => setShowVariableSelector(false)}
        onSelect={handleSelectVariable}
        anchorPosition={anchorPosition}
      />
    </div>
  );
};

export default DynamicInput;
