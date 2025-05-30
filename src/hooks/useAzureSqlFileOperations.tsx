
import { useToast } from '@/hooks/use-toast';
import { MappingFile, MappingRow } from '@/lib/types';
import { createAzureSqlBackendService } from '@/lib/azureSqlBackendService';

export const useAzureSqlFileOperations = (
  mappingFile: MappingFile,
  setMappingFile: (file: MappingFile) => void
) => {
  const { toast } = useToast();

  const handleFileUpload = async (file: File, importedMappingFile?: MappingFile) => {
    if (importedMappingFile) {
      try {
        const backendService = createAzureSqlBackendService();
        await backendService.saveMappingFile(importedMappingFile);
        setMappingFile(importedMappingFile);
        
        toast({
          title: "Mapping file imported and saved",
          description: `${importedMappingFile.rows.length} mappings loaded and saved to Azure SQL Database`,
        });
      } catch (error) {
        console.error('Error saving imported file:', error);
        toast({
          title: "Import successful, save failed",
          description: `File was imported but failed to save to Azure SQL Database: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        setMappingFile(importedMappingFile);
      }
      return;
    }
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been processed`,
    });
  };

  const handleAddMapping = async (newRow: MappingRow) => {
    try {
      const updatedFile = {
        ...mappingFile,
        rows: [...mappingFile.rows, newRow]
      };
      
      const backendService = createAzureSqlBackendService();
      await backendService.saveMappingFile(updatedFile);
      setMappingFile(updatedFile);
      
      toast({
        title: "Mapping Added",
        description: `New mapping saved to Azure SQL Database successfully.`,
      });
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast({
        title: "Error",
        description: `Failed to save new mapping to Azure SQL Database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return {
    handleFileUpload,
    handleAddMapping
  };
};
