
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MappingTable from "@/components/MappingTable";
import TestDataGenerator from "@/components/TestDataGenerator";
import ReviewPanel from "@/components/ReviewPanel";
import AIAssistant from "@/components/AIAssistant";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusCounts {
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
}

interface MappingContentProps {
  mappingFile: MappingFile;
  rowsToDisplay: MappingRow[];
  counts: StatusCounts;
  selectedRow: MappingRow | null;
  showAIAssistant: boolean;
  onRowSelect: (row: MappingRow) => void;
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
  return (
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
            <TabsTrigger value="testing">Test & Validate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm border">
            <div className="h-full overflow-auto">
              <MappingTable 
                rows={rowsToDisplay} 
                onRowSelect={onRowSelect}
                onStatusChange={onStatusChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="flex-1 overflow-hidden bg-white rounded-lg shadow-sm border">
            <div className="h-full overflow-auto">
              <MappingTable 
                rows={mappingFile.rows.filter(row => row.status === 'pending')} 
                onRowSelect={onRowSelect}
                onStatusChange={onStatusChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="testing" className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <TestDataGenerator mappingFile={mappingFile} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right Panel - AI Assistant or Review Panel */}
      {showAIAssistant ? (
        <div className="w-96 flex-shrink-0 p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
            <AIAssistant onClose={onAIAssistantClose} />
          </div>
        </div>
      ) : selectedRow ? (
        <div className="w-96 flex-shrink-0 p-4">
          <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
            <ReviewPanel 
              selectedRow={selectedRow} 
              onStatusChange={onStatusChange}
              onCommentAdd={onCommentAdd}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MappingContent;
