
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Sparkles, CheckCircle } from "lucide-react";
import { MappingFile } from "@/lib/types";
import SQLDataEditor from "../SQLDataEditor";
import SQLValidator from "../SQLValidator";
import ColumnLineageView from "../ColumnLineageView";
import GeneratedDataTable from "./GeneratedDataTable";
import ValidationResultsDisplay from "./ValidationResultsDisplay";

interface TestRecord {
  [key: string]: any;
}

interface TestDataTabsProps {
  generatedData: TestRecord[];
  sqlQuery: string;
  mappingFile: MappingFile;
  validationResult?: any;
  onSQLChange: (sql: string) => void;
  onDataChange: (data: TestRecord[]) => void;
}

const TestDataTabs = ({
  generatedData,
  sqlQuery,
  mappingFile,
  validationResult,
  onSQLChange,
  onDataChange,
}: TestDataTabsProps) => {
  return (
    <Tabs defaultValue="data" className="space-y-4">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="data">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Generated Data
        </TabsTrigger>
        <TabsTrigger value="validation">
          <CheckCircle className="h-4 w-4 mr-2" />
          AI Validation Results
        </TabsTrigger>
        <TabsTrigger value="sql">SQL Editor</TabsTrigger>
        <TabsTrigger value="manual-validation">Manual Validation</TabsTrigger>
        <TabsTrigger value="lineage">
          <GitBranch className="h-4 w-4 mr-2" />
          Column Lineage
        </TabsTrigger>
      </TabsList>

      <TabsContent value="data">
        <GeneratedDataTable generatedData={generatedData} />
      </TabsContent>

      <TabsContent value="validation">
        <ValidationResultsDisplay validationResult={validationResult} />
      </TabsContent>

      <TabsContent value="sql">
        <SQLDataEditor
          originalSQL={sqlQuery}
          originalData={generatedData}
          onSQLChange={onSQLChange}
          onDataChange={onDataChange}
        />
      </TabsContent>

      <TabsContent value="manual-validation">
        <SQLValidator
          sqlQuery={sqlQuery}
          sourceData={generatedData}
        />
      </TabsContent>

      <TabsContent value="lineage">
        <ColumnLineageView mappingFile={mappingFile} />
      </TabsContent>
    </Tabs>
  );
};

export default TestDataTabs;
