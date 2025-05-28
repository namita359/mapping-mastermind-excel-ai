
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SQLQueryDisplayProps {
  sqlQuery: string;
}

const SQLQueryDisplay = ({ sqlQuery }: SQLQueryDisplayProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Generated SQL Query
        </CardTitle>
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
  );
};

export default SQLQueryDisplay;
