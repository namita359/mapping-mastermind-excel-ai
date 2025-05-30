
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
    
    try {
      const backendApiService = createBackendApiService();

      console.log("Starting backend API analysis pipeline for filtered mappings:", {
        originalCount: mappingFile.rows.length,
        filteredCount: filteredMappingFile.rows.length,
        selectedMalcode,
        selectedTable,
        backendUrl: getBackendApiUrl()
      });
      
      toast({
        title: "Backend API Analysis Started",
        description: `Processing SQL generation, test data creation, and validation for ${filteredMappingFile.rows.length} filtered mappings...`,
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

      console.log("Sending mapping info to backend:", mappingInfo);

      // Call the backend API for complete processing
      const result = await backendApiService.processComplete(mappingInfo);
      
      console.log("Backend API response received:", result);
      
      // Set all results
      setSqlQuery(result.sqlQuery);
      setGeneratedData(result.testData);
      setValidationResult(result.validationResults);
      setHasGenerated(true);
      
      toast({
        title: "Backend API Analysis Complete",
        description: `Successfully generated SQL query, ${result.testData.length} test scenarios, and validation results`,
      });
      
    } catch (error) {
      console.error("Error in backend API analysis:", error);
      
      let errorMessage = "Failed to complete backend API analysis";
      let errorDescription = "Please check your backend API configuration and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = "Backend API Connection Failed";
          errorDescription = "Cannot connect to your backend API. Please verify the URL is correct and the service is running.";
        } else if (error.message.includes('500')) {
          errorMessage = "Backend API Server Error";
          errorDescription = "Your backend API returned a server error. Please check your backend logs.";
        } else if (error.message.includes('404')) {
          errorMessage = "Backend API Endpoint Not Found";
          errorDescription = "The backend API endpoint was not found. Please verify your backend API has the required endpoints.";
        } else {
          errorDescription = error.message;
        }
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTestData = () => {
    if (generatedData.length === 0) {
      toast({
        title: "No Data to Download",
        description: "Please generate test data first.",
        variant: "destructive"
      });
      return;
    }

    const downloadData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        mappingFile: filteredMappingFile.name,
        recordCount: generatedData.length,
        backendApiUrl: getBackendApiUrl()
      },
      sqlQuery,
      testData: generatedData,
      validationResults: validationResult
    };

    const dataStr = JSON.stringify(downloadData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backend_api_results_${filteredMappingFile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "Backend API analysis results downloaded successfully",
    });
  };

  const handleConfigSet = () => {
    toast({
      title: "Backend API Configured",
      description: "Backend API URL has been saved. You can now run the complete analysis.",
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
        isGeneratingTestData={false}
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
