
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

interface ValidationResults {
  isValid: boolean;
  message: string;
  executedResults?: any[];
  errors?: string[];
  suggestions?: string[];
}

async function callOpenAI(messages: any[], maxTokens: number = 2000): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateSQL(mappingInfo: MappingInfo): Promise<string> {
  const mappingDetails = mappingInfo.rows.map(row => 
    `Source: ${row.sourceColumn.malcode}.${row.sourceColumn.table}.${row.sourceColumn.column} -> ` +
    `Target: ${row.targetColumn.malcode}.${row.targetColumn.table}.${row.targetColumn.column}`
  ).join('\n');

  const messages = [
    {
      role: "system",
      content: "You are an expert SQL developer specializing in data transformation and ETL processes. Generate efficient SQL queries for data mapping scenarios."
    },
    {
      role: "user",
      content: `Generate a SQL query for the following data mapping:\n\nMapping Name: ${mappingInfo.name}\n\nMappings:\n${mappingDetails}\n\nRequirements:\n- Create a SELECT query that transforms source data to target format\n- Include all mapped columns\n- Add appropriate data type conversions\n- Include comments explaining the transformation logic\n- Make the query production-ready\n\nPlease provide only the SQL query without additional explanations.`
    }
  ];

  return await callOpenAI(messages, 1500);
}

async function generateTestData(mappingInfo: MappingInfo, sqlQuery: string): Promise<any[]> {
  const columnInfo = mappingInfo.rows.map(row => 
    `${row.targetColumn.table}.${row.targetColumn.column} (${row.dataType})`
  ).join('\n');

  const messages = [
    {
      role: "system",
      content: "You are a test data generator expert. Create realistic test data that covers various scenarios. Always return valid JSON array format."
    },
    {
      role: "user",
      content: `Generate test data for this mapping scenario:\n\nMapping: ${mappingInfo.name}\n\nTarget Columns:\n${columnInfo}\n\nSQL Query:\n${sqlQuery}\n\nGenerate 10-15 test records that include:\n- 5-7 normal valid records\n- 2-3 edge case records (nulls, empty values)\n- 2-3 boundary value records\n- 1-2 potential data quality issue records\n\nReturn as a JSON array of objects. Each object should have keys matching the target column names.\nExample format: [{"column1": "value1", "column2": "value2"}, ...]\n\nProvide only the JSON array without additional text.`
    }
  ];

  const response = await callOpenAI(messages, 2000);
  
  try {
    const testData = JSON.parse(response);
    if (!Array.isArray(testData)) {
      throw new Error("Response is not a JSON array");
    }
    return testData;
  } catch (error) {
    console.error("Failed to parse test data JSON:", error);
    // Return fallback test data
    return Array.from({length: 5}, (_, i) => ({
      id: i + 1,
      sample_column: `test_value_${i + 1}`,
      status: "valid"
    }));
  }
}

async function validateSQL(sqlQuery: string, testData: any[]): Promise<ValidationResults> {
  const testDataSample = JSON.stringify(testData.slice(0, 3), null, 2);

  const messages = [
    {
      role: "system",
      content: "You are a SQL validation expert. Analyze SQL queries for syntax correctness, performance optimization, and best practices compliance."
    },
    {
      role: "user",
      content: `Validate this SQL query:\n\nSQL Query:\n${sqlQuery}\n\nSample Test Data:\n${testDataSample}\n\nProvide validation results in this format:\n- Overall Assessment: (Valid/Invalid with reasoning)\n- Syntax Issues: (List any syntax problems)\n- Performance Suggestions: (List optimization recommendations)\n- Data Quality Concerns: (List potential data issues)\n- Best Practice Recommendations: (List improvements)\n\nBe specific and actionable in your feedback.`
    }
  ];

  const response = await callOpenAI(messages, 1500);
  
  const isValid = !response.toLowerCase().includes("invalid") && !response.toLowerCase().includes("error");
  
  return {
    isValid,
    message: response,
    executedResults: null,
    errors: isValid ? [] : ["Validation issues found - see message for details"],
    suggestions: isValid ? [] : [response]
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { mappingInfo } = await req.json();
    
    console.log('Starting complete OpenAI processing for mapping:', mappingInfo.name);
    
    // Step 1: Generate SQL query
    const sqlQuery = await generateSQL(mappingInfo);
    console.log('SQL query generated successfully');
    
    // Step 2: Generate test data
    const testData = await generateTestData(mappingInfo, sqlQuery);
    console.log(`Generated ${testData.length} test records`);
    
    // Step 3: Validate SQL query
    const validationResults = await validateSQL(sqlQuery, testData);
    console.log('SQL validation completed');
    
    return new Response(JSON.stringify({
      sqlQuery,
      testData,
      validationResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Complete OpenAI processing failed:', error);
    return new Response(JSON.stringify({ 
      error: `Complete OpenAI processing failed: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
