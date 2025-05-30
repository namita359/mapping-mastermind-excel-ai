
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAzureSqlMappingContext } from "@/components/AzureSqlMappingProvider";
import MappingContent from "@/components/MappingContent";
import TestDataGenerator from "@/components/TestDataGenerator";
import { Loader2 } from "lucide-react";

const Mapping = () => {
  const [activeTab, setActiveTab] = useState("mapping");
  const { mappingFile, isLoading } = useAzureSqlMappingContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading mapping data from Azure SQL Database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="testdata">Test Data Generation</TabsTrigger>
        </TabsList>
        <TabsContent value="mapping" className="space-y-4">
          <MappingContent />
        </TabsContent>
        <TabsContent value="testdata" className="space-y-4">
          <TestDataGenerator mappingFile={mappingFile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Mapping;
