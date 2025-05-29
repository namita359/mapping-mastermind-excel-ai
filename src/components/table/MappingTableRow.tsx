
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Edit, FileDown, FileUp } from "lucide-react";
import { MappingRow, MappingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MappingTableRowProps {
  row: MappingRow;
  index: number;
  isSelected: boolean;
  onRowClick: (row: MappingRow) => void;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
}

const MappingTableRow = ({ 
  row, 
  index, 
  isSelected, 
  onRowClick, 
  onStatusChange 
}: MappingTableRowProps) => {
  const getStatusColor = (status: MappingStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    
    console.log('Row clicked:', row.id);
    onRowClick(row);
  };

  return (
    <TableRow 
      onClick={handleRowClick}
      className={cn(
        "cursor-pointer hover:bg-gray-50",
        isSelected ? "bg-blue-50" : ""
      )}
    >
      <TableCell className="text-sm">{index + 1}</TableCell>
      <TableCell className="font-medium text-sm">{row.sourceColumn.malcode}</TableCell>
      <TableCell className="text-sm">{row.sourceColumn.table}</TableCell>
      <TableCell className="font-medium text-sm">{row.sourceColumn.column}</TableCell>
      <TableCell className="font-medium text-sm">{row.targetColumn.malcode}</TableCell>
      <TableCell className="text-sm">{row.targetColumn.table}</TableCell>
      <TableCell className="font-medium text-sm">{row.targetColumn.column}</TableCell>
      <TableCell className="text-sm max-w-[150px] truncate">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{row.transformation || "Direct Copy"}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.transformation || "Direct Copy (No Transformation)"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-sm">
        {row.join ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help text-blue-600 truncate block max-w-[120px]">{row.join}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{row.join}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(row.status)} variant="outline">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Edit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onStatusChange(row.id, 'approved');
            }}>
              <Check className="mr-2 h-4 w-4" />
              <span>Approve</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onStatusChange(row.id, 'rejected');
            }}>
              <FileDown className="mr-2 h-4 w-4" />
              <span>Reject</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onStatusChange(row.id, 'pending');
            }}>
              <FileUp className="mr-2 h-4 w-4" />
              <span>Mark as Pending</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default MappingTableRow;
