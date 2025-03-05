
import { AutomationFlow } from "@/components/AutomationFlow";

const Index = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f8f8]">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-medium">Workflow Automation</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-opacity-90 transition-colors">
            Publish
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <AutomationFlow />
      </div>
    </div>
  );
};

export default Index;
