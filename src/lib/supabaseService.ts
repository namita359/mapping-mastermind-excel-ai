
import { supabase } from '@/integrations/supabase/client';
import { MappingFile, MappingRow, MappingColumn, MappingStatus } from './types';

export interface DatabaseMappingFile {
  id: string;
  name: string;
  description?: string;
  source_system: string;
  target_system: string;
  status: MappingStatus;
  created_by: string;
  created_at: string;
  updated_at?: string;
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
  created_at: string;
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
  created_at: string;
  updated_at?: string;
  reviewer?: string;
  reviewed_at?: string;
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
  createdAt: new Date(dbFile.created_at),
  updatedAt: dbFile.updated_at ? new Date(dbFile.updated_at) : undefined,
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
  createdAt: new Date(dbRow.created_at),
  updatedAt: dbRow.updated_at ? new Date(dbRow.updated_at) : undefined,
  reviewer: dbRow.reviewer,
  reviewedAt: dbRow.reviewed_at ? new Date(dbRow.reviewed_at) : undefined,
  comments: dbRow.comments || [],
});

// Service functions
export const createMappingFile = async (mappingFile: MappingFile): Promise<string> => {
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
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const upsertMappingColumn = async (column: MappingColumn): Promise<string> => {
  // First, check if the column already exists
  const { data: existingColumn } = await supabase
    .from('mapping_columns')
    .select('id')
    .eq('malcode', column.malcode)
    .eq('table_name', column.table)
    .eq('column_name', column.column)
    .maybeSingle();

  if (existingColumn) {
    return existingColumn.id;
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
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const createMappingRow = async (
  mappingFileId: string,
  row: MappingRow
): Promise<void> => {
  // First, ensure the columns exist
  const sourceColumnId = await upsertMappingColumn(row.sourceColumn);
  const targetColumnId = await upsertMappingColumn(row.targetColumn);

  const { error } = await supabase
    .from('mapping_rows')
    .insert({
      mapping_file_id: mappingFileId,
      source_column_id: sourceColumnId,
      target_column_id: targetColumnId,
      source_type: row.sourceColumn.sourceType,
      target_type: row.targetColumn.targetType,
      transformation: row.transformation,
      join_clause: row.join,
      status: row.status,
      created_by: row.createdBy,
      reviewer: row.reviewer,
      reviewed_at: row.reviewedAt?.toISOString(),
      comments: row.comments,
    });

  if (error) throw error;
};

export const saveMappingFile = async (mappingFile: MappingFile): Promise<void> => {
  console.log('Saving mapping file to Supabase:', mappingFile.name);
  
  try {
    // Create or update the mapping file
    const { data: existingFile } = await supabase
      .from('mapping_files')
      .select('id')
      .eq('name', mappingFile.name)
      .maybeSingle();

    let mappingFileId: string;

    if (existingFile) {
      // Update existing file
      const { error: updateError } = await supabase
        .from('mapping_files')
        .update({
          description: mappingFile.description,
          source_system: mappingFile.sourceSystem,
          target_system: mappingFile.targetSystem,
          status: mappingFile.status,
        })
        .eq('id', existingFile.id);

      if (updateError) throw updateError;
      mappingFileId = existingFile.id;

      // Delete existing rows for this file
      const { error: deleteError } = await supabase
        .from('mapping_rows')
        .delete()
        .eq('mapping_file_id', mappingFileId);

      if (deleteError) throw deleteError;
    } else {
      // Create new file
      mappingFileId = await createMappingFile(mappingFile);
    }

    // Save all mapping rows
    for (const row of mappingFile.rows) {
      await createMappingRow(mappingFileId, row);
    }

    console.log('Successfully saved mapping file to Supabase');
  } catch (error) {
    console.error('Error saving mapping file to Supabase:', error);
    throw error;
  }
};

export const loadMappingFiles = async (): Promise<MappingFile[]> => {
  console.log('Loading mapping files from Supabase...');
  
  try {
    // Get all mapping files
    const { data: files, error: filesError } = await supabase
      .from('mapping_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (filesError) throw filesError;

    const mappingFiles: MappingFile[] = [];

    for (const file of files || []) {
      // Get rows for this file with their columns
      const { data: rows, error: rowsError } = await supabase
        .from('mapping_rows')
        .select(`
          *,
          source_column:mapping_columns!source_column_id(*),
          target_column:mapping_columns!target_column_id(*)
        `)
        .eq('mapping_file_id', file.id);

      if (rowsError) throw rowsError;

      const mappingRows = (rows || []).map((row: any) => 
        convertDbMappingRow(row, row.source_column, row.target_column)
      );

      mappingFiles.push(convertDbMappingFile(file, mappingRows));
    }

    console.log(`Loaded ${mappingFiles.length} mapping files from Supabase`);
    return mappingFiles;
  } catch (error) {
    console.error('Error loading mapping files from Supabase:', error);
    throw error;
  }
};

export const updateMappingRowStatus = async (
  rowId: string,
  status: MappingStatus,
  reviewer?: string
): Promise<void> => {
  const { error } = await supabase
    .from('mapping_rows')
    .update({
      status,
      reviewer,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', rowId);

  if (error) throw error;
};

export const addMappingRowComment = async (
  rowId: string,
  comment: string
): Promise<void> => {
  // First get the current comments
  const { data: currentRow, error: fetchError } = await supabase
    .from('mapping_rows')
    .select('comments')
    .eq('id', rowId)
    .single();

  if (fetchError) throw fetchError;

  const updatedComments = [...(currentRow.comments || []), comment];

  const { error } = await supabase
    .from('mapping_rows')
    .update({ comments: updatedComments })
    .eq('id', rowId);

  if (error) throw error;
};
