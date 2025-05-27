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
import { Check, X, Filter, Plus, Upload, Download, Sparkles, Menu, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">Data Mapping Hub</h1>
              </div>
              
              <nav className="hidden md:flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50">
                  Mappings
                </Button>
                <Button variant="ghost" size="sm">
                  Lineage
                </Button>
                <Button variant="ghost" size="sm">
                  Governance
                </Button>
              </nav>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                AI Assistant
              </Button>
              
              {hasData && (
                <DownloadButton mappingFile={mappingFile}>
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Export
                  </Button>
                </DownloadButton>
              )}
              
              <Button onClick={() => setShowAddMappingForm(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-1 h-4 w-4" /> Add Mapping
              </Button>
              
              <Button onClick={() => setShowUploadModal(true)} size="sm">
                <Upload className="mr-1 h-4 w-4" /> Upload
              </Button>
            </div>
          </div>

          {/* Subtitle and context */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">SRZ (Raw Zone)</span> → <span className="font-medium">CZ/Synapse (Target)</span>
              </p>
              <Badge variant="outline" className="text-xs">
                <Info className="mr-1 h-3 w-3" />
                {mappingFile.rows.length} Total Mappings
              </Badge>
            </div>
            
            {hasData && (
              <div className="flex items-center gap-2">
                <Button 
                  variant={statusFilter === "approved" ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs ${statusFilter === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
                  onClick={() => handleStatusFilterClick("approved")}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {counts.approved}
                </Button>
                
                <Button 
                  variant={statusFilter === "pending" ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs ${statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100"}`}
                  onClick={() => handleStatusFilterClick("pending")}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {counts.pending}
                </Button>
                
                <Button 
                  variant={statusFilter === "rejected" ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs ${statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
                  onClick={() => handleStatusFilterClick("rejected")}
                >
                  <X className="h-3 w-3 mr-1" />
                  {counts.rejected}
                </Button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          {hasData && (
            <div className="mt-4">
              <SearchBar 
                onSearch={handleSearch} 
                onAISearch={handleAISearch}
                loading={searchLoading} 
              />
            </div>
          )}
        </div>
      </header>

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
            <div className="flex-1 flex overflow-hidden">
              {/* Main Table Area */}
              <div className={cn(
                "flex flex-col overflow-hidden p-4 min-w-0",
                showAIAssistant || selectedRow ? 'flex-1' : 'w-full'
              )}>
                <Tabs defaultValue="table" className="h-full flex flex-col">
                  <TabsList className="mb-4 flex-shrink-0">
                    <TabsTrigger value="table">All Mappings ({rowsToDisplay.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending Review ({counts.pending})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table" className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm border">
                    <div className="h-full overflow-auto">
                      <MappingTable 
                        rows={rowsToDisplay} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending" className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm border">
                    <div className="h-full overflow-auto">
                      <MappingTable 
                        rows={mappingFile.rows.filter(row => row.status === 'pending')} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Panel - AI Assistant or Review Panel */}
              {showAIAssistant ? (
                <div className="w-96 flex-shrink-0 p-4">
                  <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
                    <AIAssistant onClose={() => setShowAIAssistant(false)} />
                  </div>
                </div>
              ) : selectedRow ? (
                <div className="w-96 flex-shrink-0 p-4">
                  <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
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
            <div className="flex-1 flex items-center justify-center p-8">
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
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
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
  );
};

export default Mapping;
