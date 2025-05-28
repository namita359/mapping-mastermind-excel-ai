
import { MappingStatus, MappingRow, MappingFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useMappingContext } from '@/components/MappingProvider';

export const useMappingState = () => {
  const { 
    mappingFile, 
    setMappingFile, 
    selectedRow, 
    setSelectedRow,
    statusFilter,
    setStatusFilter 
  } = useMappingContext();
  const { toast } = useToast();

  const handleRowSelect = (row: MappingRow | null) => {
    setSelectedRow(row);
  };

  const handleStatusChange = (rowId: string, status: MappingStatus) => {
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
  };

  const handleCommentAdd = (rowId: string, comment: string) => {
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
  };

  const handleFileUpload = (file: File, importedMappingFile?: MappingFile) => {
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

  const handleAddMapping = (newRow: MappingRow) => {
    const updatedRows = [...mappingFile.rows, newRow];
    setMappingFile({ ...mappingFile, rows: updatedRows });
    
    toast({
      title: "Mapping Added",
      description: `New mapping from ${newRow.sourceColumn.malcode}.${newRow.sourceColumn.table}.${newRow.sourceColumn.column} to ${newRow.targetColumn.malcode}.${newRow.targetColumn.table}.${newRow.targetColumn.column} added successfully.`,
    });
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

  const handleStatusFilterClick = (status: MappingStatus | null) => {
    const newFilter = statusFilter === status ? null : status;
    setStatusFilter(newFilter);
  };

  return {
    mappingFile,
    selectedRow,
    statusFilter,
    handleRowSelect,
    handleStatusChange,
    handleCommentAdd,
    handleFileUpload,
    handleAddMapping,
    getStatusCounts,
    handleStatusFilterClick,
  };
};
