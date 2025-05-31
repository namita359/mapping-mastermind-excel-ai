
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { MappingRow, MappingStatus } from "../lib/types";
import { useTableFilters } from "./table/hooks/useTableFilters";
import { useTableSorting } from "./table/hooks/useTableSorting";
import { useTablePagination } from "./table/hooks/useTablePagination";
import TableFilters from "./table/TableFilters";
import TableHeader from "./table/TableHeader";
import MappingTableRow from "./table/MappingTableRow";
import TablePagination from "./table/TablePagination";

interface MappingTableProps {
  rows: MappingRow[];
  selectedRow?: MappingRow | null;
  onRowSelect: (row: MappingRow) => void;
  onStatusChange: (rowId: string, status: MappingStatus) => void;
}

const ROWS_PER_PAGE = 10;

const MappingTable = ({ rows, selectedRow, onRowSelect, onStatusChange }: MappingTableProps) => {
  console.log('MappingTable - Rendering with rows:', rows?.length || 0);
  
  // Custom hooks for table functionality
  const {
    filters,
    activeFilter,
    setActiveFilter,
    applyFilter,
    clearFilter,
    clearAllFilters,
    filterRows
  } = useTableFilters();

  const {
    sortConfig,
    applySort,
    sortRows
  } = useTableSorting();

  const {
    currentPage,
    setCurrentPage,
    resetPagination,
    paginateRows,
    getPageNumbers
  } = useTablePagination(ROWS_PER_PAGE);

  // Reset pagination when rows change
  useEffect(() => {
    console.log('MappingTable - Rows changed, resetting pagination');
    resetPagination();
  }, [rows?.length]);

  // Helper function to get column values for filtering and sorting
  const getColumnValue = (row: MappingRow, column: string): string => {
    switch (column) {
      case "sourceMalcode":
        return row.sourceColumn.malcode;
      case "sourceTable":
        return row.sourceColumn.table;
      case "sourceColumn":
        return row.sourceColumn.column;
      case "targetMalcode":
        return row.targetColumn.malcode;
      case "targetTable":
        return row.targetColumn.table;
      case "targetColumn":
        return row.targetColumn.column;
      case "transformation":
        return row.transformation || "Direct Copy";
      case "join":
        return row.join || "";
      case "status":
        return row.status;
      default:
        return "";
    }
  };

  const handleRowClick = (row: MappingRow) => {
    console.log('MappingTable handleRowClick called with:', row.id);
    onRowSelect(row);
  };

  const handleFilterApply = (filterConfig: any) => {
    applyFilter(filterConfig);
    resetPagination();
  };

  const handleFilterClear = (column: string) => {
    clearFilter(column);
    resetPagination();
  };

  const handleFilterClearAll = () => {
    clearAllFilters();
    resetPagination();
  };

  // Apply filters, sorting, and pagination
  const filteredRows = filterRows(rows || [], getColumnValue);
  const sortedRows = sortRows(filteredRows, getColumnValue);
  const { paginatedRows, totalPages, startIndex, endIndex, totalRows } = paginateRows(sortedRows);

  console.log('MappingTable - Processed rows:', {
    original: rows?.length || 0,
    filtered: filteredRows.length,
    sorted: sortedRows.length,
    paginated: paginatedRows.length
  });

  return (
    <div className="space-y-2">
      <TableFilters
        filters={filters}
        onClearFilter={handleFilterClear}
        onClearAllFilters={handleFilterClearAll}
      />

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader
              sortConfig={sortConfig}
              activeFilter={activeFilter}
              filters={filters}
              onSort={applySort}
              onActiveFilterChange={setActiveFilter}
              onApplyFilter={handleFilterApply}
              onClearFilter={handleFilterClear}
            />
            <TableBody>
              {paginatedRows.map((row, index) => (
                <MappingTableRow
                  key={row.id}
                  row={row}
                  index={startIndex + index}
                  isSelected={selectedRow?.id === row.id}
                  onRowClick={handleRowClick}
                  onStatusChange={onStatusChange}
                />
              ))}
              {paginatedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    {(rows?.length || 0) === 0 
                      ? "No mappings found. Add a new mapping to get started."
                      : "No records found. Try adjusting your filters."
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalRows={totalRows}
        rowsPerPage={ROWS_PER_PAGE}
        onPageChange={setCurrentPage}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
};

export default MappingTable;
