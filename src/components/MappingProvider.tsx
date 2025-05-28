
import React, { createContext, useContext, useState } from 'react';
import { MappingFile, MappingRow, MappingStatus } from '@/lib/types';
import { createEmptyMappingFile } from '@/lib/fileUtils';

interface MappingContextType {
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
}

const MappingContext = createContext<MappingContextType | undefined>(undefined);

export const useMappingContext = () => {
  const context = useContext(MappingContext);
  if (!context) {
    throw new Error('useMappingContext must be used within a MappingProvider');
  }
  return context;
};

interface MappingProviderProps {
  children: React.ReactNode;
}

export const MappingProvider = ({ children }: MappingProviderProps) => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [searchResults, setSearchResults] = useState<MappingRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MappingStatus | null>(null);

  const value = {
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
  };

  return (
    <MappingContext.Provider value={value}>
      {children}
    </MappingContext.Provider>
  );
};
