
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { loadSampleMappingData } from '@/lib/fileUtils';
import { useMappingContext } from './MappingProvider';

interface MappingDataLoaderProps {
  onLoadingChange: (loading: boolean) => void;
}

const MappingDataLoader = ({ onLoadingChange }: MappingDataLoaderProps) => {
  const { setMappingFile } = useMappingContext();
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Attempting to load data from Excel file...");
      onLoadingChange(true);
      
      try {
        const excelData = await loadSampleMappingData();
        console.log("Excel data loaded:", excelData);
        
        if (excelData && excelData.rows.length > 0) {
          setMappingFile(excelData);
          const approvedCount = excelData.rows.filter(row => row.status === 'approved').length;
          toast({
            title: "Excel data loaded successfully",
            description: `${excelData.rows.length} mappings loaded from data.xlsx (${approvedCount} auto-approved)`,
          });
        } else {
          console.log("No Excel data found, starting with empty mapping file");
          // Don't show error toast, just start with empty state
        }
      } catch (error) {
        console.error("Error loading Excel data:", error);
        // Don't show error toast, just start with empty state
        console.log("Starting with empty mapping file");
      } finally {
        // Always stop loading, regardless of success or failure
        onLoadingChange(false);
      }
    };
    
    loadInitialData();
  }, [setMappingFile, toast, onLoadingChange]);

  return null;
};

export default MappingDataLoader;
