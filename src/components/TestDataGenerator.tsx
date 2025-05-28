
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MappingFile } from "@/lib/types";
import GenerationControls from "./test-data/GenerationControls";
import TestDataStats from "./test-data/TestDataStats";
import SQLQueryDisplay from "./test-data/SQLQueryDisplay";
import TestDataTabs from "./test-data/TestDataTabs";
import EmptyState from "./test-data/EmptyState";

interface TestRecord {
  [key: string]: any;
}

interface TestDataGeneratorProps {
  mappingFile: MappingFile;
}

const TestDataGenerator = ({ mappingFile }: TestDataGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<TestRecord[]>([]);
  const [sqlQuery, setSqlQuery] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGeneratingTestData, setIsGeneratingTestData] = useState(false);
  const { toast } = useToast();

  const generateTestData = async () => {
    setIsGenerating(true);
    
    try {
      console.log("Generating SQL query for mapping file:", mappingFile.name);
      
      // Simulate API call to generate SQL query
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSQL = `-- Generated SQL for ${mappingFile.name}
SELECT 
${mappingFile.rows.map(row => 
  `  ${row.sourceColumn.table}.${row.sourceColumn.column} AS ${row.targetColumn.column}`
).join(',\n')}
FROM ${mappingFile.rows[0]?.sourceColumn.table || 'source_table'}
WHERE 1=1;`;
      
      setSqlQuery(mockSQL);
      setHasGenerated(true);
      
      toast({
        title: "SQL query generated",
        description: "SQL query has been generated. Now generate test data to validate it.",
      });
      
    } catch (error) {
      console.error("Error generating SQL:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate SQL query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIntelligentTestData = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "No SQL query",
        description: "Please generate SQL query first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingTestData(true);
    
    try {
      console.log("Using OpenAI to generate intelligent test data for SQL query:", sqlQuery);
      
      // Simulate OpenAI API call for intelligent test data generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock intelligent test data based on SQL analysis
      const intelligentTestData: TestRecord[] = [
        {
          test_scenario: "Happy Path - Normal Data",
          customer_id: 12345,
          customer_name: "John Doe",
          order_amount: 150.75,
          order_date: "2024-01-15",
          product_category: "Electronics",
          expected_result: "Should return valid customer order"
        },
        {
          test_scenario: "Edge Case - Large Amount",
          customer_id: 67890,
          customer_name: "Jane Smith",
          order_amount: 9999.99,
          order_date: "2024-02-20",
          product_category: "Luxury",
          expected_result: "Should handle large monetary values"
        },
        {
          test_scenario: "Edge Case - NULL Values",
          customer_id: 11111,
          customer_name: "Bob Wilson",
          order_amount: null,
          order_date: "2024-03-10",
          product_category: null,
          expected_result: "Should handle NULL values gracefully"
        },
        {
          test_scenario: "Boundary Test - Zero Amount",
          customer_id: 22222,
          customer_name: "Alice Brown",
          order_amount: 0.00,
          order_date: "2024-04-05",
          product_category: "Free Sample",
          expected_result: "Should process zero-value orders"
        },
        {
          test_scenario: "Data Type Test - Special Characters",
          customer_id: 33333,
          customer_name: "José María O'Connor",
          order_amount: 75.50,
          order_date: "2024-05-12",
          product_category: "Books & Media",
          expected_result: "Should handle special characters in names"
        }
      ];
      
      setGeneratedData(intelligentTestData);
      
      toast({
        title: "Intelligent test data generated",
        description: `OpenAI generated ${intelligentTestData.length} test scenarios to validate your SQL query`,
      });
      
    } catch (error) {
      console.error("Error generating intelligent test data:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate test data with OpenAI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTestData(false);
    }
  };

  const downloadTestData = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intelligent_test_data_${mappingFile.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Intelligent test data file download initiated",
    });
  };

  if (mappingFile.rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <GenerationControls
        mappingFileName={mappingFile.name}
        isGenerating={isGenerating}
        isGeneratingTestData={isGeneratingTestData}
        hasGenerated={hasGenerated}
        hasGeneratedData={generatedData.length > 0}
        onGenerateSQL={generateTestData}
        onGenerateTestData={generateIntelligentTestData}
        onDownloadData={downloadTestData}
      />

      <TestDataStats 
        mappingFile={mappingFile} 
        generatedDataCount={generatedData.length} 
      />

      {hasGenerated && <SQLQueryDisplay sqlQuery={sqlQuery} />}

      {generatedData.length > 0 && (
        <TestDataTabs
          generatedData={generatedData}
          sqlQuery={sqlQuery}
          mappingFile={mappingFile}
          onSQLChange={setSqlQuery}
          onDataChange={setGeneratedData}
        />
      )}
    </div>
  );
};

export default TestDataGenerator;
