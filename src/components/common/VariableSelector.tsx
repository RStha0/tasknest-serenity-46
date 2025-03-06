
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
  compatibleWith?: string; // New prop for compatibility filtering
}

export const VariableSelector = ({ 
  onSelect, 
  isOpen, 
  onClose,
  anchorPosition = { x: 0, y: 0 },
  filterType = "",
  searchTerm = "",
  setSearchTerm,
  compatibleWith
}: VariableSelectorProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [variables, setVariables] = useState(getAvailableVariables());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update local search term when searchTerm prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Filter variables based on search term, type, and compatibility
  useEffect(() => {
    let filteredVars = compatibleWith 
      ? getCompatibleVariables(compatibleWith) 
      : getAvailableVariables();
    
    // Apply type filter if provided
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
    
    // Apply search term filter
    const searchString = localSearchTerm.trim().toLowerCase();
    if (searchString !== "") {
      filteredVars = filteredVars.filter(v => 
        v.name.toLowerCase().includes(searchString) || 
        v.description.toLowerCase().includes(searchString)
      );
    }
    
    setVariables(filteredVars);
  }, [localSearchTerm, filterType, compatibleWith]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchTerm(newValue);
    if (setSearchTerm) {
      setSearchTerm(newValue);
    }
  };

  // Prevent scroll events from propagating to the ReactFlow canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;
  
  const handleVariableSelect = (variable: string) => {
    onSelect(`{{${variable}}}`);
    onClose();
  };

  // Position the selector directly below the input field
  const style = {
    position: 'absolute',
    left: `0px`,
    top: `calc(100% + 5px)`,
    width: '300px',
    zIndex: 1000,
  } as React.CSSProperties;

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 w-[300px]"
      style={style}
      onWheel={handleWheel}
    >
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search variables..."
          className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={localSearchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      {compatibleWith ? (
        <div className="p-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500">
            Showing variables compatible with <span className="text-blue-600">{compatibleWith}</span>
          </div>
        </div>
      ) : filterType === "" && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100">
          <button 
            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            onClick={() => setLocalSearchTerm("task")}
          >
            Task
          </button>
          <button 
            className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
            onClick={() => setLocalSearchTerm("user")}
          >
            User
          </button>
          <button 
            className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100"
            onClick={() => setLocalSearchTerm("project")}
          >
            Project
          </button>
          <button 
            className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
            onClick={() => setLocalSearchTerm("trigger")}
          >
            Trigger
          </button>
          <button 
            className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
            onClick={() => setLocalSearchTerm("variables")}
          >
            Custom
          </button>
        </div>
      )}
      
      <div className="max-h-[300px] overflow-y-auto p-1">
        {variables.length === 0 ? (
          <div className="py-3 px-4 text-sm text-gray-500 text-center">
            No variables match your search
          </div>
        ) : (
          variables.map((variable) => (
            <div
              key={variable.name}
              className="py-2 px-3 text-sm hover:bg-gray-50 rounded-md cursor-pointer flex flex-col"
              onClick={() => handleVariableSelect(variable.name)}
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
