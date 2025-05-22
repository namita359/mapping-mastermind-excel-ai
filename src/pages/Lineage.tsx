
import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { MappingFile } from '@/lib/types';
import { loadSampleMappingData } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import LineageView from '@/components/lineage/LineageView';

const Lineage = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load sample data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await loadSampleMappingData();
        if (data) {
          setMappingFile(data);
        } else {
          toast({
            title: "Error loading data",
            description: "Could not load mapping data for lineage view",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Failed to load lineage data:", error);
        toast({
          title: "Error loading data",
          description: "An error occurred while loading lineage data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleUploadClick = () => {
    toast({
      title: "Upload",
      description: "Upload functionality not implemented in this view"
    });
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <AppSidebar onUploadClick={handleUploadClick} />
        
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Data Lineage Visualization</h1>
            <p className="text-gray-500">
              Visualize source to target mapping relationships
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading lineage data...</p>
                </div>
              </div>
            ) : mappingFile ? (
              <LineageView mappingFile={mappingFile} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border border-dashed rounded-md h-full">
                <p className="text-lg text-gray-500">No mapping data available for lineage view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Lineage;
