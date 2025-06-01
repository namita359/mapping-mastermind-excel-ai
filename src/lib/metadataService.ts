
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

// Single metadata record from the denormalized table
interface MetadataSingle {
  id: string;
  malcode: string;
  malcode_description?: string;
  table_name: string;
  table_description?: string;
  column_name: string;
  column_description?: string;
  data_type: string;
  is_primary_key: boolean;
  is_nullable: boolean;
  default_value?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

class MetadataService {
  async searchMetadata(searchTerm: string): Promise<MetadataSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('metadata_single')
        .select('*')
        .or(`column_name.ilike.%${searchTerm}%,column_description.ilike.%${searchTerm}%,malcode_description.ilike.%${searchTerm}%`)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map((item: MetadataSingle) => ({
        malcode: item.malcode,
        table_name: item.table_name,
        column_name: item.column_name,
        business_description: item.column_description || item.table_description || item.malcode_description,
        data_type: item.data_type
      })) || [];
    } catch (error) {
      console.error('Error searching metadata:', error);
      throw error;
    }
  }

  async createMalcodeMetadata(malcode: string, businessDescription: string, createdBy: string): Promise<MalcodeMetadata> {
    // For the denormalized table, we don't create separate malcode records
    // This is a placeholder that maintains the interface
    return {
      id: `malcode-${Date.now()}`,
      malcode,
      business_description: businessDescription,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
  }

  async createTableMetadata(malcodeId: string, tableName: string, businessDescription: string, createdBy: string): Promise<TableMetadata> {
    // For the denormalized table, we don't create separate table records
    // This is a placeholder that maintains the interface
    return {
      id: `table-${Date.now()}`,
      malcode_id: malcodeId,
      table_name: tableName,
      business_description: businessDescription,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
  }

  async createColumnMetadata(tableId: string, columnData: Partial<ColumnMetadata>): Promise<ColumnMetadata> {
    try {
      const { data, error } = await supabase
        .from('metadata_single')
        .insert({
          malcode: columnData.column_name?.split('_')[0] || 'UNKNOWN',
          table_name: 'NEW_TABLE',
          column_name: columnData.column_name || 'NEW_COLUMN',
          data_type: columnData.data_type || 'string',
          column_description: columnData.business_description,
          is_primary_key: columnData.is_primary_key || false,
          is_nullable: columnData.is_nullable !== false,
          default_value: columnData.default_value,
          created_by: columnData.created_by || 'user'
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        table_id: tableId,
        column_name: data.column_name,
        data_type: data.data_type,
        business_description: data.column_description,
        is_primary_key: data.is_primary_key,
        is_nullable: data.is_nullable,
        default_value: data.default_value,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_active: data.is_active
      };
    } catch (error) {
      console.error('Error creating column metadata:', error);
      throw error;
    }
  }

  async getMalcodeByName(malcode: string): Promise<MalcodeMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('metadata_single')
        .select('malcode, malcode_description, created_by, created_at, updated_at, is_active')
        .eq('malcode', malcode)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: `malcode-${malcode}`,
        malcode: data.malcode,
        business_description: data.malcode_description,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_active: data.is_active
      };
    } catch (error) {
      console.error('Error getting malcode:', error);
      throw error;
    }
  }

  async getTableByMalcodeAndName(malcodeId: string, tableName: string): Promise<TableMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('metadata_single')
        .select('table_name, table_description, created_by, created_at, updated_at, is_active')
        .eq('table_name', tableName)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: `table-${tableName}`,
        malcode_id: malcodeId,
        table_name: data.table_name,
        business_description: data.table_description,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_active: data.is_active
      };
    } catch (error) {
      console.error('Error getting table:', error);
      throw error;
    }
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    try {
      console.log('MetadataService.getAllMalcodes: Starting query...');
      
      const { data, error } = await supabase
        .from('metadata_single')
        .select('malcode, malcode_description, created_by, created_at, updated_at, is_active')
        .eq('is_active', true);

      if (error) {
        console.error('MetadataService.getAllMalcodes: Supabase error:', error);
        throw error;
      }
      
      console.log('MetadataService.getAllMalcodes: Received data:', data);
      console.log('MetadataService.getAllMalcodes: Data length:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('MetadataService.getAllMalcodes: No data found');
        return [];
      }
      
      // Group by malcode to get unique malcodes
      const malcodeMap = new Map<string, MalcodeMetadata>();
      
      data.forEach((row: any) => {
        if (!malcodeMap.has(row.malcode)) {
          malcodeMap.set(row.malcode, {
            id: `malcode-${row.malcode}`,
            malcode: row.malcode,
            business_description: row.malcode_description,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active
          });
        }
      });
      
      const uniqueMalcodes = Array.from(malcodeMap.values());
      console.log('MetadataService.getAllMalcodes: Unique malcodes:', uniqueMalcodes);
      
      return uniqueMalcodes;
    } catch (error) {
      console.error('MetadataService.getAllMalcodes: Error:', error);
      throw error;
    }
  }

  async getTablesByMalcode(malcodeId: string): Promise<TableMetadata[]> {
    try {
      // Extract malcode from the ID (format: malcode-XXXX)
      const malcode = malcodeId.replace('malcode-', '');
      
      const { data, error } = await supabase
        .from('metadata_single')
        .select('table_name, table_description, created_by, created_at, updated_at, is_active')
        .eq('malcode', malcode)
        .eq('is_active', true);

      if (error) throw error;
      
      // Group by table_name to get unique tables
      const tableMap = new Map<string, TableMetadata>();
      
      data?.forEach((row: any) => {
        if (!tableMap.has(row.table_name)) {
          tableMap.set(row.table_name, {
            id: `table-${row.table_name}`,
            malcode_id: malcodeId,
            table_name: row.table_name,
            business_description: row.table_description,
            created_by: row.created_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active
          });
        }
      });
      
      return Array.from(tableMap.values());
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  }

  async getColumnsByTable(tableId: string): Promise<ColumnMetadata[]> {
    try {
      // Extract table name from the ID (format: table-XXXX)
      const tableName = tableId.replace('table-', '');
      
      const { data, error } = await supabase
        .from('metadata_single')
        .select('*')
        .eq('table_name', tableName)
        .eq('is_active', true)
        .order('column_name');

      if (error) throw error;
      
      return data?.map((row: MetadataSingle) => ({
        id: row.id,
        table_id: tableId,
        column_name: row.column_name,
        data_type: row.data_type,
        business_description: row.column_description,
        is_primary_key: row.is_primary_key,
        is_nullable: row.is_nullable,
        default_value: row.default_value,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_active: row.is_active
      })) || [];
    } catch (error) {
      console.error('Error getting columns:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
