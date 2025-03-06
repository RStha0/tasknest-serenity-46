
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LucideVariable, 
  LucidePlus, 
  LucideTrash2, 
  LucidePencil,
  LucideTag,
  LucideUser,
  LucideClipboardCheck,
  LucideFolder,
  LucideFlame 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { getAvailableVariables, getCustomVariables, saveCustomVariable, deleteCustomVariable } from '@/utils/formUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CustomVariablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomVariablesModal = ({ open, onOpenChange }: CustomVariablesModalProps) => {
  const [activeTab, setActiveTab] = useState("custom");
  const [customVariables, setCustomVariables] = useState<Array<{ name: string; value: string; type: string }>>([]);
  const [systemVariables, setSystemVariables] = useState<Array<{ name: string; description: string; type: string }>>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [newVarType, setNewVarType] = useState('text');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load variables
  useEffect(() => {
    if (open) {
      setCustomVariables(getCustomVariables());
      setSystemVariables(getAvailableVariables());
    }
  }, [open]);

  // Reset form when closing
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setNewVarName('');
    setNewVarValue('');
    setNewVarType('text');
    setEditingIndex(null);
    setSearchTerm('');
    setCategoryFilter('all');
  };

  const handleSaveVariable = () => {
    if (!newVarName.trim()) {
      toast.error("Variable name is required");
      return;
    }

    if (!newVarName.match(/^[a-zA-Z0-9_]+$/)) {
      toast.error("Variable name can only contain letters, numbers, and underscores");
      return;
    }

    // Ensure name starts with variables. prefix
    const fullVarName = newVarName.startsWith('variables.') ? newVarName : `variables.${newVarName}`;

    try {
      saveCustomVariable(fullVarName, newVarValue, newVarType, editingIndex);
      setCustomVariables(getCustomVariables());
      resetForm();
      toast.success(editingIndex !== null ? "Variable updated" : "Variable created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save variable");
    }
  };

  const handleEditVariable = (index: number) => {
    const variable = customVariables[index];
    setNewVarName(variable.name.replace('variables.', ''));
    setNewVarValue(variable.value);
    setNewVarType(variable.type);
    setEditingIndex(index);
  };

  const handleDeleteVariable = (index: number) => {
    try {
      deleteCustomVariable(index);
      setCustomVariables(getCustomVariables());
      resetForm();
      toast.success("Variable deleted");
    } catch (error) {
      toast.error("Failed to delete variable");
    }
  };

  // Filter system variables based on search and category
  const filteredSystemVariables = systemVariables.filter(variable => {
    const matchesSearch = searchTerm === '' || 
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (categoryFilter === 'all') return matchesSearch;
    
    if (categoryFilter === 'task') return matchesSearch && variable.name.startsWith('task.');
    if (categoryFilter === 'user') return matchesSearch && (variable.name.startsWith('current_user.') || variable.name.startsWith('trigger.user.'));
    if (categoryFilter === 'project') return matchesSearch && variable.name.startsWith('project.');
    if (categoryFilter === 'trigger') return matchesSearch && variable.name.startsWith('trigger.') && !variable.name.startsWith('trigger.user.');
    
    return matchesSearch;
  });

  // Filter custom variables based on search
  const filteredCustomVariables = customVariables.filter(variable => 
    searchTerm === '' || variable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get variable category style
  const getVariableCategoryStyle = (name: string) => {
    if (name.startsWith('task.')) return 'variable-task';
    if (name.startsWith('current_user.') || name.startsWith('trigger.user.')) return 'variable-user';
    if (name.startsWith('project.')) return 'variable-project';
    if (name.startsWith('trigger.') && !name.startsWith('trigger.user.')) return 'variable-trigger';
    if (name.startsWith('variables.')) return 'variable-custom';
    return '';
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'task': return <LucideClipboardCheck size={14} />;
      case 'user': return <LucideUser size={14} />;
      case 'project': return <LucideFolder size={14} />;
      case 'trigger': return <LucideFlame size={14} />;
      case 'custom': return <LucideTag size={14} />;
      default: return <LucideVariable size={14} />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-0 shadow-lg rounded-xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
          <DialogTitle className="flex items-center gap-2 text-indigo-700">
            <LucideVariable className="h-5 w-5" />
            <span>Variables Library</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="mb-4">
            <Input
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>
          
          <Tabs defaultValue="custom" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="custom" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Custom Variables
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                System Variables
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="mt-0">
              {/* New variable form */}
              <div className="p-4 mb-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                  {editingIndex !== null ? "Edit Variable" : "New Custom Variable"}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-md text-xs text-gray-500">
                        variables.
                      </span>
                      <Input
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        placeholder="my_variable"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <select
                      value={newVarType}
                      onChange={(e) => setNewVarType(e.target.value)}
                      className="w-full h-9 px-3 py-1 bg-white border border-gray-200 rounded-md text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                  <Input
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    placeholder="Variable value"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  {editingIndex !== null && (
                    <button
                      onClick={resetForm}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSaveVariable}
                    className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 flex items-center gap-1"
                  >
                    <LucidePlus size={14} />
                    {editingIndex !== null ? "Update" : "Add"} Variable
                  </button>
                </div>
              </div>
              
              {/* Custom variables list */}
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-100">
                {filteredCustomVariables.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? "No matching variables found" : "No custom variables yet"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredCustomVariables.map((variable, index) => (
                      <div 
                        key={index}
                        className="p-3 hover:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded text-xs font-medium",
                              getVariableCategoryStyle(variable.name)
                            )}>
                              {variable.name}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {variable.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-[400px]">
                            Value: {variable.value}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditVariable(index)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                            title="Edit variable"
                          >
                            <LucidePencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVariable(index)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete variable"
                          >
                            <LucideTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="mt-0">
              {/* System variables category filter */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button 
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${categoryFilter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  <LucideVariable size={14} />
                  All
                </button>
                <button 
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${categoryFilter === 'task' ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  onClick={() => setCategoryFilter('task')}
                >
                  <LucideClipboardCheck size={14} />
                  Task
                </button>
                <button 
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${categoryFilter === 'user' ? 'bg-purple-100 text-purple-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                  onClick={() => setCategoryFilter('user')}
                >
                  <LucideUser size={14} />
                  User
                </button>
                <button 
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${categoryFilter === 'project' ? 'bg-green-100 text-green-700' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  onClick={() => setCategoryFilter('project')}
                >
                  <LucideFolder size={14} />
                  Project
                </button>
                <button 
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors ${categoryFilter === 'trigger' ? 'bg-orange-100 text-orange-700' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                  onClick={() => setCategoryFilter('trigger')}
                >
                  <LucideFlame size={14} />
                  Trigger
                </button>
              </div>
              
              {/* System variables list */}
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-100">
                {filteredSystemVariables.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No matching variables found
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSystemVariables.map((variable, index) => (
                      <div 
                        key={index}
                        className="p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium",
                            getVariableCategoryStyle(variable.name)
                          )}>
                            {variable.name}
                          </span>
                          {variable.type && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {variable.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {variable.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomVariablesModal;
