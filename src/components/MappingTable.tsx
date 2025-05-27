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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, Edit, Download, FileDown, FileUp, Filter, FilterX, SortAsc, SortDesc } from "lucide-react";
import { MappingRow, MappingStatus } from "../lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface MappingTableProps {
  rows: MappingRow[];
  onRowSelect: (row: MappingRow) => void;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
}

type FilterConfig = {
  column: string;
  value: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith";
};

type SortConfig = {
  column: string;
  direction: "asc" | "desc";
};

const ROWS_PER_PAGE = 10;

const MappingTable = ({ rows, onRowSelect, onStatusChange }: MappingTableProps) => {
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const applyFilter = (filterConfig: FilterConfig) => {
    setFilters(prev => {
      // Remove existing filters for the same column
      const filtered = prev.filter(f => f.column !== filterConfig.column);
      return [...filtered, filterConfig];
    });
    setActiveFilter(null);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilter = (column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const clearAllFilters = () => {
    setFilters([]);
    setCurrentPage(1); // Reset to first page when clearing all filters
  };

  const applySort = (column: string) => {
    setSortConfig(prev => {
      if (prev && prev.column === column) {
        // Toggle direction if clicking the same column
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Default to ascending for new sort column
      return { column, direction: 'asc' };
    });
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  // Apply filters to rows
  const filteredRows = rows.filter(row => {
    return filters.every(filter => {
      let value: string;

      // Extract the value based on the column using the correct property names
      switch (filter.column) {
        case "sourceColumn":
          value = row.sourceColumn.column;
          break;
        case "sourceTable":
          value = row.sourceColumn.table;
          break;
        case "malcode":
          value = row.sourceColumn.malcode;
          break;
        case "targetColumn":
          value = row.targetColumn.column;
          break;
        case "transformation":
          value = row.transformation || "Direct Copy";
          break;
        case "status":
          value = row.status;
          break;
        case "pod":
          value = row.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", "") || "";
          break;
        default:
          value = "";
      }

      value = value.toLowerCase();
      const filterValue = filter.value.toLowerCase();

      switch (filter.operator) {
        case "contains":
          return value.includes(filterValue);
        case "equals":
          return value === filterValue;
        case "startsWith":
          return value.startsWith(filterValue);
        case "endsWith":
          return value.endsWith(filterValue);
        default:
          return true;
      }
    });
  });

  // Apply sorting to filtered rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortConfig) return 0;

    let valueA: string;
    let valueB: string;

    // Extract values based on the column using correct property names
    switch (sortConfig.column) {
      case "sourceColumn":
        valueA = a.sourceColumn.column;
        valueB = b.sourceColumn.column;
        break;
      case "sourceTable":
        valueA = a.sourceColumn.table;
        valueB = b.sourceColumn.table;
        break;
      case "malcode":
        valueA = a.sourceColumn.malcode;
        valueB = b.sourceColumn.malcode;
        break;
      case "targetColumn":
        valueA = a.targetColumn.column;
        valueB = b.targetColumn.column;
        break;
      case "transformation":
        valueA = a.transformation || "Direct Copy";
        valueB = b.transformation || "Direct Copy";
        break;
      case "status":
        valueA = a.status;
        valueB = b.status;
        break;
      case "pod":
        valueA = a.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", "") || "";
        valueB = b.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", "") || "";
        break;
      default:
        valueA = "";
        valueB = "";
    }

    if (sortConfig.direction === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Calculate pagination
  const totalRows = sortedRows.length;
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, totalRows);
  
  // Get the current page of data
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(-1); // Use -1 to indicate ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // Use -2 to indicate ellipsis
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Column descriptions for tooltips
  const columnDescriptions = {
    pod: "Program of Data - Represents the business program or domain",
    malcode: "Management Area Logical Code - Unique identifier for a business area",
    sourceColumn: "The source database column name",
    sourceTable: "The source database table name",
    targetColumn: "The target database column name to map to",
    targetTable: "The target database table that will receive the data",
    transformation: "Logic applied to transform source data to target format",
    status: "Current review status of the mapping",
  };

  // Filter UI components
  const FilterMenu = ({ column }: { column: string }) => {
    const [filterValue, setFilterValue] = useState("");
    const [filterOperator, setFilterOperator] = useState<FilterConfig["operator"]>("contains");
    
    const activeColumnFilter = filters.find(f => f.column === column);
    const isFiltered = Boolean(activeColumnFilter);

    return (
      <Popover open={activeFilter === column} onOpenChange={(open) => {
        if (open) {
          setActiveFilter(column);
          // Set initial values from existing filter if any
          if (activeColumnFilter) {
            setFilterValue(activeColumnFilter.value);
            setFilterOperator(activeColumnFilter.operator);
          }
        } else {
          setActiveFilter(null);
        }
      }}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-8 w-8 p-0 ml-2",
              isFiltered ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isFiltered ? <FilterX className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="font-medium">Filter {column}</div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <select 
                  value={filterOperator} 
                  onChange={(e) => setFilterOperator(e.target.value as FilterConfig["operator"])}
                  className="p-2 text-sm border rounded-md"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                </select>
                
                <Input 
                  type="text" 
                  placeholder="Filter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  clearFilter(column);
                  setActiveFilter(null);
                }}
              >
                Clear
              </Button>
              <Button 
                onClick={() => applyFilter({ 
                  column, 
                  value: filterValue, 
                  operator: filterOperator 
                })}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-2">
      {filters.length > 0 && (
        <div className="flex gap-2 items-center flex-wrap mb-2">
          <span className="text-sm font-medium">Filters:</span>
          {filters.map((filter, index) => (
            <Badge 
              key={index} 
              className="flex items-center gap-1"
              variant="outline"
            >
              {filter.column} {filter.operator} &quot;{filter.value}&quot;
              <button 
                className="ml-1 text-xs hover:text-destructive" 
                onClick={() => clearFilter(filter.column)}
              >
                ✕
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Pod</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.pod}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "pod" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("pod")}
                    >
                      {sortConfig?.column === "pod" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="pod" />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Malcode</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.malcode}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "malcode" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("malcode")}
                    >
                      {sortConfig?.column === "malcode" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="malcode" />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Source Column</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.sourceColumn}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "sourceColumn" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("sourceColumn")}
                    >
                      {sortConfig?.column === "sourceColumn" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="sourceColumn" />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Target Column</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.targetColumn}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "targetColumn" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("targetColumn")}
                    >
                      {sortConfig?.column === "targetColumn" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="targetColumn" />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Transformation</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.transformation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "transformation" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("transformation")}
                    >
                      {sortConfig?.column === "transformation" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="transformation" />
                  </div>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Status</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{columnDescriptions.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 ml-1",
                        sortConfig?.column === "status" ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => applySort("status")}
                    >
                      {sortConfig?.column === "status" && sortConfig?.direction === "asc" ? 
                        <SortAsc className="h-4 w-4" /> : 
                        <SortDesc className="h-4 w-4" />
                      }
                    </Button>
                    <FilterMenu column="status" />
                  </div>
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((row, index) => {
              const podInfo = row.comments?.find(c => c.startsWith("Pod:"))?.replace("Pod: ", "") || "";
              const malcodeInfo = row.sourceColumn.malcode;
              
              return (
                <TableRow 
                  key={row.id} 
                  onClick={() => handleRowClick(row)}
                  className={cn(
                    "cursor-pointer hover:bg-gray-50",
                    selectedRowId === row.id ? "bg-blue-50" : ""
                  )}
                >
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{podInfo}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Pod: {podInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{malcodeInfo}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Malcode: {malcodeInfo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{row.sourceColumn.column}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Source Column: {row.sourceColumn.column}</p>
                          <p>Data Type: {row.sourceColumn.dataType}</p>
                          <p>Table: {row.sourceColumn.table}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="font-medium">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{row.targetColumn.column}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Target Column: {row.targetColumn.column}</p>
                          <p>Data Type: {row.targetColumn.dataType}</p>
                          <p>Table: {row.targetColumn.table}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
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
              );
            })}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No records found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalRows > ROWS_PER_PAGE && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, i) => (
                <PaginationItem key={i}>
                  {page === -1 || page === -2 ? (
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-sm text-center text-muted-foreground mt-2">
            Showing {startIndex + 1} to {endIndex} of {totalRows} entries
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingTable;
