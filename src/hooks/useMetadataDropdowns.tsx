
import { useState, useEffect } from 'react';
import { metadataService, MalcodeMetadata, TableMetadata, ColumnMetadata } from '@/lib/metadataService';
import { useToast } from '@/hooks/use-toast';

export const useMetadataDropdowns = () => {
  const { toast } = useToast();
  const [malcodes, setMalcodes] = useState<MalcodeMetadata[]>([]);
  const [sourceTables, setSourceTables] = useState<TableMetadata[]>([]);
  const [targetTables, setTargetTables] = useState<TableMetadata[]>([]);
  const [sourceColumns, setSourceColumns] = useState<ColumnMetadata[]>([]);
  const [targetColumns, setTargetColumns] = useState<ColumnMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all malcodes on component mount
  useEffect(() => {
    loadMalcodes();
  }, []);

  const loadMalcodes = async () => {
    try {
      setLoading(true);
      const data = await metadataService.getAllMalcodes();
      setMalcodes(data);
    } catch (error) {
      console.error('Error loading malcodes:', error);
      toast({
        title: "Error",
        description: "Failed to load malcodes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTablesForMalcode = async (malcodeId: string, isSource: boolean) => {
    try {
      const tables = await metadataService.getTablesByMalcode(malcodeId);
      if (isSource) {
        setSourceTables(tables);
        setSourceColumns([]); // Clear columns when malcode changes
      } else {
        setTargetTables(tables);
        setTargetColumns([]); // Clear columns when malcode changes
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: "Error",
        description: "Failed to load tables",
        variant: "destructive"
      });
    }
  };

  const loadColumnsForTable = async (tableId: string, isSource: boolean) => {
    try {
      const columns = await metadataService.getColumnsByTable(tableId);
      if (isSource) {
        setSourceColumns(columns);
      } else {
        setTargetColumns(columns);
      }
    } catch (error) {
      console.error('Error loading columns:', error);
      toast({
        title: "Error",
        description: "Failed to load columns",
        variant: "destructive"
      });
    }
  };

  const getMalcodeById = (malcodeId: string) => {
    return malcodes.find(m => m.id === malcodeId);
  };

  const getTableById = (tableId: string, isSource: boolean) => {
    const tables = isSource ? sourceTables : targetTables;
    return tables.find(t => t.id === tableId);
  };

  const getColumnById = (columnId: string, isSource: boolean) => {
    const columns = isSource ? sourceColumns : targetColumns;
    return columns.find(c => c.id === columnId);
  };

  return {
    malcodes,
    sourceTables,
    targetTables,
    sourceColumns,
    targetColumns,
    loading,
    loadTablesForMalcode,
    loadColumnsForTable,
    getMalcodeById,
    getTableById,
    getColumnById,
  };
};
