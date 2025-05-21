
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import MappingTable from "@/components/MappingTable";
import SearchBar from "@/components/SearchBar";
import UploadModal from "@/components/UploadModal";
import DownloadButton from "@/components/DownloadButton";
import ReviewPanel from "@/components/ReviewPanel";
import AIAssistant from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createEmptyMappingFile } from "@/lib/fileUtils";

const Mapping = () => {
  const [mappingFile, setMappingFile] = useState<MappingFile>(createEmptyMappingFile());
  const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [searchResults, setSearchResults] = useState<MappingRow[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

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
    // If we have parsed mapping data from CSV
    if (importedMappingFile) {
      setMappingFile(importedMappingFile);
      toast({
        title: "Mapping file imported",
        description: `${importedMappingFile.rows.length} mappings loaded from CSV`,
      });
      return;
    }
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been processed`,
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

  const counts = getStatusCounts();
  const rowsToDisplay = searchResults !== null ? searchResults : mappingFile.rows;
  const hasData = mappingFile.rows.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          onUploadClick={() => setShowUploadModal(true)}
          onDownloadClick={() => {
            // Using the DownloadButton component for this
          }}
        />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
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
              
              <Button onClick={() => setShowUploadModal(true)}>
                Upload Mapping
              </Button>
            </div>
          </div>

          {hasData ? (
            <>
              <div className="mb-6">
                <SearchBar 
                  onSearch={handleSearch} 
                  onAISearch={handleAISearch}
                  loading={searchLoading} 
                />
              </div>

              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  Approved: {counts.approved}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Pending: {counts.pending}
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  Rejected: {counts.rejected}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  Draft: {counts.draft}
                </Badge>
                
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
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Tabs defaultValue="table">
                    <TabsList>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                      <TabsTrigger value="pending">Pending Review ({counts.pending})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table" className="mt-4">
                      <MappingTable 
                        rows={rowsToDisplay} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-4">
                      <MappingTable 
                        rows={mappingFile.rows.filter(row => row.status === 'pending')} 
                        onRowSelect={handleRowSelect}
                        onStatusChange={handleStatusChange}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="h-[600px]">
                  {showAIAssistant ? (
                    <AIAssistant onClose={() => setShowAIAssistant(false)} />
                  ) : (
                    <ReviewPanel 
                      selectedRow={selectedRow} 
                      onStatusChange={handleStatusChange}
                      onCommentAdd={handleCommentAdd}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">No Mapping Data Available</h2>
                <p className="text-gray-500 mb-6">
                  Upload a CSV file containing your source-to-target mappings to get started
                </p>
                <Button onClick={() => setShowUploadModal(true)}>
                  Upload Mapping File
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      </div>
    </SidebarProvider>
  );
};

export default Mapping;
