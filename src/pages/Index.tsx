
import { useState } from "react";
import { AutomationFlow } from "@/components/AutomationFlow";
import { toast } from "sonner";

const Index = () => {
  const [flowData, setFlowData] = useState(null);

  const handlePublish = () => {
    if (!flowData) {
      toast.error("No workflow data available", {
        description: "Please create a workflow before publishing",
      });
      return;
    }

    // In a real application, this would save to a database
    console.log("Publishing workflow:", flowData);
    
    // Log variables used in the flow
    const variablesUsed = extractVariablesFromFlow(flowData);
    console.log("Variables used in workflow:", variablesUsed);
    
    toast.success("Workflow published", {
      description: "Your workflow has been published successfully",
    });
  };

  // Extract all variables used in the flow
  const extractVariablesFromFlow = (flow) => {
    const variables = new Set();
    
    // Process nodes to find variables
    flow.nodes.forEach(node => {
      // Check for variables in form fields, conditions, etc.
      if (node.data?.formFields) {
        Object.values(node.data.formFields).forEach(value => {
          extractVariablesFromString(String(value), variables);
        });
      }
      
      if (node.data?.leftOperand) {
        extractVariablesFromString(node.data.leftOperand, variables);
      }
      
      if (node.data?.rightOperand) {
        extractVariablesFromString(node.data.rightOperand, variables);
      }
    });
    
    return Array.from(variables);
  };
  
  // Helper to extract variables from a string with pattern {{variable}}
  const extractVariablesFromString = (str, variablesSet) => {
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      variablesSet.add(match[1]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f8f8]">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium">Workflow Automation</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Save Draft
          </button>
          <button 
            className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-opacity-90 transition-colors"
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <AutomationFlow onFlowChange={setFlowData} />
      </div>
    </div>
  );
};

export default Index;
