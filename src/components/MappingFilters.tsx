
import { Button } from "@/components/ui/button";
import { MappingStatus } from "@/lib/types";
import { Check, X, Filter } from "lucide-react";

interface StatusCounts {
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
}

interface MappingFiltersProps {
  counts: StatusCounts;
  statusFilter: MappingStatus | null;
  onStatusFilterClick: (status: MappingStatus | null) => void;
}

const MappingFilters = ({ counts, statusFilter, onStatusFilterClick }: MappingFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={statusFilter === "approved" ? "default" : "outline"} 
        size="sm"
        className={`text-xs ${statusFilter === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-green-50 text-green-800 hover:bg-green-100"}`}
        onClick={() => onStatusFilterClick("approved")}
      >
        <Check className="h-3 w-3 mr-1" />
        {counts.approved}
      </Button>
      
      <Button 
        variant={statusFilter === "pending" ? "default" : "outline"} 
        size="sm"
        className={`text-xs ${statusFilter === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100"}`}
        onClick={() => onStatusFilterClick("pending")}
      >
        <Filter className="h-3 w-3 mr-1" />
        {counts.pending}
      </Button>
      
      <Button 
        variant={statusFilter === "rejected" ? "default" : "outline"} 
        size="sm"
        className={`text-xs ${statusFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
        onClick={() => onStatusFilterClick("rejected")}
      >
        <X className="h-3 w-3 mr-1" />
        {counts.rejected}
      </Button>
    </div>
  );
};

export default MappingFilters;
