import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import MappingTable from "@/components/MappingTable";
import SearchBar from "@/components/SearchBar";
import UploadModal from "@/components/UploadModal";
import DownloadButton from "@/components/DownloadButton";
import ReviewPanel from "@/components/ReviewPanel";
import AIAssistant from "@/components/AIAssistant";
import AddMappingForm from "@/components/AddMappingForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createEmptyMappingFile, loadSampleMappingData } from "@/lib/fileUtils";
import { Check, X, Filter, Plus } from "lucide-react";

const Mapping = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddMappingForm, setShowAddMappingForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
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
    
    // Also update the selected row if it's the one being updated
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
    
    // Also update the selected row if it's the one being updated
    if (selectedRow && selectedRow.id === rowId) {
      const comments = selectedRow.comments ? [...selectedRow.comments, comment] : [comment];
      setSelectedRow({ ...selectedRow, comments });
    }
  };

  const handleSearch = (query: string, filters: Record<string, string>) => {
    setSearchLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      let results = [...mappingFile.rows];
      
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(row => 
          row.sourceColumn.name.toLowerCase().includes(lowerQuery) ||
          row.targetColumn.name.toLowerCase().includes(lowerQuery) ||
          (row.transformation && row.transformation.toLowerCase().includes(lowerQuery))
        );
      }
      
      // Apply filters
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
    
    // Simulate AI-powered search
    setTimeout(() => {
      // For demo purposes, just do a more "intelligent" search
      const results = mappingFile.rows.filter(row => {
        // For demo, AI search understands synonyms and related concepts
        if (query.toLowerCase().includes("primary key")) {
          return row.sourceColumn.isPrimaryKey || row.targetColumn.isPrimaryKey;
        }
        if (query.toLowerCase().includes("transformation") || query.toLowerCase().includes("transform")) {
          return row.transformation !== undefined;
        }
        if (query.toLowerCase().includes("direct") || query.toLowerCase().includes("copy")) {
          return row.transformation === undefined;
        }
        
        // Default to regular search
        return (
          row.sourceColumn.name.toLowerCase().includes(query.toLowerCase()) ||
          row.targetColumn.name.toLowerCase().includes(query.toLowerCase()) ||
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
    // If we have parsed mapping data from CSV or Excel
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

  // New handler for adding a mapping
  const handleAddMapping = (newRow: MappingRow) => {
    const updatedRows = [...mappingFile.rows, newRow];
    setMappingFile({ ...mappingFile, rows: updatedRows });
    
    toast({
      title: "Mapping Added",
      description: `New mapping from ${newRow.sourceColumn.name} to ${newRow.targetColumn.name} added successfully.`,
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

  // Apply status filter if one is selected
  const getFilteredRows = () => {
    // If we have search results, filter those
    let rowsToFilter = searchResults !== null ? searchResults : mappingFile.rows;
    
    // Apply status filter if selected
    if (statusFilter) {
      return rowsToFilter.filter(row => row.status === statusFilter);
    }
    
    return rowsToFilter;
  };

  const counts = getStatusCounts();
  const rowsToDisplay = getFilteredRows();
  const hasData = mappingFile.rows.length > 0;

  // Function to handle status filter click
  const handleStatusFilterClick = (status: MappingStatus | null) => {
    // Toggle filter if already active
    setStatusFilter(currentFilter => 
      currentFilter === status ? null : status
    );
  };

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
    <SidebarProvider>
      <div className="h-screen flex overflow-hidden">
        <AppSidebar
          onUploadClick={() => setShowUploadModal(true)}
          onDownloadClick={() => {
            // Using the DownloadButton component for this
          }}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">Source to Target Mapping</h1>
                <p className="text-gray-500">
                  {mappingFile.sourceSystem} → {mappingFile.targetSystem}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  {showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}
                </Button>
                
                {hasData && <DownloadButton mappingFile={mappingFile} />}
                
                <Button onClick={() => setShowAddMappingForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Mapping
                </Button>
                
                <Button onClick={() => setShowUploadModal(true)}>
                  Upload Mapping
                </Button>
              </div>
            </div>

            {hasData && (
              <SearchBar 
                onSearch={handleSearch} 
                onAISearch={handleAISearch}
                loading={searchLoading} 
              />
            )}

            {hasData && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Button 
                    variant={statusFilter === "approved" ? "default" : "outline"} 
                    size="sm"
                    className={`flex items-center gap-1 ${statusFilter === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
                    onClick={() => handleStatusFilterClick("approved")}
                  >
                    <Check className="h-4 w-4" />
                    Approved: {counts.approved}
                    {statusFilter === "approved" && (
                      <X className="h-3.5 w-3.5 ml-1" onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter(null);
                      }} />
                    )}
                  </Button>
                  
                  <Button 
                    variant={statusFilter === "pending" ? "default" : "outline"} 
                    size="sm"
                    className={`flex items-center gap-1 ${statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100"}`}
                    onClick={() => handleStatusFilterClick("pending")}
                  >
                    <Filter className="h-4 w-4" />
                    Pending: {counts.pending}
                    {statusFilter === "pending" && (
                      <X className="h-3.5 w-3.5 ml-1" onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter(null);
                      }} />
                    )}
                  </Button>
                  
                  <Button 
                    variant={statusFilter === "rejected" ? "default" : "outline"} 
                    size="sm"
                    className={`flex items-center gap-1 ${statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
                    onClick={() => handleStatusFilterClick("rejected")}
                  >
                    <X className="h-4 w-4" />
                    Rejected: {counts.rejected}
                    {statusFilter === "rejected" && (
                      <X className="h-3.5 w-3.5 ml-1" onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter(null);
                      }} />
                    )}
                  </Button>
                  
                  {statusFilter && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setStatusFilter(null)}
                      className="ml-2"
                    >
                      Clear Filter
                    </Button>
                  )}
                  
                  {searchResults !== null && (
                    <>
                      <div className="ml-auto" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSearchResults(null)}
                      >
                        Clear Search
                      </Button>
                    </>
                  )}
                </div>
                
                {statusFilter && (
                  <div className="text-sm">
                    Showing {rowsToDisplay.length} {statusFilter} records
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden">
            {hasData ? (
              <div className="h-full flex gap-4">
                <div className={`${showAIAssistant ? 'w-2/3' : 'w-full'} overflow-hidden flex flex-col`}>
                  <Tabs defaultValue="table" className="h-full flex flex-col p-2">
                    <TabsList className="mb-2">
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="pending">Pending Review ({counts.pending})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table" className="flex-1 overflow-auto bg-white rounded-lg shadow-md p-1 border">
                      <MappingTable 
                        rows={rowsToDisplay} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </TabsContent>
                    <TabsContent value="pending" className="flex-1 overflow-auto bg-white rounded-lg shadow-md p-1 border">
                      <MappingTable 
                        rows={mappingFile.rows.filter(row => row.status === 'pending')} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
                
                {showAIAssistant ? (
                  <div className="w-1/3 p-2">
                    <div className="h-full bg-white rounded-lg shadow-md border p-4">
                      <AIAssistant onClose={() => setShowAIAssistant(false)} />
                    </div>
                  </div>
                ) : selectedRow ? (
                  <div className="w-1/3 p-2">
                    <div className="h-full bg-white rounded-lg shadow-md border p-4">
                      <ReviewPanel 
                        selectedRow={selectedRow} 
                        onStatusChange={handleStatusChange}
                        onCommentAdd={handleCommentAdd}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 m-4">
                <div className="text-center max-w-md">
                  <h2 className="text-xl font-semibold mb-2">No Mapping Data Available</h2>
                  <p className="text-gray-500 mb-6">
                    Upload a CSV or Excel file containing your source-to-target mappings to get started or add a mapping manually
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setShowAddMappingForm(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" /> Add Mapping
                    </Button>
                    <Button onClick={() => setShowUploadModal(true)}>
                      Upload Mapping File
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />

        <AddMappingForm
          mappingFile={mappingFile}
          onAddMapping={handleAddMapping}
          isOpen={showAddMappingForm}
          onClose={() => setShowAddMappingForm(false)}
        />
      </div>
    </SidebarProvider>
  );
};

export default Mapping;
