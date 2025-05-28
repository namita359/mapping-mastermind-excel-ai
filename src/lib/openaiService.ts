
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

interface OpenAIResponse {
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

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSQL(mappingInfo: MappingInfo): Promise<string> {
    console.log('Generating SQL with OpenAI for mapping:', mappingInfo.name);
    
    const prompt = `
Given the following data mapping information, generate a SQL query that demonstrates the relationships between source and target columns:

Mapping File: ${mappingInfo.name}

Mappings:
${mappingInfo.rows.map(row => 
  `- Source: ${row.sourceColumn.malcode}.${row.sourceColumn.table}.${row.sourceColumn.column} (${row.dataType})
  - Target: ${row.targetColumn.malcode}.${row.targetColumn.table}.${row.targetColumn.column}
  - Transformation: ${row.transformationLogic || 'Direct mapping'}`
).join('\n')}

Please generate a comprehensive SQL query that:
1. Selects data from the source tables
2. Maps the columns according to the specifications
3. Includes appropriate JOINs if multiple tables are involved
4. Uses proper SQL syntax and formatting

Return only the SQL query without additional explanation.
    `;

    const response = await this.callOpenAI(prompt);
    return response.choices[0]?.message?.content || '';
  }

  async generateTestData(mappingInfo: MappingInfo, sqlQuery: string): Promise<any[]> {
    console.log('Generating test data with OpenAI for SQL validation');
    
    const prompt = `
Given the following SQL query and mapping information, generate comprehensive test data that covers various scenarios for validation:

SQL Query:
${sqlQuery}

Mapping Information:
${mappingInfo.rows.map(row => 
  `- ${row.sourceColumn.table}.${row.sourceColumn.column} -> ${row.targetColumn.table}.${row.targetColumn.column} (${row.dataType})`
).join('\n')}

Generate test data scenarios that include:
1. Happy path scenarios with normal data
2. Edge cases (null values, empty strings, boundary values)
3. Data type validation scenarios
4. Performance testing scenarios with varying data sizes
5. Special characters and internationalization cases

Return the test data as a JSON array where each object represents a test scenario with:
- test_scenario: string (description of the test case)
- All relevant columns from the mapping with appropriate test values
- expected_result: string (what should happen with this data)

Generate at least 8-10 different test scenarios. Return only valid JSON without any markdown formatting or additional text.
    `;

    const response = await this.callOpenAI(prompt);
    const content = response.choices[0]?.message?.content || '[]';
    
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse test data JSON:', error);
      return this.generateFallbackTestData(mappingInfo);
    }
  }

  async validateSQLWithTestData(sqlQuery: string, testData: any[]): Promise<{
    isValid: boolean;
    message: string;
    executedResults?: any[];
    errors?: string[];
    suggestions?: string[];
  }> {
    console.log('Validating SQL with OpenAI using test data');
    
    const prompt = `
Analyze the following SQL query and test data to provide validation results:

SQL Query:
${sqlQuery}

Test Data Sample:
${JSON.stringify(testData.slice(0, 3), null, 2)}

Please analyze and provide:
1. Whether the SQL query is syntactically correct
2. Whether the query would work with the provided test data structure
3. Potential performance issues or optimizations
4. Data type compatibility issues
5. Any logical errors in the query structure
6. Suggestions for improvement

Simulate executing the query with the test data and provide mock results.

Respond with a JSON object in this exact format:
{
  "isValid": boolean,
  "message": "string describing overall validation result",
  "executedResults": [array of mock query results],
  "errors": [array of error messages if any],
  "suggestions": [array of improvement suggestions]
}

Return only valid JSON without any markdown formatting or additional text.
    `;

    const response = await this.callOpenAI(prompt);
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse validation JSON:', error);
      return {
        isValid: false,
        message: 'Failed to validate SQL query',
        errors: ['OpenAI response parsing error']
      };
    }
  }

  async processComplete(mappingInfo: MappingInfo): Promise<OpenAIResponse> {
    console.log('Running complete OpenAI analysis pipeline');
    
    // Step 1: Generate SQL
    const sqlQuery = await this.generateSQL(mappingInfo);
    
    // Step 2: Generate test data for the SQL
    const testData = await this.generateTestData(mappingInfo, sqlQuery);
    
    // Step 3: Validate SQL with the test data
    const validationResults = await this.validateSQLWithTestData(sqlQuery, testData);
    
    return {
      sqlQuery,
      testData,
      validationResults
    };
  }

  private async callOpenAI(prompt: string) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private generateFallbackTestData(mappingInfo: MappingInfo): any[] {
    return [
      {
        test_scenario: "Happy Path - Normal Data",
        customer_id: 12345,
        customer_name: "John Doe",
        order_amount: 150.75,
        expected_result: "Should return valid customer order"
      },
      {
        test_scenario: "Edge Case - NULL Values",
        customer_id: 11111,
        customer_name: "Bob Wilson",
        order_amount: null,
        expected_result: "Should handle NULL values gracefully"
      }
    ];
  }
}

// Get OpenAI API key from localStorage or prompt user
export const getOpenAIKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

export const setOpenAIKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key);
};

export const createOpenAIService = (): OpenAIService | null => {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    return null;
  }
  return new OpenAIService(apiKey);
};
