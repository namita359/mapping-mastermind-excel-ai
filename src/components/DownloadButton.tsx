
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MappingFile } from "@/lib/types";

interface DownloadButtonProps {
  mappingFile: MappingFile;
}

const DownloadButton = ({ mappingFile }: DownloadButtonProps) => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const downloadAsJson = () => {
    setDownloading(true);
    try {
      const jsonData = JSON.stringify(mappingFile, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mappingFile.name.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download complete",
        description: "Your mapping file has been downloaded as JSON",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your file",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsCsv = () => {
    setDownloading(true);
    try {
      // Create CSV header
      const header = "Source Column,Source Data Type,Target Column,Target Data Type,Transformation,Status\n";
      
      // Create CSV rows
      const rows = mappingFile.rows.map(row => [
        row.sourceColumn.name,
        row.sourceColumn.dataType,
        row.targetColumn.name,
        row.targetColumn.dataType,
        row.transformation || "Direct Copy",
        row.status
      ].join(",")).join("\n");
      
      const csvData = header + rows;
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${mappingFile.name.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download complete",
        description: "Your mapping file has been downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your file",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={downloading}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={downloadAsCsv}>
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsJson}>
          Download as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadButton;
