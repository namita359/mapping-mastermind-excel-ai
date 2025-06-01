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
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async processComplete(mappingInfo: MappingInfo): Promise<BackendApiResponse> {
    console.log('Calling backend API for complete OpenAI analysis at:', `${this.baseUrl}/api/openai/process-complete`);
    
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
        const errorText = await response.text();
        console.error('Backend API error response:', errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Backend API successful response:', result);
      return result;
    } catch (error) {
      console.error('Error calling backend API:', error);
      throw error;
    }
  }

  async generateSQL(mappingInfo: MappingInfo): Promise<string> {
    console.log('Calling backend API for SQL generation at:', `${this.baseUrl}/api/openai/generate-sql`);
    
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
        const errorText = await response.text();
        console.error('Backend API error response:', errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.sqlQuery;
    } catch (error) {
      console.error('Error calling backend API for SQL generation:', error);
      throw error;
    }
  }

  async generateTestData(mappingInfo: MappingInfo, sqlQuery: string): Promise<any[]> {
    console.log('Calling backend API for test data generation at:', `${this.baseUrl}/api/openai/generate-test-data`);
    
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
        const errorText = await response.text();
        console.error('Backend API error response:', errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
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
    console.log('Calling backend API for SQL validation at:', `${this.baseUrl}/api/openai/validate-sql`);
    
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
        const errorText = await response.text();
        console.error('Backend API error response:', errorText);
        throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.validationResults;
    } catch (error) {
      console.error('Error calling backend API for SQL validation:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend API health check failed:', error);
      return false;
    }
  }
}

// Configuration management for backend API
export const getBackendApiUrl = (): string => {
  return localStorage.getItem('backend_api_url') || 'http://localhost:3001';
};

export const setBackendApiUrl = (url: string): void => {
  localStorage.setItem('backend_api_url', url);
  console.log('Backend API URL configured:', url);
};

export const createBackendApiService = (): BackendApiService => {
  const apiUrl = getBackendApiUrl();
  return new BackendApiService(apiUrl);
};

// Utility function to validate backend API configuration
export const validateBackendApiConfig = async (): Promise<{
  isValid: boolean;
  message: string;
}> => {
  const apiUrl = getBackendApiUrl();
  
  if (!apiUrl || apiUrl === 'http://localhost:3000') {
    return {
      isValid: false,
      message: 'Backend API URL not configured. Please set your backend API URL first.'
    };
  }

  try {
    const service = createBackendApiService();
    const isHealthy = await service.healthCheck();
    
    if (isHealthy) {
      return {
        isValid: true,
        message: 'Backend API is configured and responding'
      };
    } else {
      return {
        isValid: false,
        message: 'Backend API is configured but not responding. Please check if your backend service is running.'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Backend API validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
