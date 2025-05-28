
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const EmptyState = () => {
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
};

export default EmptyState;
