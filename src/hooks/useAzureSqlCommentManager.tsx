
import { useToast } from '@/hooks/use-toast';
import { MappingFile, MappingRow } from '@/lib/types';
import { createAzureSqlBackendService } from '@/lib/azureSqlBackendService';

export const useAzureSqlCommentManager = (
  mappingFile: MappingFile,
  setMappingFile: (file: MappingFile) => void,
  selectedRow: MappingRow | null,
  setSelectedRow: (row: MappingRow | null) => void
) => {
  const { toast } = useToast();

  const handleCommentAdd = async (rowId: string, comment: string) => {
    try {
      const backendService = createAzureSqlBackendService();
      await backendService.addMappingRowComment(rowId, comment);
      
      // Update local state
      const updatedRows = mappingFile.rows.map(row => {
        if (row.id === rowId) {
          const comments = row.comments ? [...row.comments, comment] : [comment];
          return { ...row, comments };
        }
        return row;
      });
      
      setMappingFile({ ...mappingFile, rows: updatedRows });
      
      if (selectedRow && selectedRow.id === rowId) {
        const comments = selectedRow.comments ? [...selectedRow.comments, comment] : [comment];
        setSelectedRow({ ...selectedRow, comments });
      }

      toast({
        title: "Comment added",
        description: "Comment has been saved to Azure SQL Database",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: `Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return {
    handleCommentAdd
  };
};
