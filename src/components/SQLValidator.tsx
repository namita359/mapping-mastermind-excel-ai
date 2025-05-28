
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Play, AlertTriangle, Loader2 } from "lucide-react";

interface TestRecord {
  [key: string]: any;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  executedResults?: TestRecord[];
  errors?: string[];
  suggestions?: string[];
}

interface SQLValidatorProps {
  sqlQuery: string;
  sourceData: TestRecord[];
}

const SQLValidator = ({ sqlQuery, sourceData }: SQLValidatorProps) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateSQL = async () => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      // Simulate OpenAI API call for SQL validation
      console.log("Validating SQL with OpenAI...");
      
      // Mock OpenAI response for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate validation logic
      const mockValidation = simulateValidation(sqlQuery, sourceData);
      setValidationResult(mockValidation);
      
      toast({
        title: mockValidation.isValid ? "Validation successful" : "Validation completed with issues",
        description: mockValidation.message,
        variant: mockValidation.isValid ? "default" : "destructive"
      });
      
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        isValid: false,
        message: "Failed to validate SQL query",
        errors: ["Connection to OpenAI failed. Please try again."]
      });
      
      toast({
        title: "Validation failed",
        description: "Could not connect to OpenAI for validation",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const simulateValidation = (sql: string, data: TestRecord[]): ValidationResult => {
    // Simple validation simulation
    if (!sql.trim()) {
      return {
        isValid: false,
        message: "SQL query is empty",
        errors: ["Please provide a valid SQL query"]
      };
    }

    if (data.length === 0) {
      return {
        isValid: false,
        message: "No source data available for validation",
        errors: ["Source data is required for validation"]
      };
    }

    // Simulate successful validation with mock results
    const mockResults: TestRecord[] = data.slice(0, 3).map((record, index) => ({
      row_number: index + 1,
      validation_status: "PASS",
      ...Object.keys(record).reduce((acc, key) => {
        acc[`validated_${key}`] = record[key];
        return acc;
      }, {} as TestRecord)
    }));

    return {
      isValid: true,
      message: "SQL query validation completed successfully",
      executedResults: mockResults,
      suggestions: [
        "Consider adding indexes for better performance",
        "Query structure looks good for the given data schema"
      ]
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            SQL Validation (OpenAI)
          </CardTitle>
          <Button 
            onClick={validateSQL} 
            disabled={isValidating || !sqlQuery.trim() || sourceData.length === 0}
            size="sm"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isValidating ? 'Validating...' : 'Validate with OpenAI'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Use OpenAI to validate your SQL query against the generated source data
        </p>
      </CardHeader>
      
      <CardContent>
        {!sqlQuery.trim() && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Please generate SQL query first to enable validation
            </p>
          </div>
        )}

        {sourceData.length === 0 && sqlQuery.trim() && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Please generate source data first to enable validation
            </p>
          </div>
        )}

        {validationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                {validationResult.isValid ? "Valid" : "Invalid"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationResult.message}
              </span>
            </div>

            {validationResult.errors && validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-800">Errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-800">Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.executedResults && validationResult.executedResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Validation Results:</h4>
                <div className="border rounded-lg">
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(validationResult.executedResults[0]).map(key => (
                            <TableHead key={key} className="min-w-[120px]">
                              {key}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResult.executedResults.map((row, index) => (
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
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SQLValidator;
