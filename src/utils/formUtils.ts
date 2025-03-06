
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

// Available variables in the system for autocomplete
export const getAvailableVariables = () => {
  return [
    // Task variables
    { name: "task.title", description: "The title of the task" },
    { name: "task.description", description: "The description of the task" },
    { name: "task.status", description: "The current status of the task" },
    { name: "task.priority", description: "The priority level of the task" },
    { name: "task.assignee", description: "The person assigned to the task" },
    { name: "task.due_date", description: "The due date of the task" },
    { name: "task.story_points", description: "The story points assigned to the task" },
    { name: "task.created_at", description: "When the task was created" },
    { name: "task.updated_at", description: "When the task was last updated" },
    
    // Project variables
    { name: "project.name", description: "The name of the project" },
    { name: "project.owner", description: "The owner of the project" },
    { name: "project.team", description: "The team assigned to the project" },
    
    // User variables
    { name: "current_user.name", description: "The name of the current user" },
    { name: "current_user.email", description: "The email of the current user" },
    { name: "current_user.role", description: "The role of the current user" },
    
    // Trigger variables
    { name: "trigger.user.name", description: "Name of the user who triggered the workflow" },
    { name: "trigger.user.email", description: "Email of the user who triggered the workflow" },
    { name: "trigger.user.role", description: "Role of the user who triggered the workflow" },
    { name: "trigger.timestamp", description: "When the workflow was triggered" },
    
    // Custom variables (example)
    { name: "variables.approval_threshold", description: "Custom approval threshold" },
    { name: "variables.team_capacity", description: "Current team capacity" },
    { name: "variables.priority_factor", description: "Custom priority calculation factor" },
  ];
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
