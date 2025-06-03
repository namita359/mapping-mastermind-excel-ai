
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

// Export alias for compatibility with components
export type MetadataSearchResult = SearchResult;

// Mock data for when backend is unavailable
const MOCK_MALCODES: MalcodeMetadata[] = [
  {
    id: 'mock-malcode-1',
    malcode: 'CUST',
    business_description: 'Customer related data and information'
  },
  {
    id: 'mock-malcode-2',
    malcode: 'PROD',
    business_description: 'Product catalog and inventory data'
  },
  {
    id: 'mock-malcode-3',
    malcode: 'ORD',
    business_description: 'Order management and transaction data'
  },
  {
    id: 'mock-malcode-4',
    malcode: 'FIN',
    business_description: 'Financial and accounting data'
  }
];

const MOCK_TABLES: { [malcode: string]: TableMetadata[] } = {
  'CUST': [
    {
      id: 'mock-table-cust-1',
      table_name: 'customer_profile',
      business_description: 'Core customer demographic and profile information'
    },
    {
      id: 'mock-table-cust-2',
      table_name: 'customer_address',
      business_description: 'Customer address and contact information'
    },
    {
      id: 'mock-table-cust-3',
      table_name: 'customer_preferences',
      business_description: 'Customer preferences and settings'
    }
  ],
  'PROD': [
    {
      id: 'mock-table-prod-1',
      table_name: 'product_catalog',
      business_description: 'Product details and specifications'
    },
    {
      id: 'mock-table-prod-2',
      table_name: 'product_inventory',
      business_description: 'Product stock and inventory levels'
    },
    {
      id: 'mock-table-prod-3',
      table_name: 'product_pricing',
      business_description: 'Product pricing and discount information'
    }
  ],
  'ORD': [
    {
      id: 'mock-table-ord-1',
      table_name: 'order_header',
      business_description: 'Order summary and header information'
    },
    {
      id: 'mock-table-ord-2',
      table_name: 'order_details',
      business_description: 'Detailed order line items and products'
    },
    {
      id: 'mock-table-ord-3',
      table_name: 'order_payments',
      business_description: 'Order payment and billing information'
    }
  ],
  'FIN': [
    {
      id: 'mock-table-fin-1',
      table_name: 'account_ledger',
      business_description: 'General ledger and account transactions'
    },
    {
      id: 'mock-table-fin-2',
      table_name: 'invoice_data',
      business_description: 'Invoice generation and tracking data'
    }
  ]
};

