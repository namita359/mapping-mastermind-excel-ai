

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import MappingHeader from '@/components/MappingHeader';
import MappingContent from '@/components/MappingContent';
import MappingModals from '@/components/MappingModals';
import { SupabaseMappingProvider, useSupabaseMappingContext } from '@/components/SupabaseMappingProvider';
import { useMappingSearch } from '@/hooks/useMappingSearch';

const MappingPageContent = () => {
  const {
    mappingFile,
    selectedRow,
    statusFilter,
    isLoading,
    handleRowSelect,
    handleStatusChange,
    handleCommentAdd,
    handleFileUpload,
    handleAddMapping,
    getStatusCounts,
    handleStatusFilterClick,
  } = useSupabaseMappingContext();

  const { searchLoading, handleSearch, handleAISearch, getFilteredRows } = useMappingSearch();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddMappingModal, setShowAddMappingModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  console.log('showAIAssistant state:', showAIAssistant);

  const rowsToDisplay = getFilteredRows();
  const counts = getStatusCounts();

  const handleAIAssistantToggle = () => {
    console.log('AI Assistant toggle clicked, current state:', showAIAssistant);
    setShowAIAssistant(!showAIAssistant);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading mapping data from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MappingHeader
        mappingFile={mappingFile}
        counts={counts}
        statusFilter={statusFilter}
        searchLoading={searchLoading}
        onSearch={handleSearch}
        onAISearch={handleAISearch}
        onUpload={() => setShowUploadModal(true)}
        onAddMapping={() => setShowAddMappingModal(true)}
        onStatusFilterClick={handleStatusFilterClick}
        onAIAssistantToggle={handleAIAssistantToggle}
        showAIAssistant={showAIAssistant}
      />

      <MappingContent
        mappingFile={mappingFile}
        rowsToDisplay={rowsToDisplay}
        counts={counts}
        selectedRow={selectedRow}
        showAIAssistant={showAIAssistant}
        onRowSelect={handleRowSelect}
        onStatusChange={handleStatusChange}
        onCommentAdd={handleCommentAdd}
        onAIAssistantClose={() => setShowAIAssistant(false)}
      />

      <MappingModals
        showUploadModal={showUploadModal}
        showAddMappingModal={showAddMappingModal}
        onUploadModalClose={() => setShowUploadModal(false)}
        onAddMappingModalClose={() => setShowAddMappingModal(false)}
        onFileUpload={handleFileUpload}
        onAddMapping={handleAddMapping}
      />
    </div>
  );
};

const Mapping = () => {
  return (
    <SupabaseMappingProvider>
      <MappingPageContent />
    </SupabaseMappingProvider>
  );
};

export default Mapping;

