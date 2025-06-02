
const API_BASE_URL = 'http://localhost:3001/api';

export interface MalcodeMetadata {
  id: string;
  malcode: string;
  business_description: string;
}

export interface TableMetadata {
  id: string;
  table_name: string;
  business_description: string;
}

export interface ColumnMetadata {
  id: string;
  column_name: string;
  data_type: string;
  business_description: string;
  is_primary_key?: boolean;
  is_nullable?: boolean;
  default_value?: string;
}

export interface SearchResult {
  id: string;
  type: 'malcode' | 'table' | 'column';
  malcode: string;
  table_name?: string;
  column_name?: string;
  business_description?: string;
  data_type?: string;
}

class MetadataService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    console.log(`MetadataService: Making request to ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      console.log(`MetadataService: Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MetadataService: HTTP ${response.status} - ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`MetadataService: Response data:`, data);
      return data;
    } catch (error) {
      console.error(`MetadataService: Network error for ${url}:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not available. Please check if the backend is running on http://localhost:3001');
      }
      
      throw error;
    }
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    try {
      console.log('MetadataService: Getting all malcodes...');
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/malcodes`);
      
      if (response && response.malcodes) {
        console.log(`MetadataService: Successfully retrieved ${response.malcodes.length} malcodes`);
        return response.malcodes;
      } else {
        console.warn('MetadataService: No malcodes in response');
        return [];
      }
    } catch (error) {
      console.error('MetadataService: Error getting malcodes:', error);
      throw error;
    }
  }

  async getTablesByMalcode(malcode: string): Promise<TableMetadata[]> {
    try {
      console.log(`MetadataService: Getting tables for malcode: ${malcode}`);
      
      // First get the malcode ID by searching through all malcodes
      const malcodesResponse = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/malcodes`);
      const malcodeObj = malcodesResponse?.malcodes?.find((m: MalcodeMetadata) => m.malcode === malcode);
      
      if (!malcodeObj) {
        console.error(`MetadataService: Could not find malcode object for: ${malcode}`);
        throw new Error(`Malcode not found: ${malcode}`);
      }
      
      console.log(`MetadataService: Found malcode object:`, malcodeObj);
      console.log(`MetadataService: Getting tables for malcode ID: ${malcodeObj.id}`);
      
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/tables?malcode_id=${encodeURIComponent(malcodeObj.id)}`);
      
      if (response && response.tables) {
        console.log(`MetadataService: Successfully retrieved ${response.tables.length} tables for malcode ${malcode}`);
        return response.tables;
      } else {
        console.warn(`MetadataService: No tables found for malcode: ${malcode}`);
        return [];
      }
    } catch (error) {
      console.error(`MetadataService: Error getting tables for malcode ${malcode}:`, error);
      throw error;
    }
  }

  async getColumnsByTable(malcode: string, tableName: string): Promise<ColumnMetadata[]> {
    try {
      console.log(`MetadataService: Getting columns for malcode: ${malcode}, table: ${tableName}`);
      
      // First get all malcodes to find the malcode ID
      const malcodesResponse = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/malcodes`);
      const malcodeObj = malcodesResponse?.malcodes?.find((m: MalcodeMetadata) => m.malcode === malcode);
      
      if (!malcodeObj) {
        console.error(`MetadataService: Could not find malcode object for: ${malcode}`);
        throw new Error(`Malcode not found: ${malcode}`);
      }
      
      // Then get tables for that malcode to find the table ID
      const tablesResponse = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/tables?malcode_id=${encodeURIComponent(malcodeObj.id)}`);
      const tableObj = tablesResponse?.tables?.find((t: TableMetadata) => t.table_name === tableName);
      
      if (!tableObj) {
        console.error(`MetadataService: Could not find table object for: ${tableName}`);
        throw new Error(`Table not found: ${tableName}`);
      }
      
      console.log(`MetadataService: Found table object:`, tableObj);
      console.log(`MetadataService: Getting columns for table ID: ${tableObj.id}`);
      
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/columns?table_id=${encodeURIComponent(tableObj.id)}`);
      
      if (response && response.columns) {
        console.log(`MetadataService: Successfully retrieved ${response.columns.length} columns for table ${tableName}`);
        return response.columns;
      } else {
        console.warn(`MetadataService: No columns found for table: ${tableName}`);
        return [];
      }
    } catch (error) {
      console.error(`MetadataService: Error getting columns for table ${tableName}:`, error);
      throw error;
    }
  }

  async searchMetadata(searchTerm: string): Promise<SearchResult[]> {
    try {
      console.log(`MetadataService: Searching metadata for term: ${searchTerm}`);
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (response && response.results) {
        console.log(`MetadataService: Found ${response.results.length} search results`);
        return response.results;
      } else {
        console.warn('MetadataService: No search results found');
        return [];
      }
    } catch (error) {
      console.error('MetadataService: Error searching metadata:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
