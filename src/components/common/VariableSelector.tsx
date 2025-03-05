
import { useState, useRef, useEffect } from "react";
import { getAvailableVariables } from "@/utils/formUtils";
import { cn } from "@/lib/utils";

interface VariableSelectorProps {
  onSelect: (variable: string) => void;
  isOpen: boolean;
  onClose: () => void;
  anchorPosition?: { x: number; y: number };
}

export const VariableSelector = ({ 
  onSelect, 
  isOpen, 
  onClose,
  anchorPosition = { x: 0, y: 0 }
}: VariableSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [variables, setVariables] = useState(getAvailableVariables());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Filter variables based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setVariables(getAvailableVariables());
    } else {
      const filtered = getAvailableVariables().filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setVariables(filtered);
    }
  }, [searchTerm]);
  
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

  if (!isOpen) return null;
  
  const handleVariableSelect = (variable: string) => {
    onSelect(`{{${variable}}}`);
    onClose();
  };

  const style = {
    position: 'fixed',
    left: `${anchorPosition.x}px`,
    top: `${anchorPosition.y}px`,
    zIndex: 1000,
  } as React.CSSProperties;

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 w-[300px]"
      style={style}
    >
      <div className="p-2 border-b border-gray-100">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search variables..."
          className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
              <span className="font-medium text-blue-600">{variable.name}</span>
              <span className="text-xs text-gray-500 mt-0.5">{variable.description}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VariableSelector;
