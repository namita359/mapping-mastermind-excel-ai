import { MappingFile, MappingRow, MappingColumn, MappingStatus } from './types';

// Simulated Azure SQL Database service for browser environment
// This replaces the actual mssql integration which cannot run in browsers

// Local storage keys
const STORAGE_KEYS = {
  MAPPING_FILES: 'azure_sql_mapping_files',
  MAPPING_COLUMNS: 'azure_sql_mapping_columns',
  MAPPING_ROWS: 'azure_sql_mapping_rows'
} as const;

// Database interfaces (keeping the same structure for compatibility)
export interface DatabaseMappingFile {
  id: string;
  name: string;
  description?: string;
  source_system: string;
  target_system: string;
  status: MappingStatus;
  created_by: string;
  created_at: Date;
  updated_at?: Date;
}

export interface DatabaseMappingColumn {
  id: string;
  malcode: string;
  table_name: string;
  column_name: string;
  data_type: string;
  malcode_description?: string;
  table_description?: string;
  column_description?: string;
  is_primary_key?: boolean;
  is_nullable?: boolean;
  default_value?: string;
  created_at: Date;
}

export interface DatabaseMappingRow {
  id: string;
  mapping_file_id: string;
  source_column_id: string;
  target_column_id: string;
  source_type: 'SRZ_ADLS';
  target_type: 'CZ_ADLS' | 'SYNAPSE_TABLE';
  transformation?: string;
  join_clause?: string;
  status: MappingStatus;
  created_by: string;
  created_at: Date;
  updated_at?: Date;
  reviewer?: string;
  reviewed_at?: Date;
  comments?: string[];
}

// Utility functions for local storage
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const generateId = (): string => {
  return crypto.randomUUID();
};

// Convert database types to app types (keeping existing functions)
export const convertDbMappingFile = (
  dbFile: DatabaseMappingFile,
  rows: MappingRow[]
): MappingFile => ({
  id: dbFile.id,
  name: dbFile.name,
  description: dbFile.description,
  sourceSystem: dbFile.source_system,
  targetSystem: dbFile.target_system,
  status: dbFile.status,
  createdBy: dbFile.created_by,
  createdAt: dbFile.created_at,
  updatedAt: dbFile.updated_at,
  rows
});

export const convertDbMappingColumn = (dbColumn: DatabaseMappingColumn): MappingColumn => ({
  id: dbColumn.id,
  malcode: dbColumn.malcode,
  table: dbColumn.table_name,
  column: dbColumn.column_name,
  dataType: dbColumn.data_type,
  businessMetadata: {
    malcodeDescription: dbColumn.malcode_description,
    tableDescription: dbColumn.table_description,
    columnDescription: dbColumn.column_description,
  },
  isPrimaryKey: dbColumn.is_primary_key,
  isNullable: dbColumn.is_nullable,
  defaultValue: dbColumn.default_value,
});

export const convertDbMappingRow = (
  dbRow: DatabaseMappingRow,
  sourceColumn: DatabaseMappingColumn,
  targetColumn: DatabaseMappingColumn
): MappingRow => ({
  id: dbRow.id,
  sourceColumn: {
    ...convertDbMappingColumn(sourceColumn),
    sourceType: dbRow.source_type
  },
  targetColumn: {
    ...convertDbMappingColumn(targetColumn),
    targetType: dbRow.target_type
  },
  transformation: dbRow.transformation,
  join: dbRow.join_clause,
  status: dbRow.status,
  createdBy: dbRow.created_by,
  createdAt: dbRow.created_at,
  updatedAt: dbRow.updated_at,
  reviewer: dbRow.reviewer,
  reviewedAt: dbRow.reviewed_at,
  comments: dbRow.comments || [],
});

// Simulated service functions
export const createMappingFile = async (mappingFile: MappingFile): Promise<string> => {
  const files = getFromStorage<DatabaseMappingFile>(STORAGE_KEYS.MAPPING_FILES);
  const id = generateId();
  
  const dbFile: DatabaseMappingFile = {
    id,
    name: mappingFile.name,
    description: mappingFile.description,
    source_system: mappingFile.sourceSystem,
    target_system: mappingFile.targetSystem,
    status: mappingFile.status,
    created_by: mappingFile.createdBy,
    created_at: new Date(),
  };
  
  files.push(dbFile);
  saveToStorage(STORAGE_KEYS.MAPPING_FILES, files);
  
  return id;
};

export const upsertMappingColumn = async (column: MappingColumn): Promise<string> => {
  const columns = getFromStorage<DatabaseMappingColumn>(STORAGE_KEYS.MAPPING_COLUMNS);
  
  // Check if column exists
  const existing = columns.find(col => 
    col.malcode === column.malcode && 
    col.table_name === column.table && 
    col.column_name === column.column
  );
  
  if (existing) {
    return existing.id;
  }
  
  // Create new column
  const id = generateId();
  const dbColumn: DatabaseMappingColumn = {
    id,
    malcode: column.malcode,
    table_name: column.table,
    column_name: column.column,
    data_type: column.dataType,
    malcode_description: column.businessMetadata?.malcodeDescription,
    table_description: column.businessMetadata?.tableDescription,
    column_description: column.businessMetadata?.columnDescription,
    is_primary_key: column.isPrimaryKey,
    is_nullable: column.isNullable,
    default_value: column.defaultValue,
    created_at: new Date(),
  };
  
  columns.push(dbColumn);
  saveToStorage(STORAGE_KEYS.MAPPING_COLUMNS, columns);
  
  return id;
};

