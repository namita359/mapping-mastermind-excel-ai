
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, Play, Loader2, GitBranch, Sparkles } from "lucide-react";
import { MappingFile } from "@/lib/types";
import SQLDataEditor from "./SQLDataEditor";
import SQLValidator from "./SQLValidator";
import ColumnLineageView from "./ColumnLineageView";

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
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Data Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-500 mb-2">No mapping data available</p>
            <p className="text-sm text-gray-400">Upload or create mappings first to generate test data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                SQL Query & Test Data Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate SQL query and use OpenAI to create intelligent test data for validation
              </p>
            </div>
            <div className="flex gap-2">
              {generatedData.length > 0 && (
                <Button variant="outline" onClick={downloadTestData} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
              )}
              <Button 
                onClick={generateTestData} 
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate SQL'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{mappingFile.rows.length}</div>
              <div className="text-sm text-muted-foreground">Total Mappings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{generatedData.length}</div>
              <div className="text-sm text-muted-foreground">Test Scenarios</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(mappingFile.rows.map(r => r.sourceColumn.table)).size}
              </div>
              <div className="text-sm text-muted-foreground">Source Tables</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SQL Query Display & Test Data Generation */}
      {hasGenerated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Generated SQL Query
              </CardTitle>
              <Button 
                onClick={generateIntelligentTestData} 
                disabled={isGeneratingTestData || !sqlQuery.trim()}
                size="sm"
              >
                {isGeneratingTestData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGeneratingTestData ? 'Generating with AI...' : 'Generate Test Data with OpenAI'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              SQL query based on your mappings. Generate intelligent test data to validate this query.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results and Tools */}
      {generatedData.length > 0 && (
        <Tabs defaultValue="data" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="data">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generated Data
            </TabsTrigger>
            <TabsTrigger value="sql">SQL Editor</TabsTrigger>
            <TabsTrigger value="validation">AI Validation</TabsTrigger>
            <TabsTrigger value="lineage">
              <GitBranch className="h-4 w-4 mr-2" />
              Column Lineage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  OpenAI Generated Test Scenarios
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Intelligent test data scenarios generated by OpenAI to validate your SQL query
                </p>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {generatedData.length > 0 && Object.keys(generatedData[0]).map(key => (
                            <TableHead key={key} className="min-w-[120px]">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedData.map((row, index) => (
                          <TableRow key={index}>
                            {Object.entries(row).map(([key, value], cellIndex) => (
                              <TableCell key={cellIndex} className="font-mono text-sm">
                                {key === 'test_scenario' ? (
                                  <Badge variant="outline" className="text-xs">
                                    {String(value)}
                                  </Badge>
                                ) : value === null ? (
                                  <span className="text-gray-400 italic">NULL</span>
                                ) : (
                                  String(value)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sql">
            <SQLDataEditor
              originalSQL={sqlQuery}
              originalData={generatedData}
              onSQLChange={setSqlQuery}
              onDataChange={setGeneratedData}
            />
          </TabsContent>

          <TabsContent value="validation">
            <SQLValidator
              sqlQuery={sqlQuery}
              sourceData={generatedData}
            />
          </TabsContent>

          <TabsContent value="lineage">
            <ColumnLineageView mappingFile={mappingFile} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TestDataGenerator;
