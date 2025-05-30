
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MappingFile } from '@/lib/types';
import { createEmptyMappingFile } from '@/lib/fileUtils';
import { createAzureSqlBackendService } from '@/lib/azureSqlBackendService';

export const useAzureSqlDataLoader = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const backendService = createAzureSqlBackendService();
        
        // Check if backend is available
        const isHealthy = await backendService.healthCheck();
        if (!isHealthy) {
          toast({
            title: "Backend service unavailable",
            description: "Cannot connect to the backend API. Please check if the service is running.",
            variant: "destructive"
          });
          return;
        }
        
        const files = await backendService.loadMappingFiles();
        
        if (files.length > 0) {
          setMappingFile(files[0]);
          toast({
            title: "Data loaded",
            description: `Loaded ${files[0].rows.length} mappings from Azure SQL Database`,
          });
        } else {
          console.log("No mapping files found in Azure SQL Database");
          toast({
            title: "No data found",
            description: "No mapping files found. You can import a file to get started.",
          });
        }
      } catch (error) {
        console.error('Error loading from Azure SQL Backend:', error);
        toast({
          title: "Error loading data",
          description: `Failed to load mapping data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  return {
    mappingFile,
    setMappingFile,
    isLoading
  };
};
