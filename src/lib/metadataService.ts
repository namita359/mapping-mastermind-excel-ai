
import { supabase } from '@/integrations/supabase/client';

export interface MalcodeMetadata {
  id: string;
  malcode: string;
  business_description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TableMetadata {
  id: string;
  malcode_id: string;
  table_name: string;
  business_description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ColumnMetadata {
  id: string;
  table_id: string;
  column_name: string;
  data_type?: string;
  business_description?: string;
  is_primary_key: boolean;
  is_nullable: boolean;
  default_value?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MetadataSearchResult {
  malcode: string;
  table_name: string;
  column_name: string;
  business_description?: string;
  data_type?: string;
}

class MetadataService {
  async searchMetadata(searchTerm: string): Promise<MetadataSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('column_metadata')
        .select(`
          column_name,
          data_type,
          business_description,
          table_metadata!inner(
            table_name,
            business_description,
            malcode_metadata!inner(
              malcode,
              business_description
            )
          )
        `)
        .or(`column_name.ilike.%${searchTerm}%,business_description.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map((item: any) => ({
        malcode: item.table_metadata.malcode_metadata.malcode,
        table_name: item.table_metadata.table_name,
        column_name: item.column_name,
        business_description: item.business_description || item.table_metadata.business_description,
        data_type: item.data_type
      })) || [];
    } catch (error) {
      console.error('Error searching metadata:', error);
      throw error;
    }
  }

  async createMalcodeMetadata(malcode: string, businessDescription: string, createdBy: string): Promise<MalcodeMetadata> {
    try {
      const { data, error } = await supabase
        .from('malcode_metadata')
        .insert({
          malcode,
          business_description: businessDescription,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating malcode metadata:', error);
      throw error;
    }
  }

  async createTableMetadata(malcodeId: string, tableName: string, businessDescription: string, createdBy: string): Promise<TableMetadata> {
    try {
      const { data, error } = await supabase
        .from('table_metadata')
        .insert({
          malcode_id: malcodeId,
          table_name: tableName,
          business_description: businessDescription,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating table metadata:', error);
      throw error;
    }
  }

  async createColumnMetadata(tableId: string, columnData: Partial<ColumnMetadata>): Promise<ColumnMetadata> {
    try {
      const { data, error } = await supabase
        .from('column_metadata')
        .insert({
          table_id: tableId,
          ...columnData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating column metadata:', error);
      throw error;
    }
  }

  async getMalcodeByName(malcode: string): Promise<MalcodeMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('malcode_metadata')
        .select('*')
        .eq('malcode', malcode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting malcode:', error);
      throw error;
    }
  }

  async getTableByMalcodeAndName(malcodeId: string, tableName: string): Promise<TableMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('table_metadata')
        .select('*')
        .eq('malcode_id', malcodeId)
        .eq('table_name', tableName)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting table:', error);
      throw error;
    }
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('malcode_metadata')
        .select('*')
        .eq('is_active', true)
        .order('malcode');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting malcodes:', error);
      throw error;
    }
  }

  async getTablesByMalcode(malcodeId: string): Promise<TableMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('table_metadata')
        .select('*')
        .eq('malcode_id', malcodeId)
        .eq('is_active', true)
        .order('table_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  }

  async getColumnsByTable(tableId: string): Promise<ColumnMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('column_metadata')
        .select('*')
        .eq('table_id', tableId)
        .eq('is_active', true)
        .order('column_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting columns:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
