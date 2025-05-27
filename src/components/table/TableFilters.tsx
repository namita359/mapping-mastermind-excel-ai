
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterConfig } from "./hooks/useTableFilters";

interface TableFiltersProps {
  filters: FilterConfig[];
  onClearFilter: (column: string) => void;
  onClearAllFilters: () => void;
}

const TableFilters = ({ filters, onClearFilter, onClearAllFilters }: TableFiltersProps) => {
  if (filters.length === 0) return null;

  return (
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
            onClick={() => onClearFilter(filter.column)}
          >
            ✕
          </button>
        </Badge>
      ))}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearAllFilters}
        className="text-muted-foreground text-xs"
      >
        Clear All
      </Button>
    </div>
  );
};

export default TableFilters;
