
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
      console.log("Loading data from Excel file...");
      onLoadingChange(true);
      
      try {
        const excelData = await loadSampleMappingData();
        console.log("Excel data loaded:", excelData);
        
        if (excelData && excelData.rows.length > 0) {
          setMappingFile(excelData);
          const approvedCount = excelData.rows.filter(row => row.status === 'approved').length;
          toast({
            title: "Excel data loaded and auto-approved",
            description: `${excelData.rows.length} mappings loaded from data.xlsx (${approvedCount} auto-approved)`,
          });
        } else {
          console.error("No Excel data was loaded or data was empty");
          toast({
            title: "No Excel data found",
            description: "Could not load data.xlsx. Please ensure the file exists in the public folder with the correct columns.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading Excel data:", error);
        toast({
          title: "Error loading Excel data",
          description: "An error occurred while loading data.xlsx",
          variant: "destructive"
        });
      } finally {
        onLoadingChange(false);
      }
    };
    
    loadInitialData();
  }, [setMappingFile, toast, onLoadingChange]);

  return null;
};

export default MappingDataLoader;
