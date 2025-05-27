
import { useState } from "react";

export type FilterConfig = {
  column: string;
  value: string;
  operator: "contains" | "equals" | "startsWith" | "endsWith";
};

export const useTableFilters = () => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const applyFilter = (filterConfig: FilterConfig) => {
    setFilters(prev => {
      const filtered = prev.filter(f => f.column !== filterConfig.column);
      return [...filtered, filterConfig];
    });
    setActiveFilter(null);
  };

  const clearFilter = (column: string) => {
    setFilters(prev => prev.filter(f => f.column !== column));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const filterRows = <T extends Record<string, any>>(rows: T[], getColumnValue: (row: T, column: string) => string): T[] => {
    return rows.filter(row => {
      return filters.every(filter => {
        const value = getColumnValue(row, filter.column).toLowerCase();
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
  };

  return {
    filters,
    activeFilter,
    setActiveFilter,
    applyFilter,
    clearFilter,
    clearAllFilters,
    filterRows
  };
};
