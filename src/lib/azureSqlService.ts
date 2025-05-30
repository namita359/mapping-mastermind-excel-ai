
import sql from 'mssql';
import { MappingFile, MappingRow, MappingColumn, MappingStatus } from './types';

// Azure SQL Database configuration
const azureSqlConfig: sql.config = {
  server: process.env.AZURE_SQL_SERVER || 'your-server.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'your-database',
  user: process.env.AZURE_SQL_USER || 'your-username',
  password: process.env.AZURE_SQL_PASSWORD || 'your-password',
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: false // Don't trust self-signed certificates
  }
};

let pool: sql.ConnectionPool | null = null;

// Get database connection pool
const getPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = new sql.ConnectionPool(azureSqlConfig);
    await pool.connect();
  }
  return pool;
};

// Database interfaces
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

// Service functions
export const createMappingFile = async (mappingFile: MappingFile): Promise<string> => {
  const pool = await getPool();
  const request = pool.request();
  
  const result = await request
    .input('id', sql.UniqueIdentifier, sql.UniqueIdentifier.NULL)
    .input('name', sql.NVarChar, mappingFile.name)
    .input('description', sql.NVarChar, mappingFile.description)
    .input('source_system', sql.NVarChar, mappingFile.sourceSystem)
    .input('target_system', sql.NVarChar, mappingFile.targetSystem)
    .input('status', sql.NVarChar, mappingFile.status)
    .input('created_by', sql.NVarChar, mappingFile.createdBy)
    .query(`
      INSERT INTO mapping_files (id, name, description, source_system, target_system, status, created_by)
      OUTPUT INSERTED.id
      VALUES (NEWID(), @name, @description, @source_system, @target_system, @status, @created_by)
    `);

  return result.recordset[0].id;
};

export const upsertMappingColumn = async (column: MappingColumn): Promise<string> => {
  const pool = await getPool();
  const request = pool.request();

  // Check if column exists
  const existingResult = await request
    .input('malcode', sql.NVarChar, column.malcode)
    .input('table_name', sql.NVarChar, column.table)
    .input('column_name', sql.NVarChar, column.column)
    .query(`
      SELECT id FROM mapping_columns 
      WHERE malcode = @malcode AND table_name = @table_name AND column_name = @column_name
    `);

  if (existingResult.recordset.length > 0) {
    return existingResult.recordset[0].id;
  }

  // Create new column
  const newRequest = pool.request();
  const result = await newRequest
    .input('malcode', sql.NVarChar, column.malcode)
    .input('table_name', sql.NVarChar, column.table)
    .input('column_name', sql.NVarChar, column.column)
    .input('data_type', sql.NVarChar, column.dataType)
    .input('malcode_description', sql.NVarChar, column.businessMetadata?.malcodeDescription)
    .input('table_description', sql.NVarChar, column.businessMetadata?.tableDescription)
    .input('column_description', sql.NVarChar, column.businessMetadata?.columnDescription)
    .input('is_primary_key', sql.Bit, column.isPrimaryKey)
    .input('is_nullable', sql.Bit, column.isNullable)
    .input('default_value', sql.NVarChar, column.defaultValue)
    .query(`
      INSERT INTO mapping_columns (
        id, malcode, table_name, column_name, data_type, malcode_description,
        table_description, column_description, is_primary_key, is_nullable, default_value
      )
      OUTPUT INSERTED.id
      VALUES (
        NEWID(), @malcode, @table_name, @column_name, @data_type, @malcode_description,
        @table_description, @column_description, @is_primary_key, @is_nullable, @default_value
      )
    `);

  return result.recordset[0].id;
};

