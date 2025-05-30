
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MappingFile, MappingRow, MappingStatus } from '@/lib/types';
import { createEmptyMappingFile } from '@/lib/fileUtils';
import {
  loadMappingFiles,
  saveMappingFile,
  updateMappingRowStatus,
  addMappingRowComment,
  initializeSampleData,
} from '@/lib/azureSqlService';

export const useAzureSqlMapping = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [searchResults, setSearchResults] = useState<MappingRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MappingStatus | null>(null);
  const { toast } = useToast();

  // Load data from simulated Azure SQL on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Initialize sample data if needed
        initializeSampleData();
        
        const files = await loadMappingFiles();
        
        if (files.length > 0) {
          // Use the first file for now, or you could implement file selection
          setMappingFile(files[0]);
          toast({
            title: "Data loaded",
            description: `Loaded ${files[0].rows.length} mappings from simulated Azure SQL Database`,
          });
        } else {
          console.log("No mapping files found in simulated Azure SQL Database");
          toast({
            title: "No data found",
            description: "No mapping files found. You can import a file to get started.",
          });
        }
      } catch (error) {
        console.error('Error loading from simulated Azure SQL:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load mapping data from simulated Azure SQL Database",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleRowSelect = (row: MappingRow | null) => {
    setSelectedRow(row);
  };

  const handleStatusChange = async (rowId: string, status: MappingStatus) => {
    try {
      await updateMappingRowStatus(rowId, status, "Current User");
      
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
        description: "Failed to update mapping status",
        variant: "destructive"
      });
    }
  };

  const handleCommentAdd = async (rowId: string, comment: string) => {
    try {
      await addMappingRowComment(rowId, comment);
      
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
        description: "Comment has been saved to simulated Azure SQL Database",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File, importedMappingFile?: MappingFile) => {
    if (importedMappingFile) {
      try {
        // Save to simulated Azure SQL
        await saveMappingFile(importedMappingFile);
        setMappingFile(importedMappingFile);
        
        toast({
          title: "Mapping file imported and saved",
          description: `${importedMappingFile.rows.length} mappings loaded and saved to simulated Azure SQL Database`,
        });
      } catch (error) {
        console.error('Error saving imported file:', error);
        toast({
          title: "Import successful, save failed",
          description: "File was imported but failed to save to simulated Azure SQL Database",
          variant: "destructive"
        });
        // Still set the file locally even if save failed
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
      
      // Save to simulated Azure SQL
      await saveMappingFile(updatedFile);
      setMappingFile(updatedFile);
      
      toast({
        title: "Mapping Added",
        description: `New mapping saved to simulated Azure SQL Database successfully.`,
      });
    } catch (error) {
      console.error('Error adding mapping:', error);
      toast({
        title: "Error",
        description: "Failed to save new mapping to simulated Azure SQL Database",
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

  const handleStatusFilterClick = (status: MappingStatus | null) => {
    const newFilter = statusFilter === status ? null : status;
    setStatusFilter(newFilter);
  };

  return {
    mappingFile,
    setMappingFile,
    selectedRow,
    setSelectedRow,
    searchResults,
    setSearchResults,
    searchLoading,
    setSearchLoading,
    statusFilter,
    setStatusFilter,
    isLoading,
    handleRowSelect,
    handleStatusChange,
    handleCommentAdd,
    handleFileUpload,
    handleAddMapping,
    getStatusCounts,
    handleStatusFilterClick,
  };
};
