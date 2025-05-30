
interface MappingInfo {
  name: string;
  rows: Array<{
    sourceColumn: {
      malcode: string;
      table: string;
      column: string;
    };
    targetColumn: {
      malcode: string;
      table: string;
      column: string;
    };
    dataType: string;
    transformationLogic?: string;
  }>;
}

interface BackendApiResponse {
  sqlQuery: string;
  testData: any[];
  validationResults: {
    isValid: boolean;
    message: string;
    executedResults?: any[];
    errors?: string[];
    suggestions?: string[];
  };
}

export class BackendApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async processComplete(mappingInfo: MappingInfo): Promise<BackendApiResponse> {
    console.log('Calling backend API for complete OpenAI analysis');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/openai/process-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mappingInfo
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling backend API:', error);
      throw error;
    }
  }

  async generateSQL(mappingInfo: MappingInfo): Promise<string> {
    console.log('Calling backend API for SQL generation');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/openai/generate-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mappingInfo
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.sqlQuery;
    } catch (error) {
      console.error('Error calling backend API for SQL generation:', error);
      throw error;
    }
  }

  async generateTestData(mappingInfo: MappingInfo, sqlQuery: string): Promise<any[]> {
    console.log('Calling backend API for test data generation');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/openai/generate-test-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mappingInfo,
          sqlQuery
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.testData;
    } catch (error) {
      console.error('Error calling backend API for test data generation:', error);
      throw error;
    }
  }

  async validateSQL(sqlQuery: string, testData: any[]): Promise<{
    isValid: boolean;
    message: string;
    executedResults?: any[];
    errors?: string[];
    suggestions?: string[];
  }> {
    console.log('Calling backend API for SQL validation');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/openai/validate-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sqlQuery,
          testData
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.validationResults;
    } catch (error) {
      console.error('Error calling backend API for SQL validation:', error);
      throw error;
    }
  }
}

// Configuration for your backend API
export const getBackendApiUrl = (): string => {
  // You can set this in localStorage or environment variable
  return localStorage.getItem('backend_api_url') || 'http://localhost:3000';
};

export const setBackendApiUrl = (url: string): void => {
  localStorage.setItem('backend_api_url', url);
};

export const createBackendApiService = (): BackendApiService => {
  const apiUrl = getBackendApiUrl();
  return new BackendApiService(apiUrl);
};