export const createMappingRow = async (
  mappingFileId: string,
  row: MappingRow
): Promise<void> => {
  const sourceColumnId = await upsertMappingColumn(row.sourceColumn);
  const targetColumnId = await upsertMappingColumn(row.targetColumn);
  
  const rows = getFromStorage<DatabaseMappingRow>(STORAGE_KEYS.MAPPING_ROWS);
  
  const dbRow: DatabaseMappingRow = {
    id: generateId(),
    mapping_file_id: mappingFileId,
    source_column_id: sourceColumnId,
    target_column_id: targetColumnId,
    source_type: row.sourceColumn.sourceType as 'SRZ_ADLS',
    target_type: row.targetColumn.targetType as 'CZ_ADLS' | 'SYNAPSE_TABLE',
    transformation: row.transformation,
    join_clause: row.join,
    status: row.status,
    created_by: row.createdBy,
    created_at: new Date(),
    reviewer: row.reviewer,
    reviewed_at: row.reviewedAt,
    comments: row.comments || [],
  };
  
  rows.push(dbRow);
  saveToStorage(STORAGE_KEYS.MAPPING_ROWS, rows);
};

export const saveMappingFile = async (mappingFile: MappingFile): Promise<void> => {
  console.log('Saving mapping file to simulated Azure SQL:', mappingFile.name);
  
  const files = getFromStorage<DatabaseMappingFile>(STORAGE_KEYS.MAPPING_FILES);
  const existingFileIndex = files.findIndex(f => f.name === mappingFile.name);
  
  let mappingFileId: string;
  
  if (existingFileIndex >= 0) {
    // Update existing file
    mappingFileId = files[existingFileIndex].id;
    files[existingFileIndex] = {
      ...files[existingFileIndex],
      description: mappingFile.description,
      source_system: mappingFile.sourceSystem,
      target_system: mappingFile.targetSystem,
      status: mappingFile.status,
      updated_at: new Date(),
    };
    
    // Delete existing rows for this file
    const rows = getFromStorage<DatabaseMappingRow>(STORAGE_KEYS.MAPPING_ROWS);
    const filteredRows = rows.filter(row => row.mapping_file_id !== mappingFileId);
    saveToStorage(STORAGE_KEYS.MAPPING_ROWS, filteredRows);
  } else {
    // Create new file
    mappingFileId = await createMappingFile(mappingFile);
  }
  
  saveToStorage(STORAGE_KEYS.MAPPING_FILES, files);
  
  // Save all mapping rows
  for (const row of mappingFile.rows) {
    await createMappingRow(mappingFileId, row);
  }
  
  console.log('Successfully saved mapping file to simulated Azure SQL');
};

export const loadMappingFiles = async (): Promise<MappingFile[]> => {
  console.log('Loading mapping files from simulated Azure SQL...');
  
  const files = getFromStorage<DatabaseMappingFile>(STORAGE_KEYS.MAPPING_FILES);
  const allColumns = getFromStorage<DatabaseMappingColumn>(STORAGE_KEYS.MAPPING_COLUMNS);
  const allRows = getFromStorage<DatabaseMappingRow>(STORAGE_KEYS.MAPPING_ROWS);
  
  const mappingFiles: MappingFile[] = [];
  
  for (const file of files) {
    // Get rows for this file
    const fileRows = allRows.filter(row => row.mapping_file_id === file.id);
    
    const mappingRows = fileRows.map(row => {
      const sourceColumn = allColumns.find(col => col.id === row.source_column_id);
      const targetColumn = allColumns.find(col => col.id === row.target_column_id);
      
      if (!sourceColumn || !targetColumn) {
        console.warn('Missing column data for row:', row.id);
        return null;
      }
      
      return convertDbMappingRow(row, sourceColumn, targetColumn);
    }).filter(Boolean) as MappingRow[];
    
    mappingFiles.push(convertDbMappingFile(file, mappingRows));
  }
  
  console.log(`Loaded ${mappingFiles.length} mapping files from simulated Azure SQL`);
  return mappingFiles;
};

export const updateMappingRowStatus = async (
  rowId: string,
  status: MappingStatus,
  reviewer?: string
): Promise<void> => {
  const rows = getFromStorage<DatabaseMappingRow>(STORAGE_KEYS.MAPPING_ROWS);
  const rowIndex = rows.findIndex(row => row.id === rowId);
  
  if (rowIndex >= 0) {
    rows[rowIndex] = {
      ...rows[rowIndex],
      status,
      reviewer,
      reviewed_at: new Date(),
      updated_at: new Date(),
    };
    saveToStorage(STORAGE_KEYS.MAPPING_ROWS, rows);
  }
};

export const addMappingRowComment = async (
  rowId: string,
  comment: string
): Promise<void> => {
  const rows = getFromStorage<DatabaseMappingRow>(STORAGE_KEYS.MAPPING_ROWS);
  const rowIndex = rows.findIndex(row => row.id === rowId);
  
  if (rowIndex >= 0) {
    const currentComments = rows[rowIndex].comments || [];
    rows[rowIndex] = {
      ...rows[rowIndex],
      comments: [...currentComments, comment],
    };
    saveToStorage(STORAGE_KEYS.MAPPING_ROWS, rows);
  }
};

// Initialize with sample data if storage is empty
export const initializeSampleData = (): void => {
  const files = getFromStorage<DatabaseMappingFile>(STORAGE_KEYS.MAPPING_FILES);
  
  if (files.length === 0) {
    console.log('Initializing with sample mapping data...');
    
    // This would typically be called on first load to populate with sample data
    // For now, we'll just log that the system is ready
    console.log('Simulated Azure SQL Database ready');
  }
};