export const createMappingRow = async (
  mappingFileId: string,
  row: MappingRow
): Promise<void> => {
  const sourceColumnId = await upsertMappingColumn(row.sourceColumn);
  const targetColumnId = await upsertMappingColumn(row.targetColumn);

  const pool = await getPool();
  const request = pool.request();

  await request
    .input('mapping_file_id', sql.UniqueIdentifier, mappingFileId)
    .input('source_column_id', sql.UniqueIdentifier, sourceColumnId)
    .input('target_column_id', sql.UniqueIdentifier, targetColumnId)
    .input('source_type', sql.NVarChar, row.sourceColumn.sourceType)
    .input('target_type', sql.NVarChar, row.targetColumn.targetType)
    .input('transformation', sql.NVarChar, row.transformation)
    .input('join_clause', sql.NVarChar, row.join)
    .input('status', sql.NVarChar, row.status)
    .input('created_by', sql.NVarChar, row.createdBy)
    .input('reviewer', sql.NVarChar, row.reviewer)
    .input('reviewed_at', sql.DateTime, row.reviewedAt)
    .input('comments', sql.NVarChar, JSON.stringify(row.comments || []))
    .query(`
      INSERT INTO mapping_rows (
        id, mapping_file_id, source_column_id, target_column_id, source_type, target_type,
        transformation, join_clause, status, created_by, reviewer, reviewed_at, comments
      )
      VALUES (
        NEWID(), @mapping_file_id, @source_column_id, @target_column_id, @source_type, @target_type,
        @transformation, @join_clause, @status, @created_by, @reviewer, @reviewed_at, @comments
      )
    `);
};

export const saveMappingFile = async (mappingFile: MappingFile): Promise<void> => {
  console.log('Saving mapping file to Azure SQL:', mappingFile.name);
  
  try {
    const pool = await getPool();
    
    // Check if file exists
    const existingRequest = pool.request();
    const existingResult = await existingRequest
      .input('name', sql.NVarChar, mappingFile.name)
      .query('SELECT id FROM mapping_files WHERE name = @name');

    let mappingFileId: string;

    if (existingResult.recordset.length > 0) {
      // Update existing file
      mappingFileId = existingResult.recordset[0].id;
      
      const updateRequest = pool.request();
      await updateRequest
        .input('id', sql.UniqueIdentifier, mappingFileId)
        .input('description', sql.NVarChar, mappingFile.description)
        .input('source_system', sql.NVarChar, mappingFile.sourceSystem)
        .input('target_system', sql.NVarChar, mappingFile.targetSystem)
        .input('status', sql.NVarChar, mappingFile.status)
        .query(`
          UPDATE mapping_files 
          SET description = @description, source_system = @source_system, 
              target_system = @target_system, status = @status, updated_at = GETDATE()
          WHERE id = @id
        `);

      // Delete existing rows
      const deleteRequest = pool.request();
      await deleteRequest
        .input('mapping_file_id', sql.UniqueIdentifier, mappingFileId)
        .query('DELETE FROM mapping_rows WHERE mapping_file_id = @mapping_file_id');
    } else {
      // Create new file
      mappingFileId = await createMappingFile(mappingFile);
    }

    // Save all mapping rows
    for (const row of mappingFile.rows) {
      await createMappingRow(mappingFileId, row);
    }

    console.log('Successfully saved mapping file to Azure SQL');
  } catch (error) {
    console.error('Error saving mapping file to Azure SQL:', error);
    throw error;
  }
};

