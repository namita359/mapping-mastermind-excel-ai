
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MappingTable from "@/components/MappingTable";
import AIAssistant from "@/components/AIAssistant";
import TestDataGenerator from "@/components/TestDataGenerator";
import MappingModals from "@/components/MappingModals";
import MappingEmptyState from "@/components/MappingEmptyState";
import { useMappingUI } from "@/hooks/useMappingUI";
import { useAzureSqlMappingContext } from "@/components/AzureSqlMappingProvider";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";
import { Database, Table, Upload, Plus, Sparkles } from "lucide-react";

interface MappingContentProps {
  mappingFile: MappingFile;
  rowsToDisplay: MappingRow[];
  counts: { approved: number; pending: number; rejected: number; draft: number };
  selectedRow: MappingRow | null;
  showAIAssistant: boolean;
  onRowSelect: (row: MappingRow | null) => void;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
  onCommentAdd: (rowId: string, comment: string) => void;
  onAIAssistantClose: () => void;
}

const MappingContent = ({
  mappingFile,
  rowsToDisplay,
  counts,
  selectedRow,
  showAIAssistant,
  onRowSelect,
  onStatusChange,
  onCommentAdd,
  onAIAssistantClose
}: MappingContentProps) => {
  const { handleFileUpload, handleAddMapping } = useAzureSqlMappingContext();
  
  const {
    showUploadModal,
    setShowUploadModal,
    showAddMappingForm,
    setShowAddMappingForm,
    showAIAssistant: showAIAssistantState,
    setShowAIAssistant,
  } = useMappingUI();

  const handleRowSelect = (row: MappingRow) => {
    console.log('MappingContent handleRowSelect called with:', row.id);
    console.log('Current selectedRow:', selectedRow?.id);
    onRowSelect(row);
  };

  const handleAIAssistantToggle = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleAddMappingClick = () => {
    setShowAddMappingForm(true);
  };

  const handleUploadModalClose = () => {
    setShowUploadModal(false);
  };

  const handleAddMappingModalClose = () => {
    setShowAddMappingForm(false);
  };

  console.log('MappingContent render - showAIAssistant:', showAIAssistant);

  const hasData = mappingFile.rows.length > 0;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 transition-all duration-300 overflow-hidden ${showAIAssistant ? 'mr-96' : ''}`}>
        <div className="h-full overflow-hidden">
          <div className="px-4 py-6 h-full flex flex-col">
            {/* Header with controls */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Data Mapping Hub</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAIAssistantToggle}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Sparkles className="mr-1 h-4 w-4" />
                  AI Assistant
                </Button>
                
                <Button onClick={handleAddMappingClick} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-1 h-4 w-4" /> Add Mapping
                </Button>
                
                <Button onClick={handleUploadClick} size="sm">
                  <Upload className="mr-1 h-4 w-4" /> Upload
                </Button>
              </div>
            </div>

            {/* Status badges */}
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary">
                Approved: {counts.approved}
              </Badge>
              <Badge variant="secondary">
                Pending: {counts.pending}
              </Badge>
              <Badge variant="secondary">
                Rejected: {counts.rejected}
              </Badge>
              <Badge variant="secondary">
                Draft: {counts.draft}
              </Badge>
            </div>

            {/* Main content */}
            {!hasData ? (
              <MappingEmptyState 
                onAddMappingClick={handleAddMappingClick}
                onUploadClick={handleUploadClick}
              />
            ) : (
              <Tabs defaultValue="mappings" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mappings" className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Mappings
                  </TabsTrigger>
                  <TabsTrigger value="sql-generator" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    SQL & Test Data Generator
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mappings" className="flex-1 overflow-hidden mt-4">
                  <div className="overflow-auto h-full">
                    <MappingTable
                      rows={rowsToDisplay}
                      selectedRow={selectedRow}
                      onRowSelect={handleRowSelect}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sql-generator" className="flex-1 overflow-hidden mt-4">
                  <div className="overflow-auto h-full">
                    <TestDataGenerator mappingFile={mappingFile} />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MappingModals
        showUploadModal={showUploadModal}
        showAddMappingModal={showAddMappingForm}
        onUploadModalClose={handleUploadModalClose}
        onAddMappingModalClose={handleAddMappingModalClose}
        onFileUpload={handleFileUpload}
        onAddMapping={handleAddMapping}
      />

      {/* AI Assistant Sidebar */}
      {showAIAssistant && (
        <div className="w-96 border-l bg-gray-50 overflow-hidden fixed right-0 top-0 h-full z-10">
          <div className="h-full">
            <AIAssistant onClose={onAIAssistantClose} mappingFile={mappingFile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingContent;
