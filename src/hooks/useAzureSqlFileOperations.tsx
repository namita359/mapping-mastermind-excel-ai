
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

  const handleAddMapping = async (newRow: MappingRow) => {
    console.log('useAzureSqlFileOperations - handleAddMapping called with:', newRow);
    
    try {
      setIsUploading(true);
      
      // Add to Supabase database using the correct method name
      await azureSqlService.createMappingRow(newRow);
      console.log('useAzureSqlFileOperations - Mapping saved to database successfully');
      
      // Update local state immediately
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
        description: `New mapping from ${newRow.sourceColumn.malcode}.${newRow.sourceColumn.table}.${newRow.sourceColumn.column} to ${newRow.targetColumn.malcode}.${newRow.targetColumn.table}.${newRow.targetColumn.column} has been saved.`,
      });
      
    } catch (error) {
      console.error('useAzureSqlFileOperations - Error adding mapping:', error);
      toast({
        title: "Error Adding Mapping",
        description: error instanceof Error ? error.message : "Failed to save mapping to database. Please try again.",
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