export const loadMappingFiles = async (): Promise<MappingFile[]> => {
  console.log('Loading mapping files from Azure SQL...');
  
  try {
    const pool = await getPool();
    
    // Get all mapping files
    const filesRequest = pool.request();
    const filesResult = await filesRequest.query(`
      SELECT * FROM mapping_files ORDER BY created_at DESC
    `);

    const mappingFiles: MappingFile[] = [];

    for (const file of filesResult.recordset) {
      // Get rows for this file with their columns
      const rowsRequest = pool.request();
      const rowsResult = await rowsRequest
        .input('mapping_file_id', sql.UniqueIdentifier, file.id)
        .query(`
          SELECT 
            r.*,
            sc.id as source_id, sc.malcode as source_malcode, sc.table_name as source_table,
            sc.column_name as source_column, sc.data_type as source_data_type,
            sc.malcode_description as source_malcode_desc, sc.table_description as source_table_desc,
            sc.column_description as source_column_desc, sc.is_primary_key as source_is_pk,
            sc.is_nullable as source_is_nullable, sc.default_value as source_default,
            sc.created_at as source_created_at,
            tc.id as target_id, tc.malcode as target_malcode, tc.table_name as target_table,
            tc.column_name as target_column, tc.data_type as target_data_type,
            tc.malcode_description as target_malcode_desc, tc.table_description as target_table_desc,
            tc.column_description as target_column_desc, tc.is_primary_key as target_is_pk,
            tc.is_nullable as target_is_nullable, tc.default_value as target_default,
            tc.created_at as target_created_at
          FROM mapping_rows r
          INNER JOIN mapping_columns sc ON r.source_column_id = sc.id
          INNER JOIN mapping_columns tc ON r.target_column_id = tc.id
          WHERE r.mapping_file_id = @mapping_file_id
        `);

      const mappingRows = rowsResult.recordset.map((row: any) => {
        const sourceColumn: DatabaseMappingColumn = {
          id: row.source_id,
          malcode: row.source_malcode,
          table_name: row.source_table,
          column_name: row.source_column,
          data_type: row.source_data_type,
          malcode_description: row.source_malcode_desc,
          table_description: row.source_table_desc,
          column_description: row.source_column_desc,
          is_primary_key: row.source_is_pk,
          is_nullable: row.source_is_nullable,
          default_value: row.source_default,
          created_at: row.source_created_at
        };

        const targetColumn: DatabaseMappingColumn = {
          id: row.target_id,
          malcode: row.target_malcode,
          table_name: row.target_table,
          column_name: row.target_column,
          data_type: row.target_data_type,
          malcode_description: row.target_malcode_desc,
          table_description: row.target_table_desc,
          column_description: row.target_column_desc,
          is_primary_key: row.target_is_pk,
          is_nullable: row.target_is_nullable,
          default_value: row.target_default,
          created_at: row.target_created_at
        };

        const dbRow: DatabaseMappingRow = {
          id: row.id,
          mapping_file_id: row.mapping_file_id,
          source_column_id: row.source_column_id,
          target_column_id: row.target_column_id,
          source_type: row.source_type,
          target_type: row.target_type,
          transformation: row.transformation,
          join_clause: row.join_clause,
          status: row.status,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          reviewer: row.reviewer,
          reviewed_at: row.reviewed_at,
          comments: row.comments ? JSON.parse(row.comments) : []
        };

        return convertDbMappingRow(dbRow, sourceColumn, targetColumn);
      });

      mappingFiles.push(convertDbMappingFile(file, mappingRows));
    }

    console.log(`Loaded ${mappingFiles.length} mapping files from Azure SQL`);
    return mappingFiles;
  } catch (error) {
    console.error('Error loading mapping files from Azure SQL:', error);
    throw error;
  }
};

export const updateMappingRowStatus = async (
  rowId: string,
  status: MappingStatus,
  reviewer?: string
): Promise<void> => {
  const pool = await getPool();
  const request = pool.request();

  await request
    .input('id', sql.UniqueIdentifier, rowId)
    .input('status', sql.NVarChar, status)
    .input('reviewer', sql.NVarChar, reviewer)
    .query(`
      UPDATE mapping_rows 
      SET status = @status, reviewer = @reviewer, reviewed_at = GETDATE(), updated_at = GETDATE()
      WHERE id = @id
    `);
};

export const addMappingRowComment = async (
  rowId: string,
  comment: string
): Promise<void> => {
  const pool = await getPool();
  
  // Get current comments
  const selectRequest = pool.request();
  const currentResult = await selectRequest
    .input('id', sql.UniqueIdentifier, rowId)
    .query('SELECT comments FROM mapping_rows WHERE id = @id');

  const currentComments = currentResult.recordset[0]?.comments 
    ? JSON.parse(currentResult.recordset[0].comments) 
    : [];
  
  const updatedComments = [...currentComments, comment];

  // Update with new comments
  const updateRequest = pool.request();
  await updateRequest
    .input('id', sql.UniqueIdentifier, rowId)
    .input('comments', sql.NVarChar, JSON.stringify(updatedComments))
    .query('UPDATE mapping_rows SET comments = @comments WHERE id = @id');
};
