
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface MappingEmptyStateProps {
  onAddMappingClick: () => void;
  onUploadClick: () => void;
}

const MappingEmptyState = ({ onAddMappingClick, onUploadClick }: MappingEmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold mb-2">No Mapping Data Available</h2>
        <p className="text-gray-500 mb-6">
          Upload a CSV or Excel file containing your source-to-target mappings to get started or add a mapping manually
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onAddMappingClick} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add Mapping
          </Button>
          <Button onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" /> Upload File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MappingEmptyState;
