
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import MappingTable from "@/components/MappingTable";
import AIAssistant from "@/components/AIAssistant";
import { MappingFile, MappingRow, MappingStatus } from "@/lib/types";

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

  const handleRowSelect = (row: MappingRow) => {
    console.log('MappingContent handleRowSelect called with:', row.id);
    console.log('Current selectedRow:', selectedRow?.id);
    onRowSelect(row);
  };

  console.log('MappingContent render - showAIAssistant:', showAIAssistant);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 transition-all duration-300 overflow-hidden ${showAIAssistant ? 'mr-96' : ''}`}>
        <div className="h-full overflow-hidden">
          <div className="px-4 py-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mappings</h2>
              <div className="flex items-center gap-2">
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
            </div>

            <div className="overflow-auto">
              <MappingTable
                rows={rowsToDisplay}
                selectedRow={selectedRow}
                onRowSelect={handleRowSelect}
                onStatusChange={onStatusChange}
              />
            </div>
          </div>
        </div>
      </div>

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
