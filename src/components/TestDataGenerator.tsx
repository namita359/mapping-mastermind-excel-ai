
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Database, Play, Loader2, GitBranch } from "lucide-react";
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
  const { toast } = useToast();

  const generateTestData = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to generate test data
      console.log("Generating test data for mapping file:", mappingFile.name);
      
      // Mock data generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: TestRecord[] = mappingFile.rows.slice(0, 5).map((row, index) => ({
        row_id: index + 1,
        source_malcode: row.sourceColumn.malcode,
        source_table: row.sourceColumn.table,
        source_column: row.sourceColumn.column,
        source_value: `sample_value_${index + 1}`,
        target_malcode: row.targetColumn.malcode,
        target_table: row.targetColumn.table,
        target_column: row.targetColumn.column,
        transformation: row.transformation || "Direct Copy",
        data_type: row.sourceColumn.dataType,
        validation_status: "PENDING"
      }));
      
      const mockSQL = `-- Generated SQL for ${mappingFile.name}
SELECT 
  ${mappingFile.rows.map(row => 
    `  ${row.sourceColumn.table}.${row.sourceColumn.column} AS ${row.targetColumn.column}`
  ).join(',\n')}
FROM ${mappingFile.rows[0]?.sourceColumn.table || 'source_table'}
WHERE 1=1;`;
      
      setGeneratedData(mockData);
      setSqlQuery(mockSQL);
      setHasGenerated(true);
      
      toast({
        title: "Test data generated",
        description: `Generated ${mockData.length} test records and SQL query`,
      });
      
    } catch (error) {
      console.error("Error generating test data:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate test data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTestData = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_data_${mappingFile.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Test data file download initiated",
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
                Test Data Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate synthetic test data based on your mapping configuration
              </p>
            </div>
            <div className="flex gap-2">
              {hasGenerated && (
                <Button variant="outline" onClick={downloadTestData} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
              )}
              <Button 
                onClick={generateTestData} 
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Test Data'}
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
              <div className="text-sm text-muted-foreground">Generated Records</div>
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

      {/* Results and Tools */}
      {hasGenerated && (
        <Tabs defaultValue="data" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="data">Generated Data</TabsTrigger>
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
                <CardTitle>Generated Test Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Preview of generated test records based on your mappings
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
                                {key === 'validation_status' ? (
                                  <Badge variant={value === 'PENDING' ? 'secondary' : 'default'}>
                                    {String(value)}
                                  </Badge>
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
