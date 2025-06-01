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
      console.log('MetadataService.getAllMalcodes: Starting query...');
      
      const { data, error } = await supabase
        .from('malcode_metadata')
        .select('*')
        .eq('is_active', true)
        .order('malcode');

      if (error) {
        console.error('MetadataService.getAllMalcodes: Supabase error:', error);
        throw error;
      }
      
      console.log('MetadataService.getAllMalcodes: Received data:', data);
      console.log('MetadataService.getAllMalcodes: Data length:', data?.length || 0);
      
      // If no data found, let's try to create some sample data
      if (!data || data.length === 0) {
        console.log('MetadataService.getAllMalcodes: No data found, creating sample data...');
        await this.createSampleData();
        
        // Try again after creating sample data
        const { data: retryData, error: retryError } = await supabase
          .from('malcode_metadata')
          .select('*')
          .eq('is_active', true)
          .order('malcode');
          
        if (retryError) {
          console.error('MetadataService.getAllMalcodes: Retry error:', retryError);
          throw retryError;
        }
        
        console.log('MetadataService.getAllMalcodes: Retry data:', retryData);
        return retryData || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('MetadataService.getAllMalcodes: Error:', error);
      throw error;
    }
  }

  private async createSampleData(): Promise<void> {
    try {
      console.log('MetadataService.createSampleData: Creating sample malcodes...');
      
      const sampleMalcodes = [
        { malcode: 'CUST', business_description: 'Customer data and information', created_by: 'system' },
        { malcode: 'PROD', business_description: 'Product catalog and inventory', created_by: 'system' },
        { malcode: 'ORD', business_description: 'Order processing and management', created_by: 'system' },
        { malcode: 'FIN', business_description: 'Financial transactions and accounting', created_by: 'system' },
        { malcode: 'HR', business_description: 'Human resources and employee data', created_by: 'system' }
      ];

      const { data: malcodeData, error: malcodeError } = await supabase
        .from('malcode_metadata')
        .insert(sampleMalcodes)
        .select();

      if (malcodeError) {
        console.error('MetadataService.createSampleData: Error creating malcodes:', malcodeError);
        return; // Don't throw, just log and continue
      }

      console.log('MetadataService.createSampleData: Created malcodes:', malcodeData);

      // Create sample tables for each malcode
      if (malcodeData && malcodeData.length > 0) {
        for (const malcode of malcodeData) {
          const sampleTables = [
            { malcode_id: malcode.id, table_name: `${malcode.malcode}_MAIN`, business_description: `Main ${malcode.malcode.toLowerCase()} table`, created_by: 'system' },
            { malcode_id: malcode.id, table_name: `${malcode.malcode}_DETAILS`, business_description: `Details for ${malcode.malcode.toLowerCase()}`, created_by: 'system' }
          ];

          const { data: tableData, error: tableError } = await supabase
            .from('table_metadata')
            .insert(sampleTables)
            .select();

          if (tableError) {
            console.error('MetadataService.createSampleData: Error creating tables:', tableError);
            continue;
          }

          // Create sample columns for each table
          if (tableData && tableData.length > 0) {
            for (const table of tableData) {
              const sampleColumns = [
                { table_id: table.id, column_name: 'ID', data_type: 'integer', business_description: 'Primary key', is_primary_key: true, is_nullable: false, created_by: 'system' },
                { table_id: table.id, column_name: 'NAME', data_type: 'string', business_description: 'Name field', created_by: 'system' },
                { table_id: table.id, column_name: 'CREATED_DATE', data_type: 'date', business_description: 'Creation date', created_by: 'system' }
              ];

              const { error: columnError } = await supabase
                .from('column_metadata')
                .insert(sampleColumns);

              if (columnError) {
                console.error('MetadataService.createSampleData: Error creating columns:', columnError);
              }
            }
          }
        }
      }

      console.log('MetadataService.createSampleData: Sample data creation completed');
    } catch (error) {
      console.error('MetadataService.createSampleData: Error:', error);
      // Don't throw, just log the error
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
