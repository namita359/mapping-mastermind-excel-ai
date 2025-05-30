
import { MappingFile, MappingRow, MappingStatus } from './types';

export class AzureSqlBackendService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async saveMappingFile(mappingFile: MappingFile): Promise<void> {
    console.log('Saving mapping file to backend:', mappingFile.name);
    
    const response = await fetch(`${this.baseUrl}/api/mapping-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: mappingFile.name,
        description: mappingFile.description,
        sourceSystem: mappingFile.sourceSystem,
        targetSystem: mappingFile.targetSystem,
        status: mappingFile.status,
        createdBy: mappingFile.createdBy,
        rows: mappingFile.rows.map(row => ({
          sourceColumn: row.sourceColumn,
          targetColumn: row.targetColumn,
          transformation: row.transformation,
          join: row.join,
          status: row.status,
          createdBy: row.createdBy
        }))
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save mapping file: ${error}`);
    }
  }

  async loadMappingFiles(): Promise<MappingFile[]> {
    console.log('Loading mapping files from backend...');
    
    const response = await fetch(`${this.baseUrl}/api/mapping-files`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to load mapping files: ${error}`);
    }

    const data = await response.json();
    return data.files;
  }

  async updateMappingRowStatus(
    rowId: string,
    status: MappingStatus,
    reviewer?: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/mapping-rows/${rowId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reviewer })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update row status: ${error}`);
    }
  }

  async addMappingRowComment(rowId: string, comment: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/mapping-rows/${rowId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to add comment: ${error}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Configuration management
export const getAzureSqlBackendUrl = (): string => {
  return localStorage.getItem('azure_sql_backend_url') || 'http://localhost:3000';
};

export const setAzureSqlBackendUrl = (url: string): void => {
  localStorage.setItem('azure_sql_backend_url', url);
};

export const createAzureSqlBackendService = (): AzureSqlBackendService => {
  const backendUrl = getAzureSqlBackendUrl();
  return new AzureSqlBackendService(backendUrl);
};
