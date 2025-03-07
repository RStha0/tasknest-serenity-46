import { useState, useRef, useEffect } from "react";
import { getAvailableVariables, getCompatibleVariables, getVariableType } from "@/utils/formUtils";
import { cn } from "@/lib/utils";

interface VariableSelectorProps {
  onSelect: (variable: string) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
  filterType?: string;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  compatibleWith?: string; // For compatibility filtering
  inputValue?: string; // Current value of the input
  inline?: boolean; // Whether to show as inline with the input
}

export const VariableSelector = ({ 
  onSelect, 
  isOpen, 
  onClose,
  anchorPosition = { x: 0, y: 0 },
  filterType = "",
  searchTerm = "",
  setSearchTerm,
  compatibleWith,
  inputValue = "",
  inline = false
}: VariableSelectorProps) => {
  const [variables, setVariables] = useState(getAvailableVariables());
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let filteredVars = compatibleWith 
      ? getCompatibleVariables(compatibleWith) 
      : getAvailableVariables();
    
    if (filterType) {
      if (filterType === 'user') {
        filteredVars = filteredVars.filter(v => 
          v.name.startsWith('current_user.') || v.name.startsWith('trigger.user.')
        );
      } else if (filterType === 'task') {
        filteredVars = filteredVars.filter(v => v.name.startsWith('task.'));
      } else if (filterType === 'project') {
        filteredVars = filteredVars.filter(v => v.name.startsWith('project.'));
      } else if (filterType === 'custom') {
        filteredVars = filteredVars.filter(v => v.name.startsWith('variables.'));
      }
    }
    
    const searchString = (searchTerm || "").trim().toLowerCase();
    if (searchString) {
      filteredVars = filteredVars.filter(v => 
        v.name.toLowerCase().includes(searchString) || 
        (v.description && v.description.toLowerCase().includes(searchString))
      );
    }
    
    setVariables(filteredVars);
    setHighlightedIndex(0);
  }, [searchTerm, filterType, compatibleWith]);
  
  useEffect(() => {
    if (highlightedRef.current && containerRef.current) {
      highlightedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!event.target || (
            !(event.target as HTMLElement).closest('input') &&
            !(event.target as HTMLElement).closest('button')
          )) {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < variables.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (variables[highlightedIndex]) {
            handleVariableSelect(variables[highlightedIndex].name);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, variables, highlightedIndex]);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault = false;
  };

  if (!isOpen) return null;
  
  const handleVariableSelect = (variable: string) => {
    onSelect(`{{${variable}}}`);
  };
  
  const showCategoryFilters = !compatibleWith && filterType === "";
  
  const selectorWidth = inline ? '100%' : '300px';
  
  const style = inline ? {
    position: 'absolute',
    left: '0',
    top: 'calc(100% + 1px)',
    width: selectorWidth,
    zIndex: 1000,
  } as React.CSSProperties : {
    position: 'absolute',
    left: `${anchorPosition.x}px`,
    top: `${anchorPosition.y}px`,
    width: selectorWidth,
    zIndex: 1000,
  } as React.CSSProperties;

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-md shadow-lg border border-gray-200 variable-selector"
      style={style}
      onWheel={handleWheel}
    >
      {showCategoryFilters && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100">
          <button 
            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            onClick={() => setSearchTerm?.("task")}
          >
            Task
          </button>
          <button 
            className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
            onClick={() => setSearchTerm?.("user")}
          >
            User
          </button>
          <button 
            className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100"
            onClick={() => setSearchTerm?.("project")}
          >
            Project
          </button>
          <button 
            className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
            onClick={() => setSearchTerm?.("trigger")}
          >
            Trigger
          </button>
          <button 
            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
            onClick={() => setSearchTerm?.("variables")}
          >
            Custom
          </button>
        </div>
      )}
      
      {compatibleWith && (
        <div className="p-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500">
            Showing variables compatible with <span className="text-blue-600">{compatibleWith}</span>
          </div>
        </div>
      )}
      
      <div 
        className="max-h-[300px] overflow-y-auto p-1"
        onWheel={handleWheel}
      >
        {variables.length === 0 ? (
          <div className="py-3 px-4 text-sm text-gray-500 text-center">
            No variables match your search
          </div>
        ) : (
          variables.map((variable, index) => (
            <div
              key={variable.name}
              ref={index === highlightedIndex ? highlightedRef : null}
              className={cn(
                "py-2 px-3 text-sm rounded-md cursor-pointer flex flex-col",
                index === highlightedIndex ? "bg-blue-50" : "hover:bg-gray-50"
              )}
              onClick={() => handleVariableSelect(variable.name)}
              onMouseOver={() => setHighlightedIndex(index)}
              onWheel={handleWheel}
            >
              <span className={cn("font-medium", 
                variable.name.startsWith("task.") ? "text-blue-600" :
                variable.name.startsWith("current_user.") || variable.name.startsWith("trigger.user.") ? "text-purple-600" :
                variable.name.startsWith("project.") ? "text-green-600" :
                variable.name.startsWith("trigger.") ? "text-orange-600" :
                "text-gray-600"
              )}>
                {variable.name}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{variable.description}</span>
              {variable.type && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1 inline-block w-fit">
                  {variable.type}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VariableSelector;
