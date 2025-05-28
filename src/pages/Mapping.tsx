
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import MappingHeader from "@/components/MappingHeader";
import MappingFilters from "@/components/MappingFilters";
import MappingContent from "@/components/MappingContent";
import MappingModals from "@/components/MappingModals";
import MappingEmptyState from "@/components/MappingEmptyState";
import MappingDataLoader from "@/components/MappingDataLoader";
import { MappingProvider } from "@/components/MappingProvider";
import { useMappingState } from "@/hooks/useMappingState";
import { useMappingSearch } from "@/hooks/useMappingSearch";
import { useMappingUI } from "@/hooks/useMappingUI";

const MappingContent_Internal = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const {
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
  } = useMappingState();

  const {
    searchLoading,
    handleSearch,
    handleAISearch,
    getFilteredRows,
  } = useMappingSearch();

  const {
    showUploadModal,
    setShowUploadModal,
    showAddMappingForm,
    setShowAddMappingForm,
    showAIAssistant,
    setShowAIAssistant,
    showSidebar,
    setShowSidebar,
  } = useMappingUI();

  const counts = getStatusCounts();
  const rowsToDisplay = getFilteredRows();
  const hasData = mappingFile.rows.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Excel data...</h2>
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MappingDataLoader onLoadingChange={setIsLoading} />
      
      {/* Header Navigation */}
      <MappingHeader
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        hasData={hasData}
        mappingFile={mappingFile}
        onUploadClick={() => setShowUploadModal(true)}
        onAddMappingClick={() => setShowAddMappingForm(true)}
        onAIAssistantToggle={() => setShowAIAssistant(!showAIAssistant)}
        showAIAssistant={showAIAssistant}
        onSearch={handleSearch}
        onAISearch={handleAISearch}
        searchLoading={searchLoading}
      />

      {/* Status Filters - only show when data exists */}
      {hasData && (
        <div className="bg-white border-b px-4 py-2 flex justify-end">
          <MappingFilters
            counts={counts}
            statusFilter={statusFilter}
            onStatusFilterClick={handleStatusFilterClick}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Collapsible Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r shadow-sm flex-shrink-0">
            <SidebarProvider>
              <AppSidebar
                onUploadClick={() => setShowUploadModal(true)}
                onDownloadClick={() => {}}
              />
            </SidebarProvider>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden min-w-0">
          {hasData ? (
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
          ) : (
            <MappingEmptyState
              onAddMappingClick={() => setShowAddMappingForm(true)}
              onUploadClick={() => setShowUploadModal(true)}
            />
          )}
        </div>
      </div>
      
      {/* Modals */}
      <MappingModals
        showUploadModal={showUploadModal}
        showAddMappingForm={showAddMappingForm}
        mappingFile={mappingFile}
        onUploadModalClose={() => setShowUploadModal(false)}
        onAddMappingFormClose={() => setShowAddMappingForm(false)}
        onFileUpload={handleFileUpload}
        onAddMapping={handleAddMapping}
      />
    </div>
  );
};

const Mapping = () => {
  return (
    <MappingProvider>
      <MappingContent_Internal />
    </MappingProvider>
  );
};

export default Mapping;
