
import { useState } from "react";
import { MappingFile } from "@/lib/types";

export const useTestDataFilters = (mappingFile: MappingFile) => {
  const [selectedMalcode, setSelectedMalcode] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Filter mapping file based on selections
  const filteredMappingFile = {
    ...mappingFile,
    rows: mappingFile.rows.filter(row => {
      if (selectedMalcode && row.targetColumn.malcode !== selectedMalcode) return false;
      if (selectedTable && row.targetColumn.table !== selectedTable) return false;
      return true;
    })
  };

  return {
    selectedMalcode,
    selectedTable,
    filteredMappingFile,
    setSelectedMalcode,
    setSelectedTable
  };
};