const MOCK_COLUMNS: { [tableName: string]: ColumnMetadata[] } = {
  'customer_profile': [
    {
      id: 'mock-col-1',
      column_name: 'customer_id',
      data_type: 'string',
      business_description: 'Unique customer identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-2',
      column_name: 'first_name',
      data_type: 'string',
      business_description: 'Customer first name',
      is_nullable: false
    },
    {
      id: 'mock-col-3',
      column_name: 'last_name',
      data_type: 'string',
      business_description: 'Customer last name',
      is_nullable: false
    },
    {
      id: 'mock-col-4',
      column_name: 'email_address',
      data_type: 'string',
      business_description: 'Customer primary email address',
      is_nullable: true
    },
    {
      id: 'mock-col-5',
      column_name: 'birth_date',
      data_type: 'date',
      business_description: 'Customer date of birth',
      is_nullable: true
    }
  ],
  'customer_address': [
    {
      id: 'mock-col-6',
      column_name: 'address_id',
      data_type: 'string',
      business_description: 'Unique address identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-7',
      column_name: 'customer_id',
      data_type: 'string',
      business_description: 'Reference to customer',
      is_nullable: false
    },
    {
      id: 'mock-col-8',
      column_name: 'street_address',
      data_type: 'string',
      business_description: 'Street address line',
      is_nullable: false
    },
    {
      id: 'mock-col-9',
      column_name: 'city',
      data_type: 'string',
      business_description: 'City name',
      is_nullable: false
    },
    {
      id: 'mock-col-10',
      column_name: 'postal_code',
      data_type: 'string',
      business_description: 'Postal or ZIP code',
      is_nullable: true
    }
  ],
  'product_catalog': [
    {
      id: 'mock-col-11',
      column_name: 'product_id',
      data_type: 'string',
      business_description: 'Unique product identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-12',
      column_name: 'product_name',
      data_type: 'string',
      business_description: 'Product display name',
      is_nullable: false
    },
    {
      id: 'mock-col-13',
      column_name: 'product_description',
      data_type: 'string',
      business_description: 'Detailed product description',
      is_nullable: true
    },
    {
      id: 'mock-col-14',
      column_name: 'category',
      data_type: 'string',
      business_description: 'Product category classification',
      is_nullable: false
    },
    {
      id: 'mock-col-15',
      column_name: 'unit_price',
      data_type: 'decimal',
      business_description: 'Base unit price before discounts',
      is_nullable: false
    }
  ],
  'order_header': [
    {
      id: 'mock-col-16',
      column_name: 'order_id',
      data_type: 'string',
      business_description: 'Unique order identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-17',
      column_name: 'customer_id',
      data_type: 'string',
      business_description: 'Customer who placed the order',
      is_nullable: false
    },
    {
      id: 'mock-col-18',
      column_name: 'order_date',
      data_type: 'datetime',
      business_description: 'Date and time order was placed',
      is_nullable: false
    },
    {
      id: 'mock-col-19',
      column_name: 'total_amount',
      data_type: 'decimal',
      business_description: 'Total order amount including tax',
      is_nullable: false
    },
    {
      id: 'mock-col-20',
      column_name: 'order_status',
      data_type: 'string',
      business_description: 'Current status of the order',
      is_nullable: false
    }
  ]
};

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
        console.log('MetadataService: Backend unavailable, falling back to mock data');
        throw new Error('BACKEND_UNAVAILABLE');
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
      if (error instanceof Error && error.message === 'BACKEND_UNAVAILABLE') {
        console.log('MetadataService: Using mock malcodes data');
        return MOCK_MALCODES;
      }
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
      if (error instanceof Error && error.message === 'BACKEND_UNAVAILABLE') {
        console.log(`MetadataService: Using mock tables data for malcode: ${malcode}`);
        return MOCK_TABLES[malcode] || [];
      }
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
      if (error instanceof Error && error.message === 'BACKEND_UNAVAILABLE') {
        console.log(`MetadataService: Using mock columns data for table: ${tableName}`);
        return MOCK_COLUMNS[tableName] || [];
      }
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
      if (error instanceof Error && error.message === 'BACKEND_UNAVAILABLE') {
        console.log(`MetadataService: Using mock search for term: ${searchTerm}`);
        const mockResults: SearchResult[] = [];
        
        // Search through mock data
        MOCK_MALCODES.forEach(malcode => {
          if (malcode.malcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
              malcode.business_description.toLowerCase().includes(searchTerm.toLowerCase())) {
            mockResults.push({
              id: malcode.id,
              type: 'malcode',
              malcode: malcode.malcode,
              business_description: malcode.business_description
            });
          }
        });
        
        // Search tables and columns
        Object.entries(MOCK_TABLES).forEach(([malcode, tables]) => {
          tables.forEach(table => {
            if (table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                table.business_description.toLowerCase().includes(searchTerm.toLowerCase())) {
              mockResults.push({
                id: table.id,
                type: 'table',
                malcode: malcode,
                table_name: table.table_name,
                business_description: table.business_description
              });
            }
            
            const columns = MOCK_COLUMNS[table.table_name] || [];
            columns.forEach(column => {
              if (column.column_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  column.business_description.toLowerCase().includes(searchTerm.toLowerCase())) {
                mockResults.push({
                  id: column.id,
                  type: 'column',
                  malcode: malcode,
                  table_name: table.table_name,
                  column_name: column.column_name,
                  business_description: column.business_description,
                  data_type: column.data_type
                });
              }
            });
          });
        });
        
        return mockResults;
      }
      console.error('MetadataService: Error searching metadata:', error);
      throw error;
    }
  }
}

export const metadataService = new MetadataService();
