
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LucideVariable, 
  Plus, 
  Pencil, 
  X, 
  Check, 
  Info, 
  Search,
  Database,
  Settings,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { 
  addCustomVariable, 
  getCustomVariables, 
  removeCustomVariable, 
  updateCustomVariable,
  getAvailableVariables
} from "@/utils/formUtils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface CustomVariablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariableFormState {
  name: string;
  description: string;
  value: string;
  type: string;
}

const CustomVariablesModal = ({ open, onOpenChange }: CustomVariablesModalProps) => {
  const [variables, setVariables] = useState<any[]>([]);
  const [systemVariables, setSystemVariables] = useState<any[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentVar, setCurrentVar] = useState<VariableFormState>({
    name: "",
    description: "",
    value: "",
    type: "text"
  });
  const [editingVarId, setEditingVarId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentSystemCategory, setCurrentSystemCategory] = useState<string>("");

  // Load custom variables when modal opens
  useEffect(() => {
    if (open) {
      loadVariables();
      loadSystemVariables();
    }
  }, [open]);

  const loadVariables = () => {
    const customVars = getCustomVariables();
    setVariables(customVars);
  };

  const loadSystemVariables = () => {
    const allVars = getAvailableVariables().filter(v => !v.name.startsWith('variables.'));
    setSystemVariables(allVars);
  };

  const resetForm = () => {
    setCurrentVar({
      name: "",
      description: "",
      value: "",
      type: "text"
    });
    setEditMode(false);
    setEditingVarId(null);
  };

  const handleCreateVariable = () => {
    // Validation
    if (!currentVar.name.trim()) {
      toast.error("Variable name is required");
      return;
    }

    // Only allow alphanumeric and underscores for variable names
    if (!/^[a-zA-Z0-9_]+$/.test(currentVar.name)) {
      toast.error("Variable name can only contain letters, numbers, and underscores");
      return;
    }

    try {
      // For new variables
      if (!editMode) {
        addCustomVariable({
          name: `variables.${currentVar.name}`,
          description: currentVar.description || `Custom variable: ${currentVar.name}`,
          value: currentVar.value,
          type: currentVar.type
        });
        toast.success("Variable created successfully");
      } 
      // For editing existing variables
      else if (editingVarId) {
        updateCustomVariable(
          editingVarId,
          {
            name: `variables.${currentVar.name}`,
            description: currentVar.description || `Custom variable: ${currentVar.name}`,
            value: currentVar.value,
            type: currentVar.type
          }
        );
        toast.success("Variable updated successfully");
      }
      
      // Reset form and reload variables
      resetForm();
      loadVariables();
    } catch (error) {
      toast.error("Error saving variable");
      console.error(error);
    }
  };

  const handleEditVariable = (variable: any) => {
    // Extract the variable name without the 'variables.' prefix
    const nameWithoutPrefix = variable.name.replace('variables.', '');
    
    setCurrentVar({
      name: nameWithoutPrefix,
      description: variable.description,
      value: variable.value || "",
      type: variable.type || "text"
    });
    setEditMode(true);
    setEditingVarId(variable.name);
  };

  const handleDeleteVariable = (variableName: string) => {
    try {
      removeCustomVariable(variableName);
      toast.success("Variable deleted successfully");
      loadVariables();
    } catch (error) {
      toast.error("Error deleting variable");
      console.error(error);
    }
  };

  // Filter variables based on search term
  const filteredVariables = variables.filter(variable => 
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    variable.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSystemVariables = systemVariables.filter(variable => {
    const matchesSearch = !searchTerm || 
      variable.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      variable.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !currentSystemCategory || 
      (currentSystemCategory === 'task' && variable.name.startsWith('task.')) ||
      (currentSystemCategory === 'user' && (variable.name.startsWith('current_user.') || variable.name.startsWith('trigger.user.'))) ||
      (currentSystemCategory === 'project' && variable.name.startsWith('project.')) ||
      (currentSystemCategory === 'trigger' && variable.name.startsWith('trigger.') && !variable.name.startsWith('trigger.user.'));
    
    return matchesSearch && matchesCategory;
  });

  // Group system variables by category
  const systemCategories = [
    { id: '', label: 'All' },
    { id: 'task', label: 'Task' },
    { id: 'user', label: 'User' },
    { id: 'project', label: 'Project' },
    { id: 'trigger', label: 'Trigger' }
  ];

  // Get variable badge color based on name
  const getVariableBadgeColor = (name: string) => {
    if (name.startsWith('task.')) return 'bg-blue-50 text-blue-600';
    if (name.startsWith('current_user.') || name.startsWith('trigger.user.')) return 'bg-purple-50 text-purple-600';
    if (name.startsWith('project.')) return 'bg-green-50 text-green-600';
    if (name.startsWith('trigger.') && !name.startsWith('trigger.user.')) return 'bg-orange-50 text-orange-600';
    if (name.startsWith('variables.')) return 'bg-indigo-50 text-indigo-600';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <LucideVariable className="h-5 w-5 text-indigo-600" />
              <span className="text-indigo-900">Variables Library</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="w-full pl-9 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-lg"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="custom" 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                Custom Variables
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
              >
                System Variables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="mt-0">
              <div className="flex justify-end mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2 items-center rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                      New Variable
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <div className="flex flex-col h-full">
                      <div className="space-y-1 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          {editMode ? (
                            <>
                              <Pencil className="h-5 w-5 text-amber-500" />
                              Edit Variable
                            </>
                          ) : (
                            <>
                              <Plus className="h-5 w-5 text-indigo-500" />
                              Create Variable
                            </>
                          )}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {editMode
                            ? "Update your custom variable details"
                            : "Define a new variable to use in your workflow"}
                        </p>
                      </div>

                      <div className="space-y-5 flex-1">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Variable Name</label>
                          <div className="flex items-center">
                            <span className="bg-gray-100 px-3 py-2 rounded-l-md text-gray-500 border border-gray-200 border-r-0 text-sm">
                              variables.
                            </span>
                            <Input
                              value={currentVar.name}
                              onChange={(e) => setCurrentVar({ ...currentVar, name: e.target.value })}
                              placeholder="my_variable"
                              className="rounded-l-none border-gray-200"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Use only letters, numbers, and underscores
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <Input
                            value={currentVar.description}
                            onChange={(e) => setCurrentVar({ ...currentVar, description: e.target.value })}
                            placeholder="Describe what this variable is used for"
                            className="border-gray-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Type</label>
                          <select
                            value={currentVar.type}
                            onChange={(e) => setCurrentVar({ ...currentVar, type: e.target.value })}
                            className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="date">Date</option>
                            <option value="status">Status</option>
                            <option value="priority">Priority</option>
                            <option value="assignee">Assignee</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Default Value (Optional)</label>
                          <Input
                            value={currentVar.value}
                            onChange={(e) => setCurrentVar({ ...currentVar, value: e.target.value })}
                            placeholder="Initial value"
                            className="border-gray-200"
                          />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start gap-2 mt-6">
                          <Info className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Variables are accessible throughout your workflow</p>
                            <p className="mt-1 text-xs">Access them via the variable selector in any input that supports expressions</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={resetForm}
                          className="border-gray-200"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateVariable}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          {editMode ? "Update Variable" : "Create Variable"}
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {filteredVariables.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <LucideVariable className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No custom variables yet</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    {searchTerm 
                      ? "No variables match your search criteria" 
                      : "Create your first variable to make your workflows more powerful"}
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Variable
                      </Button>
                    </SheetTrigger>
                    {/* We don't need to duplicate the SheetContent here as it's already defined above */}
                  </Sheet>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredVariables.map((variable) => (
                    <div key={variable.name} className="group flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                      <div className="flex-1 overflow-hidden pr-4">
                        <div className="font-medium text-gray-800">{variable.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{variable.description}</div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {variable.type || "text"}
                          </span>
                          {variable.value && (
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 max-w-[200px] truncate">
                              Value: {variable.value}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditVariable(variable)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteVariable(variable.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="system" className="mt-0">
              <div className="mb-4 flex flex-wrap gap-2">
                {systemCategories.map(category => (
                  <button
                    key={category.id}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full transition-colors",
                      currentSystemCategory === category.id
                        ? "bg-indigo-100 text-indigo-700 font-medium"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    onClick={() => setCurrentSystemCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                {filteredSystemVariables.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                    <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">No system variables found</p>
                    <p className="text-sm mt-1">Try adjusting your search or category filter</p>
                  </div>
                ) : (
                  filteredSystemVariables.map((variable) => (
                    <div key={variable.name} className="p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getVariableBadgeColor(variable.name))}>
                          {variable.name.split('.')[0]}
                        </span>
                        <span className="text-gray-800 font-medium">{variable.name}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{variable.description}</p>
                      {variable.type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mt-2 inline-block">
                          {variable.type}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100">
          <DialogClose asChild>
            <Button className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomVariablesModal;
