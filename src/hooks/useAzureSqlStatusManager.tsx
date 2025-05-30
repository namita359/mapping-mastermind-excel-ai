
import { useToast } from '@/hooks/use-toast';
import { MappingFile, MappingRow, MappingStatus } from '@/lib/types';
import { createAzureSqlBackendService } from '@/lib/azureSqlBackendService';

export const useAzureSqlStatusManager = (
  mappingFile: MappingFile,
  setMappingFile: (file: MappingFile) => void,
  selectedRow: MappingRow | null,
  setSelectedRow: (row: MappingRow | null) => void
) => {
  const { toast } = useToast();

  const handleStatusChange = async (rowId: string, status: MappingStatus) => {
    try {
      const backendService = createAzureSqlBackendService();
      await backendService.updateMappingRowStatus(rowId, status, "Current User");
      
      // Update local state
      const updatedRows = mappingFile.rows.map(row => 
        row.id === rowId 
          ? { ...row, status, reviewedAt: new Date(), reviewer: "Current User" } 
          : row
      );
      
      setMappingFile({ ...mappingFile, rows: updatedRows });
      
      if (selectedRow && selectedRow.id === rowId) {
        setSelectedRow({ ...selectedRow, status, reviewedAt: new Date(), reviewer: "Current User" });
      }
      
      toast({
        title: "Status updated",
        description: `Mapping status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: `Failed to update mapping status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const getStatusCounts = () => {
    const counts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      draft: 0
    };
    
    mappingFile.rows.forEach(row => {
      counts[row.status]++;
    });
    
    return counts;
  };

  return {
    handleStatusChange,
    getStatusCounts
  };
};
