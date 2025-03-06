
// Helper functions for dynamic form rendering and validation

// Function to check if a string contains a variable expression {{var}}
export const containsExpression = (value: string): boolean => {
  return /\{\{.*?\}\}/.test(value);
};

// Function to extract variables from an expression string
export const extractVariables = (expression: string): string[] => {
  const regex = /\{\{(.*?)\}\}/g;
  const matches = [];
  let match;
  
  while ((match = regex.exec(expression)) !== null) {
    matches.push(match[1].trim());
  }
  
  return matches;
};

// Validate if an expression is valid (has proper format)
export const validateExpression = (expression: string): boolean => {
  // Simple validation for now - just check if brackets are balanced
  return (
    expression.startsWith("{{") && 
    expression.endsWith("}}") && 
    expression.split("{{").length === expression.split("}}").length
  );
};

// Define variable types for compatibility checking
interface Variable {
  name: string;
  description: string;
  type?: string; // Added type field to track data type
}

// Available variables in the system for autocomplete
export const getAvailableVariables = (): Variable[] => {
  return [
    // Task variables
    { name: "task.title", description: "The title of the task", type: "text" },
    { name: "task.description", description: "The description of the task", type: "text" },
    { name: "task.status", description: "The current status of the task", type: "status" },
    { name: "task.priority", description: "The priority level of the task", type: "priority" },
    { name: "task.assignee", description: "The person assigned to the task", type: "assignee" },
    { name: "task.due_date", description: "The due date of the task", type: "date" },
    { name: "task.story_points", description: "The story points assigned to the task", type: "number" },
    { name: "task.created_at", description: "When the task was created", type: "date" },
    { name: "task.updated_at", description: "When the task was last updated", type: "date" },
    
    // Project variables
    { name: "project.name", description: "The name of the project", type: "text" },
    { name: "project.owner", description: "The owner of the project", type: "assignee" },
    { name: "project.team", description: "The team assigned to the project", type: "team" },
    
    // User variables
    { name: "current_user.name", description: "The name of the current user", type: "text" },
    { name: "current_user.email", description: "The email of the current user", type: "email" },
    { name: "current_user.role", description: "The role of the current user", type: "text" },
    
    // Trigger variables
    { name: "trigger.user.name", description: "Name of the user who triggered the workflow", type: "text" },
    { name: "trigger.user.email", description: "Email of the user who triggered the workflow", type: "email" },
    { name: "trigger.user.role", description: "Role of the user who triggered the workflow", type: "text" },
    { name: "trigger.timestamp", description: "When the workflow was triggered", type: "date" },
    
    // Custom variables (example)
    { name: "variables.approval_threshold", description: "Custom approval threshold", type: "number" },
    { name: "variables.team_capacity", description: "Current team capacity", type: "number" },
    { name: "variables.priority_factor", description: "Custom priority calculation factor", type: "number" },
  ];
};

// Get the type of a variable given its name
export const getVariableType = (variableName: string): string => {
  // If it's an expression, extract the variable name
  if (containsExpression(variableName)) {
    const extractedVars = extractVariables(variableName);
    if (extractedVars.length > 0) {
      variableName = extractedVars[0];
    } else {
      return "text"; // Default to text if we can't extract a variable
    }
  }
  
  const variables = getAvailableVariables();
  const variable = variables.find(v => v.name === variableName);
  
  return variable?.type || "text"; // Default to text if not found
};

// Get compatible variables based on a given variable name
export const getCompatibleVariables = (variableName: string): Variable[] => {
  // Extract variable name from an expression if needed
  if (containsExpression(variableName)) {
    const extractedVars = extractVariables(variableName);
    if (extractedVars.length > 0) {
      variableName = extractedVars[0];
    }
  }
  
  // Get the type of the source variable
  const sourceType = getVariableType(variableName);
  const allVariables = getAvailableVariables();
  
  // Filter variables with the same type
  return allVariables.filter(v => v.type === sourceType);
};

// Get compatible options for right-side operand based on left-side variable
export const getCompatibleOptions = async (variableName: string) => {
  const type = getVariableType(variableName);
  let options: { value: string, label: string }[] = [];
  
  switch (type) {
    case "status":
      const statuses = await fetchOptionsForField("status");
      options = statuses.map(status => ({ 
        value: status.toLowerCase().replace(' ', '_'), 
        label: status 
      }));
      break;
    case "priority":
      const priorities = await fetchOptionsForField("priority");
      options = priorities.map(priority => ({ 
        value: priority.toLowerCase().replace(' ', '_'), 
        label: priority 
      }));
      break;
    case "assignee":
      const assignees = await fetchOptionsForField("assignee");
      options = assignees.map(assignee => ({ 
        value: assignee.toLowerCase().replace(' ', '_'), 
        label: assignee 
      }));
      break;
    case "team":
      const teams = await fetchOptionsForField("team");
      options = teams.map(team => ({ 
        value: team.toLowerCase().replace(' ', '_'), 
        label: team 
      }));
      break;
    // Add more specific mappings as needed
  }
  
  return options;
};

// Fetch options for dropdowns based on the field type
export const fetchOptionsForField = async (fieldType: string): Promise<string[]> => {
  // In a real app, this would connect to your backend
  // For now, we'll return dummy data based on the field type
  
  switch (fieldType) {
    case "status":
      return ["To Do", "In Progress", "In Review", "Completed"];
    case "priority":
      return ["Low", "Medium", "High", "Urgent"];
    case "assignee":
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson"];
    case "team":
      return ["Engineering", "Design", "Marketing", "Sales", "Support"];
    case "story_points":
      return ["1", "2", "3", "5", "8", "13"];
    default:
      return [];
  }
};

// Validate a form field based on its type and value
export const validateField = (type: string, value: any): string | null => {
  if (value === undefined || value === null || value === "") {
    return "This field is required";
  }
  
  // If it's an expression, validate the expression format
  if (typeof value === "string" && containsExpression(value)) {
    return validateExpression(value) ? null : "Invalid expression format";
  }
  
  // Add specific validations based on type
  switch (type) {
    case "email":
      return /\S+@\S+\.\S+/.test(value) ? null : "Invalid email format";
    case "number":
      return isNaN(Number(value)) ? "Must be a number" : null;
    default:
      return null; // No validation errors
  }
};
