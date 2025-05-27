
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import MappingHeader from "@/components/MappingHeader";
import MappingFilters from "@/components/MappingFilters";
import MappingContent from "@/components/MappingContent";
import MappingModals from "@/components/MappingModals";
import MappingEmptyState from "@/components/MappingEmptyState";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createEmptyMappingFile, loadSampleMappingData } from "@/lib/fileUtils";

const Mapping = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddMappingForm, setShowAddMappingForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchResults, setSearchResults] = useState<MappingRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MappingStatus | null>(null);
  const { toast } = useToast();

  // Load sample data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Loading initial data...");
      setIsLoading(true);
      
      try {
        const sampleData = await loadSampleMappingData();
        console.log("Sample data loaded:", sampleData);
        
        if (sampleData && sampleData.rows.length > 0) {
          setMappingFile(sampleData);
          toast({
            title: "Sample data loaded",
            description: `${sampleData.rows.length} mappings loaded from sample data`,
          });
        } else {
          console.error("No sample data was loaded or data was empty");
          toast({
            title: "Error loading sample data",
            description: "Could not load sample data, please try uploading a file",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading sample data:", error);
        toast({
          title: "Error loading sample data",
          description: "An error occurred while loading sample data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, [toast]);

  const handleRowSelect = (row: MappingRow) => {
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

  const handleSearch = (query: string, filters: Record<string, string>) => {
    setSearchLoading(true);
    
    setTimeout(() => {
      let results = [...mappingFile.rows];
      
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(row => 
          row.sourceColumn.malcode.toLowerCase().includes(lowerQuery) ||
          row.sourceColumn.table.toLowerCase().includes(lowerQuery) ||
          row.sourceColumn.column.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.malcode.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.table.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.column.toLowerCase().includes(lowerQuery) ||
          (row.transformation && row.transformation.toLowerCase().includes(lowerQuery))
        );
      }
      
      if (filters.status) {
        results = results.filter(row => row.status === filters.status);
      }
      
      setSearchResults(results);
      setSearchLoading(false);
      
      toast({
        title: "Search complete",
        description: `Found ${results.length} mapping rows`,
      });
    }, 500);
  };

  const handleAISearch = (query: string) => {
    setSearchLoading(true);
    
    setTimeout(() => {
      const results = mappingFile.rows.filter(row => {
        if (query.toLowerCase().includes("transformation") || query.toLowerCase().includes("transform")) {
          return row.transformation !== undefined;
        }
        if (query.toLowerCase().includes("direct") || query.toLowerCase().includes("copy")) {
          return row.transformation === undefined;
        }
        
        return (
          row.sourceColumn.malcode.toLowerCase().includes(query.toLowerCase()) ||
          row.sourceColumn.table.toLowerCase().includes(query.toLowerCase()) ||
          row.sourceColumn.column.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.malcode.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.table.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.column.toLowerCase().includes(query.toLowerCase()) ||
          (row.transformation && row.transformation.toLowerCase().includes(query.toLowerCase()))
        );
      });
      
      setSearchResults(results);
      setSearchLoading(false);
      
      toast({
        title: "AI search complete",
        description: `Found ${results.length} mapping rows based on your query`,
      });
    }, 1000);
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

  const getFilteredRows = () => {
    let rowsToFilter = searchResults !== null ? searchResults : mappingFile.rows;
    
    if (statusFilter) {
      return rowsToFilter.filter(row => row.status === statusFilter);
    }
    
    return rowsToFilter;
  };

  const handleStatusFilterClick = (status: MappingStatus | null) => {
    setStatusFilter(currentFilter => 
      currentFilter === status ? null : status
    );
  };

  const counts = getStatusCounts();
  const rowsToDisplay = getFilteredRows();
  const hasData = mappingFile.rows.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading mapping data...</h2>
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

export default Mapping;
