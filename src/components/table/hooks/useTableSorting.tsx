
import { useState } from "react";

export type SortConfig = {
  column: string;
  direction: "asc" | "desc";
};

export const useTableSorting = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const applySort = (column: string) => {
    setSortConfig(prev => {
      if (prev && prev.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  const sortRows = <T extends Record<string, any>>(rows: T[], getColumnValue: (row: T, column: string) => string): T[] => {
    if (!sortConfig) return rows;

    return [...rows].sort((a, b) => {
      const valueA = getColumnValue(a, sortConfig.column);
      const valueB = getColumnValue(b, sortConfig.column);

      if (sortConfig.direction === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  };

  return {
    sortConfig,
    applySort,
    clearSort,
    sortRows
  };
};
