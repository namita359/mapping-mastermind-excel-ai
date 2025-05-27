
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortConfig } from "./hooks/useTableSorting";
import { FilterConfig } from "./hooks/useTableFilters";
import FilterMenu from "./FilterMenu";

interface TableHeaderProps {
  sortConfig: SortConfig | null;
  activeFilter: string | null;
  filters: FilterConfig[];
  onSort: (column: string) => void;
  onActiveFilterChange: (column: string | null) => void;
  onApplyFilter: (filterConfig: FilterConfig) => void;
  onClearFilter: (column: string) => void;
}

const columnDescriptions = {
  sourceMalcode: "Source Management Area Logical Code - Unique identifier for source business area",
  sourceTable: "The source database table name",
  sourceColumn: "The source database column name",
  targetMalcode: "Target Management Area Logical Code - Unique identifier for target business area",
  targetTable: "The target database table name",
  targetColumn: "The target database column name to map to",
  transformation: "Logic applied to transform source data to target format",
  join: "Join conditions used in the mapping",
  status: "Current review status of the mapping",
};

const TableHeader = ({ 
  sortConfig, 
  activeFilter, 
  filters, 
  onSort, 
  onActiveFilterChange, 
  onApplyFilter, 
  onClearFilter 
}: TableHeaderProps) => {
  const renderHeaderCell = (column: string, title: string, minWidth: string = "min-w-[120px]") => (
    <TableHead className={minWidth}>
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">{title}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{columnDescriptions[column as keyof typeof columnDescriptions]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-8 w-8 p-0 ml-1",
              sortConfig?.column === column ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => onSort(column)}
          >
            {sortConfig?.column === column && sortConfig?.direction === "asc" ? 
              <SortAsc className="h-4 w-4" /> : 
              <SortDesc className="h-4 w-4" />
            }
          </Button>
          <FilterMenu 
            column={column}
            activeFilter={activeFilter}
            filters={filters}
            onActiveFilterChange={onActiveFilterChange}
            onApplyFilter={onApplyFilter}
            onClearFilter={onClearFilter}
          />
        </div>
      </div>
    </TableHead>
  );

  return (
    <ShadcnTableHeader className="bg-gray-50">
      <TableRow>
        <TableHead className="w-[40px]">#</TableHead>
        {renderHeaderCell("sourceMalcode", "Source Malcode")}
        {renderHeaderCell("sourceTable", "Source Table")}
        {renderHeaderCell("sourceColumn", "Source Column")}
        {renderHeaderCell("targetMalcode", "Target Malcode")}
        {renderHeaderCell("targetTable", "Target Table")}
        {renderHeaderCell("targetColumn", "Target Column")}
        {renderHeaderCell("transformation", "Transformation", "min-w-[150px]")}
        {renderHeaderCell("join", "Join")}
        <TableHead className="w-[100px]">Status</TableHead>
        <TableHead className="w-[80px] text-right">Actions</TableHead>
      </TableRow>
    </ShadcnTableHeader>
  );
};

export default TableHeader;
