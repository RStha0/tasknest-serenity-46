import { useState, useRef, useEffect } from "react";
import { LucideSearch, LucideVariable, LucideX } from "lucide-react";
import { containsExpression, validateExpression, getCompatibleOptions, getVariableType } from "@/utils/formUtils";
import VariableSelector from "./VariableSelector";
import { Input } from "@/components/ui/input";

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
  compatibleWith?: string;
  isRightOperand?: boolean;
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
  compatibleWith,
  isRightOperand = false,
}: DynamicInputProps) => {
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  const [dynamicOptions, setDynamicOptions] = useState(options);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isRightOperand && compatibleWith) {
      const fetchOptions = async () => {
        const compatOptions = await getCompatibleOptions(compatibleWith);
        if (compatOptions.length > 0) {
          setDynamicOptions(compatOptions);
        }
      };
      
      fetchOptions();
    }
  }, [compatibleWith, isRightOperand]);
  
  useEffect(() => {
    if (isRightOperand && compatibleWith) {
      const varType = getVariableType(compatibleWith);
      if (varType === 'status' || varType === 'priority' || varType === 'assignee') {
        inputType = "select";
      }
    }
  }, [compatibleWith, isRightOperand]);
  
  const handleVariableButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      setAnchorPosition({ 
        x: inputRect.left, 
        y: inputRect.bottom + window.scrollY
      });
      setShowVariableSelector(!showVariableSelector);
      setIsFocused(true);
      inputRef.current.focus();
    }
  };
  
  const handleSelectVariable = (variable: string) => {
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
      
      setTimeout(() => {
        if (inputRef.current && 'selectionStart' in inputRef.current) {
          const newPosition = selectionStart + variable.length;
          inputRef.current.selectionStart = newPosition;
          inputRef.current.selectionEnd = newPosition;
        }
      }, 0);
    } else {
      onChange(value + " " + variable);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const updateAnchorPosition = () => {
    if (inputRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      setAnchorPosition({ 
        x: inputRect.left, 
        y: inputRect.bottom + window.scrollY
      });
    }
  };
  
  const handleInputFocus = () => {
    setIsFocused(true);
    updateAnchorPosition();
    if (supportExpressions) {
      setShowVariableSelector(true);
    }
  };
  
  const handleInputBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget && 
        (e.relatedTarget.closest('.variable-selector') || 
         e.relatedTarget === buttonRef.current)) {
      return;
    }
    
    setIsFocused(false);
    setTimeout(() => {
      if (!document.activeElement?.closest('.variable-selector')) {
        setShowVariableSelector(false);
      }
    }, 100);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    updateAnchorPosition();
    if (!showVariableSelector && supportExpressions) {
      setShowVariableSelector(true);
    }
  };
  
  const handleClearInput = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
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
            onChange={(e) => handleInputChange(e)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`w-full bg-white border rounded-md py-1.5 px-3 text-sm pr-8 ${
              isExpression 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200'
            } ${!isValidExpression ? 'border-red-400' : ''} ${
              error ? 'border-red-400' : ''
            }`}
          >
            <option value="">Select an option</option>
            {dynamicOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : inputType === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => handleInputChange(e)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
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
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={`w-full bg-white ${
              isExpression 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-200'
            } ${!isValidExpression ? 'border-red-400' : ''} ${
              error ? 'border-red-400' : ''
            }`}
          />
        )}
        
        <div className="absolute right-0 flex items-center gap-1 pr-1">
          {value && (
            <button
              type="button"
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400"
              onClick={handleClearInput}
              title="Clear input"
            >
              <LucideX size={16} />
            </button>
          )}
          
          {supportExpressions && (
            <button
              ref={buttonRef}
              type="button"
              className={`p-1 rounded-md hover:bg-gray-100 ${
                isExpression ? 'text-blue-600' : 'text-gray-400'
              }`}
              onClick={handleVariableButtonClick}
              title="Insert variable"
            >
              <LucideVariable size={16} />
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
      
      {!isValidExpression && (
        <div className="text-xs text-red-500 mt-1">Invalid expression format</div>
      )}
      
      {showVariableSelector && (
        <VariableSelector
          isOpen={showVariableSelector}
          onClose={() => setShowVariableSelector(false)}
          onSelect={handleSelectVariable}
          anchorPosition={anchorPosition}
          searchTerm={value}
          setSearchTerm={(term) => onChange(term)}
          compatibleWith={compatibleWith}
          inputValue={value}
          inline={true}
        />
      )}
    </div>
  );
};

export default DynamicInput;
