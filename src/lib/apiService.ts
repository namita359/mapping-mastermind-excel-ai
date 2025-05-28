
interface FastAPIGenerateRequest {
  mappings: Array<{
    sourceColumn: {
      malcode: string;
      table: string;
      column: string;
      dataType: string;
    };
    targetColumn: {
      malcode: string;
      table: string;
      column: string;
      dataType: string;
    };
    transformation?: string;
    join?: string;
  }>;
}

interface FastAPIGenerateResponse {
  sql_query: string;
  source_data: Array<Record<string, any>>;
  target_data: Array<Record<string, any>>;
}

export const generateSQLAndTestData = async (mappings: any[]): Promise<FastAPIGenerateResponse> => {
  const requestData: FastAPIGenerateRequest = {
    mappings: mappings.map(mapping => ({
      sourceColumn: {
        malcode: mapping.sourceColumn.malcode,
        table: mapping.sourceColumn.table,
        column: mapping.sourceColumn.column,
        dataType: mapping.sourceColumn.dataType,
      },
      targetColumn: {
        malcode: mapping.targetColumn.malcode,
        table: mapping.targetColumn.table,
        column: mapping.targetColumn.column,
        dataType: mapping.targetColumn.dataType,
      },
      transformation: mapping.transformation,
      join: mapping.join,
    }))
  };

  try {
    const response = await fetch('http://localhost:3000/generate-sql-and-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling FastAPI:', error);
    throw error;
  }
};
