
import { useState } from 'react';
import { MappingRow, MappingStatus } from '@/lib/types';
import { useAzureSqlDataLoader } from './useAzureSqlDataLoader';
import { useAzureSqlStatusManager } from './useAzureSqlStatusManager';
import { useAzureSqlCommentManager } from './useAzureSqlCommentManager';
import { useAzureSqlFileOperations } from './useAzureSqlFileOperations';

export const useAzureSqlMapping = () => {
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [searchResults, setSearchResults] = useState<MappingRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MappingStatus | null>(null);

  // Use the smaller, focused hooks
  const { mappingFile, setMappingFile, isLoading } = useAzureSqlDataLoader();
  
  const { handleStatusChange, getStatusCounts } = useAzureSqlStatusManager(
    mappingFile,
    setMappingFile,
    selectedRow,
    setSelectedRow
  );
  
  const { handleCommentAdd } = useAzureSqlCommentManager(
    mappingFile,
    setMappingFile,
    selectedRow,
    setSelectedRow
  );
  
  const { handleFileUpload, handleAddMapping } = useAzureSqlFileOperations(
    mappingFile,
    setMappingFile
  );

  const handleRowSelect = (row: MappingRow | null) => {
    setSelectedRow(row);
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
