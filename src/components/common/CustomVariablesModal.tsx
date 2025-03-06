
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
import { LucideVariable, Plus, Pencil, X, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { 
  addCustomVariable, 
  getCustomVariables, 
  removeCustomVariable, 
  updateCustomVariable 
} from "@/utils/formUtils";

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
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentVar, setCurrentVar] = useState<VariableFormState>({
    name: "",
    description: "",
    value: "",
    type: "text"
  });
  const [editingVarId, setEditingVarId] = useState<string | null>(null);

  // Load custom variables when modal opens
  useEffect(() => {
    if (open) {
      loadVariables();
    }
  }, [open]);

  const loadVariables = () => {
    const customVars = getCustomVariables();
    setVariables(customVars);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LucideVariable className="h-5 w-5" />
            Custom Variables
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Variables List</TabsTrigger>
            <TabsTrigger value="create">Create Variable</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {variables.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <LucideVariable className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No custom variables defined yet</p>
                <p className="text-sm mt-1">Create your first variable to use it in your workflows</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
                {variables.map((variable) => (
                  <div key={variable.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm text-blue-600">{variable.name}</div>
                      <div className="text-xs text-gray-500 truncate">{variable.description}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {variable.type || "text"}
                        </span>
                        {variable.value && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                            Value: {variable.value}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditVariable(variable)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteVariable(variable.name)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Variable Name</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-2 py-2 rounded-l-md text-gray-500 border border-gray-200 border-r-0">
                    variables.
                  </span>
                  <Input
                    value={currentVar.name}
                    onChange={(e) => setCurrentVar({ ...currentVar, name: e.target.value })}
                    placeholder="my_variable"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Use only letters, numbers, and underscores
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={currentVar.description}
                  onChange={(e) => setCurrentVar({ ...currentVar, description: e.target.value })}
                  placeholder="Describe what this variable is used for"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={currentVar.type}
                  onChange={(e) => setCurrentVar({ ...currentVar, type: e.target.value })}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="assignee">Assignee</option>
                </select>
                <p className="text-xs text-gray-500">
                  Select the data type for this variable
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Default Value (Optional)</label>
                <Input
                  value={currentVar.value}
                  onChange={(e) => setCurrentVar({ ...currentVar, value: e.target.value })}
                  placeholder="Initial value"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-start gap-2">
                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">You can use custom variables in your workflow nodes</p>
                  <p className="text-xs mt-1">Access them via the variable selector in inputs that support expressions</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleCreateVariable}
            className="flex items-center gap-1"
          >
            {editMode ? (
              <>
                <Check className="h-4 w-4" />
                Update Variable
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Variable
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomVariablesModal;
