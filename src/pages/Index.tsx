
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Data Mapping Portal</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create, manage, and review source-to-target mappings with advanced features
        </p>
        <div className="space-y-4">
          <Link to="/mapping">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Open Mapping Tool
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
