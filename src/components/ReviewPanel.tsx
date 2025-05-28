
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Edit, X, MessageSquare } from "lucide-react";
import { MappingRow, MappingStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ReviewPanelProps {
  selectedRow: MappingRow | null;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
  onCommentAdd: (rowId: string, comment: string) => void;
  onClose: () => void;
}

const ReviewPanel = ({ selectedRow, onStatusChange, onCommentAdd, onClose }: ReviewPanelProps) => {
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleAddComment = () => {
    if (!selectedRow || !comment.trim()) return;
    
    onCommentAdd(selectedRow.id, comment);
    setComment("");
    
    toast({
      title: "Comment added",
      description: "Your comment has been added to the mapping",
    });
  };

  const getStatusColor = (status: MappingStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!selectedRow) {
    return (
      <div className="p-6 text-center h-full flex items-center justify-center border rounded-md bg-gray-50">
        <p className="text-gray-500">Select a mapping row to review</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 bg-white overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Mapping Details</h3>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(selectedRow.status)}>
            {selectedRow.status.charAt(0).toUpperCase() + selectedRow.status.slice(1)}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Source Column</h4>
          <p className="font-medium">{selectedRow.sourceColumn.column}</p>
          <p className="text-sm text-gray-600">{selectedRow.sourceColumn.dataType}</p>
          <p className="text-sm text-gray-500 mt-1">Table: {selectedRow.sourceColumn.table}</p>
          <p className="text-sm text-gray-500">Malcode: {selectedRow.sourceColumn.malcode}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Target Column</h4>
          <p className="font-medium">{selectedRow.targetColumn.column}</p>
          <p className="text-sm text-gray-600">{selectedRow.targetColumn.dataType}</p>
          <p className="text-sm text-gray-500 mt-1">Table: {selectedRow.targetColumn.table}</p>
          <p className="text-sm text-gray-500">Malcode: {selectedRow.targetColumn.malcode}</p>
        </div>
      </div>

      {selectedRow.transformation && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500">Transformation</h4>
          <div className="bg-gray-50 p-2 rounded font-mono text-sm">
            {selectedRow.transformation}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Review Actions</h4>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
              onClick={() => onStatusChange(selectedRow.id, "approved")}
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
              onClick={() => onStatusChange(selectedRow.id, "rejected")}
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h4 className="text-sm font-medium mb-2">Comments</h4>
        <div className="space-y-3 mb-3">
          {selectedRow.comments && selectedRow.comments.length > 0 ? (
            selectedRow.comments.map((comment, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">{comment}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No comments yet</p>
          )}
        </div>
        
        <div className="flex gap-2 items-start">
          <Textarea 
            placeholder="Add a comment..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            variant="outline"
            onClick={handleAddComment}
            disabled={!comment.trim()}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPanel;
