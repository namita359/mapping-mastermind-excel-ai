import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import MappingTable from "@/components/MappingTable";
import MappingDetails from "@/components/MappingDetails";
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

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${showAIAssistant ? 'mr-96' : ''}`}>
        <ScrollArea className="h-full">
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

            <MappingTable
              rows={rowsToDisplay}
              selectedRow={selectedRow}
              onRowSelect={onRowSelect}
            />
          </div>
        </ScrollArea>
      </div>

      {/* AI Assistant Sidebar */}
      {showAIAssistant && (
        <div className="w-96 border-l bg-gray-50 overflow-hidden">
          <AIAssistant onClose={onAIAssistantClose} mappingFile={mappingFile} />
        </div>
      )}
    </div>
  );
};

export default MappingContent;
