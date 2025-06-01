
import { createAzureSqlBackendService } from './azureSqlBackendService';

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
  private backendService = createAzureSqlBackendService();

  async searchMetadata(searchTerm: string): Promise<MetadataSearchResult[]> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search metadata: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching metadata:', error);
      throw error;
    }
  }

  async createMalcodeMetadata(malcode: string, businessDescription: string, createdBy: string): Promise<MalcodeMetadata> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/malcodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          malcode,
          business_description: businessDescription,
          created_by: createdBy
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create malcode: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating malcode metadata:', error);
      throw error;
    }
  }

  async createTableMetadata(malcodeId: string, tableName: string, businessDescription: string, createdBy: string): Promise<TableMetadata> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          malcode_id: malcodeId,
          table_name: tableName,
          business_description: businessDescription,
          created_by: createdBy
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create table: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating table metadata:', error);
      throw error;
    }
  }

  async createColumnMetadata(tableId: string, columnData: Partial<ColumnMetadata>): Promise<ColumnMetadata> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_id: tableId,
          ...columnData
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create column: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating column metadata:', error);
      throw error;
    }
  }

  async getMalcodeByName(malcode: string): Promise<MalcodeMetadata | null> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/malcodes/${encodeURIComponent(malcode)}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get malcode: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting malcode:', error);
      throw error;
    }
  }

  async getTableByMalcodeAndName(malcodeId: string, tableName: string): Promise<TableMetadata | null> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/tables?malcode_id=${encodeURIComponent(malcodeId)}&table_name=${encodeURIComponent(tableName)}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get table: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tables?.[0] || null;
    } catch (error) {
      console.error('Error getting table:', error);
      throw error;
    }
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    try {
      console.log('MetadataService.getAllMalcodes: Starting API call...');
      
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/malcodes`);
      
      if (!response.ok) {
        console.error('MetadataService.getAllMalcodes: API error:', response.statusText);
        throw new Error(`Failed to get malcodes: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('MetadataService.getAllMalcodes: Received data:', data);
      
      return data.malcodes || [];
    } catch (error) {
      console.error('MetadataService.getAllMalcodes: Error:', error);
      throw error;
    }
  }

  async getTablesByMalcode(malcodeId: string): Promise<TableMetadata[]> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/tables?malcode_id=${encodeURIComponent(malcodeId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get tables: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tables || [];
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  }

  async getColumnsByTable(tableId: string): Promise<ColumnMetadata[]> {
    try {
      const response = await fetch(`${this.backendService['baseUrl']}/api/metadata/columns?table_id=${encodeURIComponent(tableId)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get columns: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.columns || [];
    } catch (error) {
      console.error('Error getting columns:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
