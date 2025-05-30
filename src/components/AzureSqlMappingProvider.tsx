
import React, { createContext, useContext } from 'react';
import { MappingFile, MappingRow, MappingStatus } from '@/lib/types';
import { useAzureSqlMapping } from '@/hooks/useAzureSqlMapping';

interface AzureSqlMappingContextType {
  mappingFile: MappingFile;
  setMappingFile: (file: MappingFile) => void;
  selectedRow: MappingRow | null;
  setSelectedRow: (row: MappingRow | null) => void;
  searchResults: MappingRow[] | null;
  setSearchResults: (results: MappingRow[] | null) => void;
  searchLoading: boolean;
  setSearchLoading: (loading: boolean) => void;
  statusFilter: MappingStatus | null;
  setStatusFilter: (filter: MappingStatus | null) => void;
  isLoading: boolean;
  handleRowSelect: (row: MappingRow | null) => void;
  handleStatusChange: (rowId: string, status: MappingStatus) => void;
  handleCommentAdd: (rowId: string, comment: string) => void;
  handleFileUpload: (file: File, importedMappingFile?: MappingFile) => void;
  handleAddMapping: (newRow: MappingRow) => void;
  getStatusCounts: () => { approved: number; pending: number; rejected: number; draft: number };
  handleStatusFilterClick: (status: MappingStatus | null) => void;
}

const AzureSqlMappingContext = createContext<AzureSqlMappingContextType | undefined>(undefined);

export const useAzureSqlMappingContext = () => {
  const context = useContext(AzureSqlMappingContext);
  if (!context) {
    throw new Error('useAzureSqlMappingContext must be used within an AzureSqlMappingProvider');
  }
  return context;
};

interface AzureSqlMappingProviderProps {
  children: React.ReactNode;
}

export const AzureSqlMappingProvider = ({ children }: AzureSqlMappingProviderProps) => {
  const azureSqlMapping = useAzureSqlMapping();

  return (
    <AzureSqlMappingContext.Provider value={azureSqlMapping}>
      {children}
    </AzureSqlMappingContext.Provider>
  );
};
