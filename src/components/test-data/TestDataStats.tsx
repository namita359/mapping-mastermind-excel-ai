
import { CardContent } from "@/components/ui/card";
import { MappingFile } from "@/lib/types";

interface TestDataStatsProps {
  mappingFile: MappingFile;
  generatedDataCount: number;
}

const TestDataStats = ({ mappingFile, generatedDataCount }: TestDataStatsProps) => {
  const uniqueSourceTables = new Set(mappingFile.rows.map(r => r.sourceColumn.table)).size;

  return (
    <CardContent>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{mappingFile.rows.length}</div>
          <div className="text-sm text-muted-foreground">Total Mappings</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{generatedDataCount}</div>
          <div className="text-sm text-muted-foreground">Test Scenarios</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{uniqueSourceTables}</div>
          <div className="text-sm text-muted-foreground">Source Tables</div>
        </div>
      </div>
    </CardContent>
  );
};

export default TestDataStats;
