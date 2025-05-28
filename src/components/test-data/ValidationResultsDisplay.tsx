
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  message: string;
  executedResults?: any[];
  errors?: string[];
  suggestions?: string[];
}

interface ValidationResultsDisplayProps {
  validationResult?: ValidationResult;
}

const ValidationResultsDisplay = ({ validationResult }: ValidationResultsDisplayProps) => {
  if (!validationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            No Validation Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Run the complete AI analysis to see validation results here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validationResult.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          OpenAI Validation Results
          <Badge variant={validationResult.isValid ? "default" : "destructive"}>
            {validationResult.isValid ? "Valid" : "Invalid"}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive SQL validation performed by OpenAI
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Overall Assessment</h4>
          <p className="text-sm text-muted-foreground">{validationResult.message}</p>
        </div>

        {validationResult.errors && validationResult.errors.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              Errors Found
            </h4>
            <ul className="space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded border-l-2 border-red-200">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.suggestions && validationResult.suggestions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-4 w-4" />
              AI Suggestions
            </h4>
            <ul className="space-y-1">
              {validationResult.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.executedResults && validationResult.executedResults.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Simulated Query Results
            </h4>
            <div className="border rounded-lg">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(validationResult.executedResults[0]).map(key => (
                        <TableHead key={key} className="min-w-[120px]">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.executedResults.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex} className="font-mono text-sm">
                            {value === null ? (
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationResultsDisplay;
