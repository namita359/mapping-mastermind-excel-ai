import { MappingFile, MappingRow, MappingColumn, MappingStatus } from './types';
import { createAzureSqlBackendService } from './azureSqlBackendService';

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

// Convert database types to app types
const convertDbMappingFile = (
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

const convertDbMappingColumn = (dbColumn: DatabaseMappingColumn): MappingColumn => ({
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

const convertDbMappingRow = (
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

// Azure SQL backend service functions
const createMappingFile = async (mappingFile: MappingFile): Promise<string> => {
  const backendService = createAzureSqlBackendService();
  await backendService.saveMappingFile(mappingFile);
  return mappingFile.id;
};

const upsertMappingColumn = async (column: MappingColumn): Promise<string> => {
  // This will be handled by the backend when saving mapping files
  return column.id;
};

const createMappingRow = async (
  mappingFileId: string,
  row: MappingRow
): Promise<void> => {
  // This will be handled by the backend when saving mapping files
  console.log('Creating mapping row for file:', mappingFileId);
};

const saveMappingFile = async (mappingFile: MappingFile): Promise<void> => {
  const backendService = createAzureSqlBackendService();
  await backendService.saveMappingFile(mappingFile);
};

const loadMappingFiles = async (): Promise<MappingFile[]> => {
  const backendService = createAzureSqlBackendService();
  return await backendService.loadMappingFiles();
};

const updateMappingRowStatus = async (
  rowId: string,
  status: MappingStatus,
  reviewer?: string
): Promise<void> => {
  const backendService = createAzureSqlBackendService();
  await backendService.updateMappingRowStatus(rowId, status, reviewer);
};

const addMappingRowComment = async (
  rowId: string,
  comment: string
): Promise<void> => {
  const backendService = createAzureSqlBackendService();
  await backendService.addMappingRowComment(rowId, comment);
};

// Initialize function (no longer needed for Azure SQL)
const initializeSampleData = (): void => {
  console.log('Azure SQL database ready - sample data should be populated via backend API');
};

// Service object that groups all the functions
export const azureSqlService = {
  createMappingFile,
  upsertMappingColumn,
  createMappingRow: async (row: MappingRow): Promise<void> => {
    // For standalone row creation, we'll use the backend service
    const backendService = createAzureSqlBackendService();
    
    // Create a temporary mapping file for the row
    const tempMappingFile: MappingFile = {
      id: `temp-${Date.now()}`,
      name: 'Temporary Mapping File',
      description: 'Auto-created for standalone mapping',
      sourceSystem: 'Various',
      targetSystem: 'Various',
      status: 'draft',
      createdBy: 'system',
      createdAt: new Date(),
      rows: [row]
    };
    
    await backendService.saveMappingFile(tempMappingFile);
  },
  saveMappingFile,
  loadMappingFiles,
  updateMappingRowStatus,
  addMappingRowComment,
  initializeSampleData,
};

// Export individual functions for backward compatibility
export {
  createMappingFile,
  upsertMappingColumn,
  createMappingRow,
  saveMappingFile,
  loadMappingFiles,
  updateMappingRowStatus,
  addMappingRowComment,
  initializeSampleData,
  convertDbMappingFile,
  convertDbMappingColumn,
  convertDbMappingRow,
};
