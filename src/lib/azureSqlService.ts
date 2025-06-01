import { MappingFile, MappingRow, MappingColumn, MappingStatus } from './types';
import { supabase } from '@/integrations/supabase/client';

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

// Supabase service functions
const createMappingFile = async (mappingFile: MappingFile): Promise<string> => {
  console.log('Creating mapping file in Supabase:', mappingFile.name);
  
  const { data, error } = await supabase
    .from('mapping_files')
    .insert({
      name: mappingFile.name,
      description: mappingFile.description,
      source_system: mappingFile.sourceSystem,
      target_system: mappingFile.targetSystem,
      status: mappingFile.status,
      created_by: mappingFile.createdBy,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mapping file:', error);
    throw error;
  }
  
  console.log('Successfully created mapping file:', data.id);
  return data.id;
};

const upsertMappingColumn = async (column: MappingColumn): Promise<string> => {
  console.log('Upserting mapping column:', column.malcode, column.table, column.column);
  
  // Check if column exists
  const { data: existing, error: selectError } = await supabase
    .from('mapping_columns')
    .select('id')
    .eq('malcode', column.malcode)
    .eq('table_name', column.table)
    .eq('column_name', column.column)
    .maybeSingle();
  
  if (selectError) {
    console.error('Error checking existing column:', selectError);
    throw selectError;
  }
  
  if (existing) {
    console.log('Column already exists:', existing.id);
    return existing.id;
  }
  
  // Create new column
  const { data, error } = await supabase
    .from('mapping_columns')
    .insert({
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
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mapping column:', error);
    throw error;
  }
  
  console.log('Successfully created mapping column:', data.id);
  return data.id;
};

const createMappingRow = async (
  mappingFileId: string,
  row: MappingRow
): Promise<void> => {
  console.log('Creating mapping row for file:', mappingFileId);
  
  const sourceColumnId = await upsertMappingColumn(row.sourceColumn);
  const targetColumnId = await upsertMappingColumn(row.targetColumn);
  
  const { error } = await supabase
    .from('mapping_rows')
    .insert({
      mapping_file_id: mappingFileId,
      source_column_id: sourceColumnId,
      target_column_id: targetColumnId,
      source_type: row.sourceColumn.sourceType as 'SRZ_ADLS',
      target_type: row.targetColumn.targetType as 'CZ_ADLS' | 'SYNAPSE_TABLE',
      transformation: row.transformation,
      join_clause: row.join,
      status: row.status,
      created_by: row.createdBy,
      reviewer: row.reviewer,
      reviewed_at: row.reviewedAt,
      comments: row.comments || [],
    });
  
  if (error) {
    console.error('Error creating mapping row:', error);
    throw error;
  }
  
  console.log('Successfully created mapping row');
};

const saveMappingFile = async (mappingFile: MappingFile): Promise<void> => {
  console.log('Saving mapping file to Supabase:', mappingFile.name);
  
  // Check if file exists
  const { data: existingFile, error: selectError } = await supabase
    .from('mapping_files')
    .select('id')
    .eq('name', mappingFile.name)
    .maybeSingle();
  
  if (selectError) {
    console.error('Error checking existing file:', selectError);
    throw selectError;
  }
  
  let mappingFileId: string;
  
  if (existingFile) {
    // Update existing file
    mappingFileId = existingFile.id;
    const { error: updateError } = await supabase
      .from('mapping_files')
      .update({
        description: mappingFile.description,
        source_system: mappingFile.sourceSystem,
        target_system: mappingFile.targetSystem,
        status: mappingFile.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mappingFileId);
    
    if (updateError) {
      console.error('Error updating mapping file:', updateError);
      throw updateError;
    }
    
    // Delete existing rows for this file
    const { error: deleteError } = await supabase
      .from('mapping_rows')
      .delete()
      .eq('mapping_file_id', mappingFileId);
    
    if (deleteError) {
      console.error('Error deleting existing rows:', deleteError);
      throw deleteError;
    }
  } else {
    // Create new file
    mappingFileId = await createMappingFile(mappingFile);
  }
  
  // Save all mapping rows
  for (const row of mappingFile.rows) {
    await createMappingRow(mappingFileId, row);
  }
  
  console.log('Successfully saved mapping file to Supabase');
};

const loadMappingFiles = async (): Promise<MappingFile[]> => {
  console.log('Loading mapping files from Supabase...');
  
  const { data: files, error: filesError } = await supabase
    .from('mapping_files')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (filesError) {
    console.error('Error loading mapping files:', filesError);
    throw filesError;
  }
  
  const { data: allColumns, error: columnsError } = await supabase
    .from('mapping_columns')
    .select('*');
  
  if (columnsError) {
    console.error('Error loading mapping columns:', columnsError);
    throw columnsError;
  }
  
  const { data: allRows, error: rowsError } = await supabase
    .from('mapping_rows')
    .select('*');
  
  if (rowsError) {
    console.error('Error loading mapping rows:', rowsError);
    throw rowsError;
  }
  
  const mappingFiles: MappingFile[] = [];
  
  for (const file of files || []) {
    // Get rows for this file
    const fileRows = (allRows || []).filter(row => row.mapping_file_id === file.id);
    
    const mappingRows = fileRows.map(row => {
      const sourceColumn = (allColumns || []).find(col => col.id === row.source_column_id);
      const targetColumn = (allColumns || []).find(col => col.id === row.target_column_id);
      
      if (!sourceColumn || !targetColumn) {
        console.warn('Missing column data for row:', row.id);
        return null;
      }
      
      return convertDbMappingRow(row, sourceColumn, targetColumn);
    }).filter(Boolean) as MappingRow[];
    
    mappingFiles.push(convertDbMappingFile(file, mappingRows));
  }
  
  console.log(`Loaded ${mappingFiles.length} mapping files from Supabase`);
  return mappingFiles;
};

const updateMappingRowStatus = async (
  rowId: string,
  status: MappingStatus,
  reviewer?: string
): Promise<void> => {
  console.log('Updating mapping row status:', rowId, status);
  
  const { error } = await supabase
    .from('mapping_rows')
    .update({
      status,
      reviewer,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rowId);
  
  if (error) {
    console.error('Error updating mapping row status:', error);
    throw error;
  }
  
  console.log('Successfully updated mapping row status');
};

const addMappingRowComment = async (
  rowId: string,
  comment: string
): Promise<void> => {
  console.log('Adding comment to mapping row:', rowId);
  
  // Get current comments
  const { data: currentRow, error: selectError } = await supabase
    .from('mapping_rows')
    .select('comments')
    .eq('id', rowId)
    .single();
  
  if (selectError) {
    console.error('Error fetching current comments:', selectError);
    throw selectError;
  }
  
  const currentComments = currentRow.comments || [];
  const updatedComments = [...currentComments, comment];
  
  const { error } = await supabase
    .from('mapping_rows')
    .update({ comments: updatedComments })
    .eq('id', rowId);
  
  if (error) {
    console.error('Error adding comment to mapping row:', error);
    throw error;
  }
  
  console.log('Successfully added comment to mapping row');
};

// Initialize function (no longer needed for Supabase)
const initializeSampleData = (): void => {
  console.log('Supabase database ready - sample data should be populated via SQL migrations');
};

// Service object that groups all the functions
export const azureSqlService = {
  createMappingFile,
  upsertMappingColumn,
  createMappingRow: async (row: MappingRow): Promise<void> => {
    // For standalone row creation, we'll create a temporary file
    console.log('Creating standalone mapping row - this should be called with a proper file ID');
    
    // Get or create a default mapping file
    const { data: defaultFile, error: selectError } = await supabase
      .from('mapping_files')
      .select('id')
      .eq('name', 'Default Mapping File')
      .maybeSingle();
    
    let fileId: string;
    
    if (!defaultFile) {
      // Create default file
      const { data: newFile, error: createError } = await supabase
        .from('mapping_files')
        .insert({
          name: 'Default Mapping File',
          description: 'Auto-created file for standalone mappings',
          source_system: 'Various',
          target_system: 'Various',
          status: 'draft',
          created_by: 'system',
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating default file:', createError);
        throw createError;
      }
      
      fileId = newFile.id;
    } else {
      fileId = defaultFile.id;
    }
    
    return createMappingRow(fileId, row);
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
