
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { parseCSVFile, convertCSVToMappingData } from "@/lib/csvUtils";
import { MappingFile } from "@/lib/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, mappingData?: MappingFile) => void;
}

const UploadModal = ({ isOpen, onClose, onUpload }: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // For CSV reading, prioritize CSV files
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Check if file is CSV
    if (fileExtension !== '.csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file for mapping data.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    try {
      setProcessing(true);
      
      // Process CSV file
      if (file.name.endsWith('.csv')) {
        const csvData = await parseCSVFile(file);
        const mappings = convertCSVToMappingData(csvData);
        
        if (mappings.length === 0) {
          toast({
            title: "Error processing CSV",
            description: "No valid mapping data found in the CSV file.",
            variant: "destructive"
          });
          setProcessing(false);
          return;
        }
        
        // Convert to MappingFile format
        const mappingFile: MappingFile = {
          id: `file-${Date.now()}`,
          name: file.name.replace('.csv', ''),
          sourceSystem: "CSV Import",
          targetSystem: "Data Warehouse",
          rows: mappings.map((mapping, index) => ({
            id: `row-${Date.now()}-${index}`,
            sourceColumn: {
              id: `src-${Date.now()}-${index}`,
              name: mapping.sourceColumn,
              dataType: mapping.sourceDataType,
              description: mapping.sourceDescription,
              isPrimaryKey: mapping.sourceIsPrimaryKey,
              isNullable: mapping.sourceIsNullable
            },
            targetColumn: {
              id: `tgt-${Date.now()}-${index}`,
              name: mapping.targetColumn,
              dataType: mapping.targetDataType,
              description: mapping.targetDescription,
              isPrimaryKey: mapping.targetIsPrimaryKey,
              isNullable: mapping.targetIsNullable
            },
            transformation: mapping.transformation,
            status: "pending",
            createdBy: "CSV Import",
            createdAt: new Date(),
          })),
          status: "draft",
          createdBy: "CSV Import",
          createdAt: new Date()
        };
        
        onUpload(file, mappingFile);
        
        toast({
          title: "CSV Processed Successfully",
          description: `Imported ${mappingFile.rows.length} mapping rows`,
        });
      } else {
        // For other file types, just pass the file
        onUpload(file);
      }
      
      setFile(null);
      onClose();
    } catch (error) {
      toast({
        title: "Error processing file",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Mapping File</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your source-to-target mappings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm font-medium">
                Drag and drop your CSV file here, or{" "}
                <label className="text-blue-500 cursor-pointer hover:text-blue-600">
                  browse
                  <Input
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">
                Supports CSV files with mapping data
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || processing}>
            {processing ? "Processing..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
