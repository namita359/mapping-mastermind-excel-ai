
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Check, Edit, Download, FileDown, FileUp } from "lucide-react";
import { MappingRow, MappingStatus } from "../lib/types";
import { cn } from "@/lib/utils";

interface MappingTableProps {
  rows: MappingRow[];
  onRowSelect: (row: MappingRow) => void;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
}

const MappingTable = ({ rows, onRowSelect, onStatusChange }: MappingTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

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

  const handleRowClick = (row: MappingRow) => {
    setSelectedRowId(row.id);
    onRowSelect(row);
  };

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Source Column</TableHead>
            <TableHead>Source Data Type</TableHead>
            <TableHead>Target Column</TableHead>
            <TableHead>Target Data Type</TableHead>
            <TableHead>Transformation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow 
              key={row.id} 
              onClick={() => handleRowClick(row)}
              className={cn(
                "cursor-pointer hover:bg-gray-50",
                selectedRowId === row.id ? "bg-blue-50" : ""
              )}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">
                {row.sourceColumn.name}
                {row.sourceColumn.isPrimaryKey && (
                  <Badge variant="outline" className="ml-2">PK</Badge>
                )}
              </TableCell>
              <TableCell>{row.sourceColumn.dataType}</TableCell>
              <TableCell className="font-medium">
                {row.targetColumn.name}
                {row.targetColumn.isPrimaryKey && (
                  <Badge variant="outline" className="ml-2">PK</Badge>
                )}
              </TableCell>
              <TableCell>{row.targetColumn.dataType}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {row.transformation || "Direct Copy"}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(row.status)}>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MappingTable;
