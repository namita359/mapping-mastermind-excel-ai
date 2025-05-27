
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterConfig } from "./hooks/useTableFilters";

interface FilterMenuProps {
  column: string;
  activeFilter: string | null;
  filters: FilterConfig[];
  onActiveFilterChange: (column: string | null) => void;
  onApplyFilter: (filterConfig: FilterConfig) => void;
  onClearFilter: (column: string) => void;
}

const FilterMenu = ({ 
  column, 
  activeFilter, 
  filters, 
  onActiveFilterChange, 
  onApplyFilter, 
  onClearFilter 
}: FilterMenuProps) => {
  const [filterValue, setFilterValue] = useState("");
  const [filterOperator, setFilterOperator] = useState<FilterConfig["operator"]>("contains");
  
  const activeColumnFilter = filters.find(f => f.column === column);
  const isFiltered = Boolean(activeColumnFilter);

  return (
    <Popover 
      open={activeFilter === column} 
      onOpenChange={(open) => {
        if (open) {
          onActiveFilterChange(column);
          if (activeColumnFilter) {
            setFilterValue(activeColumnFilter.value);
            setFilterOperator(activeColumnFilter.operator);
          }
        } else {
          onActiveFilterChange(null);
        }
      }}
    >
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
                onClearFilter(column);
                onActiveFilterChange(null);
              }}
            >
              Clear
            </Button>
            <Button 
              onClick={() => onApplyFilter({ 
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

export default FilterMenu;
