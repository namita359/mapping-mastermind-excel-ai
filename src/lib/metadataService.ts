
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
  'customer_preferences': [
    {
      id: 'mock-col-30',
      column_name: 'preference_id',
      data_type: 'string',
      business_description: 'Unique preference identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-31',
      column_name: 'customer_id',
      data_type: 'string',
      business_description: 'Reference to customer',
      is_nullable: false
    },
    {
      id: 'mock-col-32',
      column_name: 'preference_type',
      data_type: 'string',
      business_description: 'Type of preference',
      is_nullable: false
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
  'product_inventory': [
    {
      id: 'mock-col-33',
      column_name: 'inventory_id',
      data_type: 'string',
      business_description: 'Unique inventory identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-34',
      column_name: 'product_id',
      data_type: 'string',
      business_description: 'Reference to product',
      is_nullable: false
    },
    {
      id: 'mock-col-35',
      column_name: 'quantity_on_hand',
      data_type: 'integer',
      business_description: 'Current inventory quantity',
      is_nullable: false
    }
  ],
  'product_pricing': [
    {
      id: 'mock-col-36',
      column_name: 'pricing_id',
      data_type: 'string',
      business_description: 'Unique pricing identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-37',
      column_name: 'product_id',
      data_type: 'string',
      business_description: 'Reference to product',
      is_nullable: false
    },
    {
      id: 'mock-col-38',
      column_name: 'price_tier',
      data_type: 'string',
      business_description: 'Pricing tier classification',
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
  ],
  'order_details': [
    {
      id: 'mock-col-39',
      column_name: 'detail_id',
      data_type: 'string',
      business_description: 'Unique detail identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-40',
      column_name: 'order_id',
      data_type: 'string',
      business_description: 'Reference to order',
      is_nullable: false
    },
    {
      id: 'mock-col-41',
      column_name: 'product_id',
      data_type: 'string',
      business_description: 'Reference to product',
      is_nullable: false
    }
  ],
  'order_payments': [
    {
      id: 'mock-col-42',
      column_name: 'payment_id',
      data_type: 'string',
      business_description: 'Unique payment identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-43',
      column_name: 'order_id',
      data_type: 'string',
      business_description: 'Reference to order',
      is_nullable: false
    },
    {
      id: 'mock-col-44',
      column_name: 'payment_method',
      data_type: 'string',
      business_description: 'Method of payment',
      is_nullable: false
    }
  ],
  'account_ledger': [
    {
      id: 'mock-col-45',
      column_name: 'ledger_id',
      data_type: 'string',
      business_description: 'Unique ledger entry identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-46',
      column_name: 'account_number',
      data_type: 'string',
      business_description: 'Account number',
      is_nullable: false
    },
    {
      id: 'mock-col-47',
      column_name: 'transaction_amount',
      data_type: 'decimal',
      business_description: 'Transaction amount',
      is_nullable: false
    }
  ],
  'invoice_data': [
    {
      id: 'mock-col-48',
      column_name: 'invoice_id',
      data_type: 'string',
      business_description: 'Unique invoice identifier',
      is_primary_key: true,
      is_nullable: false
    },
    {
      id: 'mock-col-49',
      column_name: 'invoice_number',
      data_type: 'string',
      business_description: 'Invoice number',
      is_nullable: false
    },
    {
      id: 'mock-col-50',
      column_name: 'invoice_amount',
      data_type: 'decimal',
      business_description: 'Total invoice amount',
      is_nullable: false
    }
  ]
};

// Check if backend is available (simple flag to control behavior)
let backendAvailable = false;

class MetadataService {
  private async checkBackendAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    console.log(`MetadataService: Making request to ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
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
      throw new Error('BACKEND_UNAVAILABLE');
    }
  }

  async getAllMalcodes(): Promise<MalcodeMetadata[]> {
    console.log('MetadataService: Getting all malcodes...');
    
    // Check backend availability first
    backendAvailable = await this.checkBackendAvailability();
    
    if (!backendAvailable) {
      console.log('MetadataService: Backend unavailable, using mock malcodes data');
      return MOCK_MALCODES;
    }

    try {
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/malcodes`);
      
      if (response && response.malcodes) {
        console.log(`MetadataService: Successfully retrieved ${response.malcodes.length} malcodes`);
        return response.malcodes;
      } else {
        console.warn('MetadataService: No malcodes in response');
        return [];
      }
    } catch (error) {
      console.log('MetadataService: Falling back to mock malcodes data');
      return MOCK_MALCODES;
    }
  }

  async getTablesByMalcode(malcode: string): Promise<TableMetadata[]> {
    console.log(`MetadataService: Getting tables for malcode: ${malcode}`);
    
    if (!backendAvailable) {
      console.log(`MetadataService: Using mock tables data for malcode: ${malcode}`);
      return MOCK_TABLES[malcode] || [];
    }

    try {
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
      console.log(`MetadataService: Using mock tables data for malcode: ${malcode}`);
      return MOCK_TABLES[malcode] || [];
    }
  }

  async getColumnsByTable(malcode: string, tableName: string): Promise<ColumnMetadata[]> {
    console.log(`MetadataService: Getting columns for malcode: ${malcode}, table: ${tableName}`);
    
    if (!backendAvailable) {
      console.log(`MetadataService: Using mock columns data for table: ${tableName}`);
      return MOCK_COLUMNS[tableName] || [];
    }

    try {
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
      console.log(`MetadataService: Using mock columns data for table: ${tableName}`);
      return MOCK_COLUMNS[tableName] || [];
    }
  }

  async searchMetadata(searchTerm: string): Promise<SearchResult[]> {
    console.log(`MetadataService: Searching metadata for term: ${searchTerm}`);
    
    if (!backendAvailable) {
      console.log(`MetadataService: Using mock search for term: ${searchTerm}`);
      return this.performMockSearch(searchTerm);
    }

    try {
      const response = await this.fetchWithErrorHandling(`${API_BASE_URL}/metadata/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (response && response.results) {
        console.log(`MetadataService: Found ${response.results.length} search results`);
        return response.results;
      } else {
        console.warn('MetadataService: No search results found');
        return [];
      }
    } catch (error) {
      console.log(`MetadataService: Using mock search for term: ${searchTerm}`);
      return this.performMockSearch(searchTerm);
    }
  }

  private performMockSearch(searchTerm: string): SearchResult[] {
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
}

export const metadataService = new MetadataService();
