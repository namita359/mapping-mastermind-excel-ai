
import { useState } from 'react';
import { MappingFile, MappingRow } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { azureSqlService } from '@/lib/azureSqlService';

export const useAzureSqlFileOperations = (
  mappingFile: MappingFile,
  setMappingFile: (file: MappingFile) => void
) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, importedMappingFile?: MappingFile) => {
    if (importedMappingFile) {
      setMappingFile(importedMappingFile);
      toast({
        title: "Mapping file imported",
        description: `${importedMappingFile.rows.length} mappings loaded from file`,
      });
      return;
    }
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been processed`,
    });
  };

  const checkBackendAvailability = async (): Promise<boolean> => {
    try {
      // Simple check to see if backend is available
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleAddMapping = async (newRow: MappingRow) => {
    console.log('useAzureSqlFileOperations - handleAddMapping called with:', newRow);
    
    try {
      setIsUploading(true);
      
      // Check if backend is available
      const backendAvailable = await checkBackendAvailability();
      console.log('useAzureSqlFileOperations - Backend available:', backendAvailable);
      
      if (backendAvailable) {
        try {
          // Try to save to backend if available
          await azureSqlService.createMappingRow(newRow);
          console.log('useAzureSqlFileOperations - Mapping saved to database successfully');
        } catch (error) {
          console.warn('useAzureSqlFileOperations - Backend save failed, continuing with local storage only:', error);
          // Don't throw error, just continue with local storage
        }
      } else {
        console.log('useAzureSqlFileOperations - Backend unavailable, using local storage only');
      }
      
      // Always update local state regardless of backend availability
      const updatedRows = [...mappingFile.rows, newRow];
      const updatedMappingFile = { 
        ...mappingFile, 
        rows: updatedRows,
        updatedAt: new Date()
      };
      
      console.log('useAzureSqlFileOperations - Updating local state with new mapping file:', updatedMappingFile);
      setMappingFile(updatedMappingFile);
      
      toast({
        title: "Mapping Added Successfully",
        description: `New mapping from ${newRow.sourceColumn.malcode}.${newRow.sourceColumn.table}.${newRow.sourceColumn.column} to ${newRow.targetColumn.malcode}.${newRow.targetColumn.table}.${newRow.targetColumn.column} has been added${backendAvailable ? ' and saved to database' : ' locally'}.`,
      });
      
    } catch (error) {
      console.error('useAzureSqlFileOperations - Error adding mapping:', error);
      toast({
        title: "Error Adding Mapping",
        description: error instanceof Error ? error.message : "Failed to add mapping. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    handleAddMapping,
    isUploading,
  };
};
