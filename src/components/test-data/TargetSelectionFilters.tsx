
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { MappingFile } from "@/lib/types";

interface TargetSelectionFiltersProps {
  mappingFile: MappingFile;
  selectedMalcode: string | null;
  selectedTable: string | null;
  onMalcodeChange: (malcode: string | null) => void;
  onTableChange: (table: string | null) => void;
}

const TargetSelectionFilters = ({
  mappingFile,
  selectedMalcode,
  selectedTable,
  onMalcodeChange,
  onTableChange,
}: TargetSelectionFiltersProps) => {
  // Extract unique target malcodes and tables from mapping rows
  const { targetMalcodes, targetTables, filteredCount } = useMemo(() => {
    const malcodes = [...new Set(mappingFile.rows.map(row => row.targetColumn.malcode))].sort();
    
    // Filter tables based on selected malcode
    let tables: string[] = [];
    if (selectedMalcode) {
      tables = [...new Set(
        mappingFile.rows
          .filter(row => row.targetColumn.malcode === selectedMalcode)
          .map(row => row.targetColumn.table)
      )].sort();
    } else {
      tables = [...new Set(mappingFile.rows.map(row => row.targetColumn.table))].sort();
    }

    // Count filtered mappings
    let filtered = mappingFile.rows;
    if (selectedMalcode) {
      filtered = filtered.filter(row => row.targetColumn.malcode === selectedMalcode);
    }
    if (selectedTable) {
      filtered = filtered.filter(row => row.targetColumn.table === selectedTable);
    }

    return {
      targetMalcodes: malcodes,
      targetTables: tables,
      filteredCount: filtered.length
    };
  }, [mappingFile.rows, selectedMalcode, selectedTable]);

  const handleMalcodeChange = (value: string) => {
    const newMalcode = value === "all" ? null : value;
    onMalcodeChange(newMalcode);
    // Reset table selection when malcode changes
    if (newMalcode !== selectedMalcode) {
      onTableChange(null);
    }
  };

  const handleTableChange = (value: string) => {
    const newTable = value === "all" ? null : value;
    onTableChange(newTable);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Target Selection Filters
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select target malcode and table to generate focused SQL queries
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Malcode</label>
            <Select value={selectedMalcode || "all"} onValueChange={handleMalcodeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select target malcode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Malcodes</SelectItem>
                {targetMalcodes.map((malcode) => (
                  <SelectItem key={malcode} value={malcode}>
                    {malcode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Table</label>
            <Select 
              value={selectedTable || "all"} 
              onValueChange={handleTableChange}
              disabled={!selectedMalcode && targetTables.length > 20} // Disable if too many tables without malcode filter
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {targetTables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Filtered Mappings</label>
            <div className="flex items-center h-10">
              <Badge variant="outline" className="text-base px-3 py-2">
                {filteredCount} of {mappingFile.rows.length} mappings
              </Badge>
            </div>
          </div>
        </div>

        {(selectedMalcode || selectedTable) && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              <strong>Current Selection:</strong>
              {selectedMalcode && ` Malcode: ${selectedMalcode}`}
              {selectedTable && ` • Table: ${selectedTable}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TargetSelectionFilters;
