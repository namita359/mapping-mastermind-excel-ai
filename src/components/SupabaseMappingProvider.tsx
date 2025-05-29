
import React, { createContext, useContext } from 'react';
import { MappingFile, MappingRow, MappingStatus } from '@/lib/types';
import { useSupabaseMapping } from '@/hooks/useSupabaseMapping';

interface SupabaseMappingContextType {
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

const SupabaseMappingContext = createContext<SupabaseMappingContextType | undefined>(undefined);

export const useSupabaseMappingContext = () => {
  const context = useContext(SupabaseMappingContext);
  if (!context) {
    throw new Error('useSupabaseMappingContext must be used within a SupabaseMappingProvider');
  }
  return context;
};

interface SupabaseMappingProviderProps {
  children: React.ReactNode;
}

export const SupabaseMappingProvider = ({ children }: SupabaseMappingProviderProps) => {
  const supabaseMapping = useSupabaseMapping();

  return (
    <SupabaseMappingContext.Provider value={supabaseMapping}>
      {children}
    </SupabaseMappingContext.Provider>
  );
};
