
const API_BASE_URL = 'http://localhost:3001/api/metadata';

export interface MalcodeMetadata {
  id: string;
  malcode: string;
  business_description?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export interface TableMetadata {
  id: string;
  table_name: string;
  business_description?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export interface ColumnMetadata {
  id: string;
  column_name: string;
  business_description?: string;
  data_type: string;
  is_primary_key?: boolean;
  is_nullable?: boolean;
  default_value?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
}

export interface SearchResult {
  malcode: string;
  table_name: string;
  column_name: string;
  data_type: string;
  business_description?: string;
}

export interface CreateMalcodeRequest {
  malcode: string;
  description: string;
  created_by: string;
}

export interface CreateTableRequest {
  malcode_id: string;
  table_name: string;
  description: string;
  created_by: string;
}

export interface CreateColumnRequest {
  table_id: string;
  column_name: string;
  data_type: string;
  business_description: string;
  is_primary_key: boolean;
  is_nullable: boolean;
  default_value?: string;
  created_by: string;
}

class MetadataServiceSplit {
  async searchMetadata(term: string): Promise<SearchResult[]> {
    const response = await fetch(`${API_BASE_URL}/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      throw new Error('Failed to search metadata');
    }
    const data = await response.json();
    return data.results;
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/malcodes`);
    if (!response.ok) {
      throw new Error('Failed to fetch malcodes');
    }
    const data = await response.json();
    return data.malcodes;
  }

  async getMalcodeByName(malcode: string): Promise<MalcodeMetadata> {
    const response = await fetch(`${API_BASE_URL}/malcodes/${encodeURIComponent(malcode)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch malcode');
    }
    return response.json();
  }

  async getTablesByMalcode(malcodeId: string): Promise<TableMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/tables?malcode_id=${encodeURIComponent(malcodeId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }
    const data = await response.json();
    return data.tables;
  }

  async getColumnsByTable(tableId: string): Promise<ColumnMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/columns?table_id=${encodeURIComponent(tableId)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch columns');
    }
    const data = await response.json();
    return data.columns;
  }

  async createMalcodeMetadata(malcode: string, description: string, createdBy: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/malcodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        malcode,
        description,
        created_by: createdBy,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create malcode');
    }

    const data = await response.json();
    return data.id;
  }

  async createTableMetadata(malcodeId: string, tableName: string, description: string, createdBy: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        malcode_id: malcodeId,
        table_name: tableName,
        description,
        created_by: createdBy,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create table');
    }

    const data = await response.json();
    return data.id;
  }

  async createColumnMetadata(tableId: string, columnData: CreateColumnRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_id: tableId,
        ...columnData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create column');
    }

    const data = await response.json();
    return data.id;
  }
}

export const metadataServiceSplit = new MetadataServiceSplit();
