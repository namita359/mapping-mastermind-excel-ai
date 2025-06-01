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
  const [error, setError] = useState<string | null>(null);

  // Load all malcodes on component mount
  useEffect(() => {
    console.log('useMetadataDropdowns: Component mounted, loading malcodes...');
    loadMalcodes();
  }, []);

  const loadMalcodes = async () => {
    try {
      console.log('useMetadataDropdowns: Starting to load malcodes...');
      setLoading(true);
      setError(null);
      
      const data = await metadataService.getAllMalcodes();
      console.log('useMetadataDropdowns: Received malcodes data:', data);
      console.log('useMetadataDropdowns: Number of malcodes:', data?.length || 0);
      
      if (data && data.length > 0) {
        setMalcodes(data);
        console.log('useMetadataDropdowns: Successfully loaded malcodes:', data.map(m => m.malcode));
      } else {
        console.warn('useMetadataDropdowns: No malcodes found in database');
        setError('No malcodes found in database. Please add metadata first.');
        
        // Show a helpful toast message
        toast({
          title: "No Malcodes Found",
          description: "No malcodes found in the database. Please add metadata using the Metadata Management page first.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('useMetadataDropdowns: Error loading malcodes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load malcodes: ${errorMessage}`);
      toast({
        title: "Database Error",
        description: `Failed to load malcodes: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('useMetadataDropdowns: Finished loading malcodes');
    }
  };

  const loadTablesForMalcode = async (malcodeId: string, isSource: boolean) => {
    try {
      console.log(`useMetadataDropdowns: Loading tables for malcode ${malcodeId}, isSource: ${isSource}`);
      const tables = await metadataService.getTablesByMalcode(malcodeId);
      console.log(`useMetadataDropdowns: Received ${tables.length} tables for malcode ${malcodeId}`);
      
      if (isSource) {
        setSourceTables(tables);
        setSourceColumns([]); // Clear columns when malcode changes
      } else {
        setTargetTables(tables);
        setTargetColumns([]); // Clear columns when malcode changes
      }
    } catch (error) {
      console.error('useMetadataDropdowns: Error loading tables:', error);
      toast({
        title: "Error",
        description: `Failed to load tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const loadColumnsForTable = async (tableId: string, isSource: boolean) => {
    try {
      console.log(`useMetadataDropdowns: Loading columns for table ${tableId}, isSource: ${isSource}`);
      const columns = await metadataService.getColumnsByTable(tableId);
      console.log(`useMetadataDropdowns: Received ${columns.length} columns for table ${tableId}`);
      
      if (isSource) {
        setSourceColumns(columns);
      } else {
        setTargetColumns(columns);
      }
    } catch (error) {
      console.error('useMetadataDropdowns: Error loading columns:', error);
      toast({
        title: "Error",
        description: `Failed to load columns: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const getMalcodeById = (malcodeId: string) => {
    const found = malcodes.find(m => m.id === malcodeId);
    console.log(`useMetadataDropdowns: getMalcodeById(${malcodeId}) result:`, found);
    return found;
  };

  const getTableById = (tableId: string, isSource: boolean) => {
    const tables = isSource ? sourceTables : targetTables;
    const found = tables.find(t => t.id === tableId);
    console.log(`useMetadataDropdowns: getTableById(${tableId}, ${isSource}) result:`, found);
    return found;
  };

  const getColumnById = (columnId: string, isSource: boolean) => {
    const columns = isSource ? sourceColumns : targetColumns;
    const found = columns.find(c => c.id === columnId);
    console.log(`useMetadataDropdowns: getColumnById(${columnId}, ${isSource}) result:`, found);
    return found;
  };

  return {
    malcodes,
    sourceTables,
    targetTables,
    sourceColumns,
    targetColumns,
    loading,
    error,
    loadTablesForMalcode,
    loadColumnsForTable,
    getMalcodeById,
    getTableById,
    getColumnById,
    refreshMalcodes: loadMalcodes,
  };
};
