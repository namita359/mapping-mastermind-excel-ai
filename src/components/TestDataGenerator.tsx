
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MappingFile } from "@/lib/types";
import { createBackendApiService, getBackendApiUrl } from "@/lib/backendApiService";
import GenerationControls from "./test-data/GenerationControls";
import TestDataStats from "./test-data/TestDataStats";
import SQLQueryDisplay from "./test-data/SQLQueryDisplay";
import TestDataTabs from "./test-data/TestDataTabs";
import EmptyState from "./test-data/EmptyState";
import TargetSelectionFilters from "./test-data/TargetSelectionFilters";
import BackendApiConfigModal from "./BackendApiConfigModal";

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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // Filter states
  const [selectedMalcode, setSelectedMalcode] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Filter mapping file based on selections
  const filteredMappingFile = {
    ...mappingFile,
    rows: mappingFile.rows.filter(row => {
      if (selectedMalcode && row.targetColumn.malcode !== selectedMalcode) return false;
      if (selectedTable && row.targetColumn.table !== selectedTable) return false;
      return true;
    })
  };

  const checkBackendApiConfig = () => {
    const apiUrl = getBackendApiUrl();
    if (!apiUrl || apiUrl === 'http://localhost:3000') {
      setShowConfigModal(true);
      return false;
    }
    return true;
  };

  const generateCompleteAnalysis = async () => {
    if (!checkBackendApiConfig()) return;
    
    if (filteredMappingFile.rows.length === 0) {
      toast({
        title: "No Mappings Selected",
        description: "Please select target malcode and/or table to generate SQL for specific mappings.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setIsGeneratingTestData(true);
    
    try {
      const backendApiService = createBackendApiService();

      console.log("Starting backend API analysis pipeline for filtered mappings:", {
        originalCount: mappingFile.rows.length,
        filteredCount: filteredMappingFile.rows.length,
        selectedMalcode,
        selectedTable
      });
      
      toast({
        title: "Backend API Analysis Started",
        description: `Your backend is processing SQL generation, test data, and validation for ${filteredMappingFile.rows.length} filtered mappings...`,
      });

      // Convert filtered mapping file to the format expected by backend API
      const mappingInfo = {
        name: `${filteredMappingFile.name}${selectedMalcode ? ` (${selectedMalcode})` : ''}${selectedTable ? ` - ${selectedTable}` : ''}`,
        rows: filteredMappingFile.rows.map(row => ({
          sourceColumn: {
            malcode: row.sourceColumn.malcode,
            table: row.sourceColumn.table,
            column: row.sourceColumn.column
          },
          targetColumn: {
            malcode: row.targetColumn.malcode,
            table: row.targetColumn.table,
            column: row.targetColumn.column
          },
          dataType: row.sourceColumn.dataType || 'string',
          transformationLogic: row.transformation || ''
        }))
      };

      // Call the backend API for complete processing
      const result = await backendApiService.processComplete(mappingInfo);
      
      // Set all results
      setSqlQuery(result.sqlQuery);
      setGeneratedData(result.testData);
      setValidationResult(result.validationResults);
      setHasGenerated(true);
      
      toast({
        title: "Backend API Analysis Complete",
        description: `Generated SQL query, ${result.testData.length} test scenarios, and validation results for filtered mappings`,
      });
      
    } catch (error) {
      console.error("Error in backend API analysis:", error);
      
      let errorMessage = "Failed to complete backend API analysis";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = "Cannot connect to backend API. Please check your backend API URL and ensure the service is running.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsGeneratingTestData(false);
    }
  };

  const downloadTestData = () => {
    const dataStr = JSON.stringify(generatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backend_api_test_data_${filteredMappingFile.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Backend API generated test data file download initiated",
    });
  };

  const handleConfigSet = () => {
    toast({
      title: "Backend API Configured",
      description: "Backend API URL has been saved. You can now generate analysis.",
    });
  };

  if (mappingFile.rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <TargetSelectionFilters
        mappingFile={mappingFile}
        selectedMalcode={selectedMalcode}
        selectedTable={selectedTable}
        onMalcodeChange={setSelectedMalcode}
        onTableChange={setSelectedTable}
      />

      <GenerationControls
        mappingFileName={filteredMappingFile.name}
        isGenerating={isGenerating}
        isGeneratingTestData={isGeneratingTestData}
        hasGenerated={hasGenerated}
        hasGeneratedData={generatedData.length > 0}
        onGenerateSQL={generateCompleteAnalysis}
        onGenerateTestData={generateCompleteAnalysis}
        onDownloadData={downloadTestData}
      />

      <TestDataStats 
        mappingFile={filteredMappingFile} 
        generatedDataCount={generatedData.length} 
      />

      {hasGenerated && <SQLQueryDisplay sqlQuery={sqlQuery} />}

      {generatedData.length > 0 && (
        <TestDataTabs
          generatedData={generatedData}
          sqlQuery={sqlQuery}
          mappingFile={filteredMappingFile}
          validationResult={validationResult}
          onSQLChange={setSqlQuery}
          onDataChange={setGeneratedData}
        />
      )}

      <BackendApiConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSet={handleConfigSet}
      />
    </div>
  );
};

export default TestDataGenerator;
