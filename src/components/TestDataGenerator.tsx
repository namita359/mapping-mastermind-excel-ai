import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MappingFile, MappingRow } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { generateSQLAndTestData } from "@/lib/apiService";
import { Play, Copy, Download, RefreshCw, AlertTriangle } from "lucide-react";

interface TestDataGeneratorProps {
  mappingFile: MappingFile;
  selectedMappings?: MappingRow[];
}

interface TestRecord {
  [key: string]: any;
}

const TestDataGenerator = ({ mappingFile, selectedMappings }: TestDataGeneratorProps) => {
  const [generatedData, setGeneratedData] = useState<{
    sourceData: TestRecord[];
    targetData: TestRecord[];
    query: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  const mappingsToUse = selectedMappings || mappingFile.rows.filter(row => row.status === 'approved');

  const generateSampleData = async () => {
    setIsGenerating(true);
    setApiError(null);
    
    try {
      console.log("Calling FastAPI to generate SQL and test data...");
      const response = await generateSQLAndTestData(mappingsToUse);
      
      setGeneratedData({
        sourceData: response.source_data,
        targetData: response.target_data,
        query: response.sql_query
      });
      
      toast({
        title: "Test data generated",
        description: `Generated ${response.source_data.length} test records with validation query from FastAPI`,
      });
    } catch (error) {
      console.error("FastAPI error:", error);
      setApiError(error instanceof Error ? error.message : "Failed to connect to FastAPI backend");
      
      // Fallback to local generation
      console.log("Falling back to local generation...");
      await generateLocalFallback();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalFallback = async () => {
    // Simulate API call delay
    setTimeout(() => {
      const sourceData: TestRecord[] = [];
      const targetData: TestRecord[] = [];
      
      // Generate 5 sample records
      for (let i = 1; i <= 5; i++) {
        const sourceRecord: TestRecord = {};
        const targetRecord: TestRecord = {};
        
        // Group mappings by source table to avoid duplicates
        const sourceTableGroups = mappingsToUse.reduce((groups, mapping) => {
          const key = `${mapping.sourceColumn.malcode}.${mapping.sourceColumn.table}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(mapping);
          return groups;
        }, {} as Record<string, MappingRow[]>);
        
        // Generate source data
        Object.values(sourceTableGroups).forEach(mappings => {
          mappings.forEach(mapping => {
            const sourceKey = `${mapping.sourceColumn.malcode}_${mapping.sourceColumn.table}_${mapping.sourceColumn.column}`;
            sourceRecord[sourceKey] = generateSampleValue(mapping.sourceColumn.dataType, i);
          });
        });
        
        // Generate target data based on transformations
        mappingsToUse.forEach(mapping => {
          const sourceKey = `${mapping.sourceColumn.malcode}_${mapping.sourceColumn.table}_${mapping.sourceColumn.column}`;
          const targetKey = `${mapping.targetColumn.malcode}_${mapping.targetColumn.table}_${mapping.targetColumn.column}`;
          
          if (mapping.transformation) {
            // Apply transformation logic
            targetRecord[targetKey] = applyTransformation(
              sourceRecord[sourceKey], 
              mapping.transformation
            );
          } else {
            // Direct copy
            targetRecord[targetKey] = sourceRecord[sourceKey];
          }
        });
        
        sourceData.push(sourceRecord);
        targetData.push(targetRecord);
      }
      
      // Generate SQL query
      const query = generateSQLQuery(mappingsToUse);
      
      setGeneratedData({ sourceData, targetData, query });
      
      toast({
        title: "Test data generated (local fallback)",
        description: `Generated ${sourceData.length} test records using local generation`,
        variant: "destructive"
      });
    }, 500);
  };

  const generateSampleValue = (dataType: string, index: number): any => {
    switch (dataType.toLowerCase()) {
      case 'int':
      case 'integer':
      case 'bigint':
        return 1000 + index;
      case 'varchar':
      case 'string':
      case 'text':
        return `Sample_${index}`;
      case 'decimal':
      case 'float':
      case 'double':
        return (100.50 + index).toFixed(2);
      case 'date':
        return new Date(2024, 0, index).toISOString().split('T')[0];
      case 'datetime':
      case 'timestamp':
        return new Date(2024, 0, index, 10, 0, 0).toISOString();
      case 'boolean':
      case 'bit':
        return index % 2 === 0;
      default:
        return `Value_${index}`;
    }
  };

  const applyTransformation = (value: any, transformation: string): any => {
    // Simple transformation logic for demo purposes
    if (transformation.toLowerCase().includes('lower')) {
      return String(value).toLowerCase();
    }
    if (transformation.toLowerCase().includes('upper')) {
      return String(value).toUpperCase();
    }
    if (transformation.toLowerCase().includes('concat')) {
      return `${value}_transformed`;
    }
    // Default: return original value
    return value;
  };

  const generateSQLQuery = (mappings: MappingRow[]): string => {
    const sourceTablesSet = new Set(mappings.map(m => `${m.sourceColumn.malcode}.${m.sourceColumn.table}`));
    const sourceTables = Array.from(sourceTablesSet);
    
    const selectClauses = mappings.map(mapping => {
      const sourceCol = `${mapping.sourceColumn.malcode}_${mapping.sourceColumn.table}.${mapping.sourceColumn.column}`;
      const targetCol = `${mapping.targetColumn.malcode}_${mapping.targetColumn.table}_${mapping.targetColumn.column}`;
      
      if (mapping.transformation) {
        return `  ${mapping.transformation.replace(/\b\w+\b/g, sourceCol)} AS ${targetCol}`;
      } else {
        return `  ${sourceCol} AS ${targetCol}`;
      }
    });
    
    let query = `SELECT\n${selectClauses.join(',\n')}\nFROM`;
    
    if (sourceTables.length === 1) {
      query += ` ${sourceTables[0]}`;
    } else {
      query += ` ${sourceTables[0]}`;
      sourceTables.slice(1).forEach((table, index) => {
        const joinCondition = mappings.find(m => 
          m.join && (m.sourceColumn.malcode + '.' + m.sourceColumn.table === table)
        )?.join || `${sourceTables[0]}.id = ${table}.id`;
        
        query += `\nJOIN ${table} ON ${joinCondition}`;
      });
    }
    
    return query + ';';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const downloadAsCSV = (data: TestRecord[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Test Data Generator (FastAPI Integration)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generate sample data and validation queries using FastAPI backend (localhost:3000)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {mappingsToUse.length} approved mappings
            </Badge>
            <Button 
              onClick={generateSampleData} 
              disabled={isGenerating || mappingsToUse.length === 0}
              size="sm"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate via FastAPI'}
            </Button>
          </div>
        </div>
        
        {apiError && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              FastAPI Error: {apiError}. Using local fallback generation.
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {mappingsToUse.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No approved mappings available for test data generation.</p>
            <p className="text-sm">Approve some mappings first to generate test data.</p>
          </div>
        ) : generatedData ? (
          <Tabs defaultValue="query" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="query">Generated Query</TabsTrigger>
              <TabsTrigger value="source">Source Data</TabsTrigger>
              <TabsTrigger value="target">Target Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="query" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">SQL Validation Query</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(generatedData.query)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SQL
                </Button>
              </div>
              <div className="relative">
                <Textarea 
                  value={generatedData.query}
                  readOnly
                  className="font-mono text-sm min-h-[200px]"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Use this query to validate your mappings against the test data.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="source" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Source Test Data</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadAsCSV(generatedData.sourceData, 'source_test_data.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              <div className="border rounded-lg">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(generatedData.sourceData[0] || {}).map(key => (
                          <TableHead key={key} className="min-w-[120px]">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedData.sourceData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex} className="font-mono text-sm">
                              {String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="target" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Expected Target Data</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadAsCSV(generatedData.targetData, 'target_test_data.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              <div className="border rounded-lg">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(generatedData.targetData[0] || {}).map(key => (
                          <TableHead key={key} className="min-w-[120px]">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedData.targetData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <TableCell key={cellIndex} className="font-mono text-sm">
                              {String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Generate via FastAPI" to create sample data and validation queries using the backend service.</p>
            <p className="text-xs mt-2">Make sure your FastAPI server is running on localhost:3000</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestDataGenerator;
