
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

  // Track selected malcode values for proper column loading
  const [selectedSourceMalcode, setSelectedSourceMalcode] = useState<string>('');
  const [selectedTargetMalcode, setSelectedTargetMalcode] = useState<string>('');

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
        setError('No malcodes found in database. Please check your data.');
        
        // Show a helpful toast message
        toast({
          title: "No Malcodes Found",
          description: "No malcodes found in the database. Please check if the data was loaded correctly.",
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
      console.log(`useMetadataDropdowns: Loading tables for malcode ID ${malcodeId}, isSource: ${isSource}`);
      
      // Find the malcode object by ID to get the actual malcode string
      const malcodeObj = malcodes.find(m => m.id === malcodeId);
      if (!malcodeObj) {
        console.error(`useMetadataDropdowns: Could not find malcode with ID ${malcodeId}`);
        toast({
          title: "Error",
          description: "Could not find selected malcode",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`useMetadataDropdowns: Found malcode object:`, malcodeObj);
      console.log(`useMetadataDropdowns: Loading tables for malcode string: ${malcodeObj.malcode}`);
      
      // Store the selected malcode for column loading
      if (isSource) {
        setSelectedSourceMalcode(malcodeObj.malcode);
      } else {
        setSelectedTargetMalcode(malcodeObj.malcode);
      }
      
      const tables = await metadataService.getTablesByMalcode(malcodeObj.malcode);
      console.log(`useMetadataDropdowns: Received ${tables.length} tables for malcode ${malcodeObj.malcode}:`, tables);
      
      if (isSource) {
        setSourceTables(tables);
        setSourceColumns([]); // Clear columns when malcode changes
        console.log(`useMetadataDropdowns: Set ${tables.length} source tables`);
      } else {
        setTargetTables(tables);
        setTargetColumns([]); // Clear columns when malcode changes
        console.log(`useMetadataDropdowns: Set ${tables.length} target tables`);
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
      
      // Find the table object by ID to get the table name
      const tables = isSource ? sourceTables : targetTables;
      const tableObj = tables.find(t => t.id === tableId);
      if (!tableObj) {
        console.error(`useMetadataDropdowns: Could not find table with ID ${tableId}`);
        toast({
          title: "Error",
          description: "Could not find selected table",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`useMetadataDropdowns: Found table object:`, tableObj);
      
      // Use the stored malcode value
      const malcodeString = isSource ? selectedSourceMalcode : selectedTargetMalcode;
      if (!malcodeString) {
        console.error(`useMetadataDropdowns: No malcode selected for ${isSource ? 'source' : 'target'}`);
        toast({
          title: "Error",
          description: "Please select a malcode first",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`useMetadataDropdowns: Loading columns for malcode: ${malcodeString}, table: ${tableObj.table_name}`);
      
      const columns = await metadataService.getColumnsByTable(malcodeString, tableObj.table_name);
      console.log(`useMetadataDropdowns: Received ${columns.length} columns for table ${tableObj.table_name}:`, columns);
      
      if (isSource) {
        setSourceColumns(columns);
        console.log(`useMetadataDropdowns: Set ${columns.length} source columns`);
      } else {
        setTargetColumns(columns);
        console.log(`useMetadataDropdowns: Set ${columns.length} target columns`);
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
