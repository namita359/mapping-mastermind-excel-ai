
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MappingFile } from "@/lib/types";
import { createOpenAIService, getOpenAIKey } from "@/lib/openaiService";
import GenerationControls from "./test-data/GenerationControls";
import TestDataStats from "./test-data/TestDataStats";
import SQLQueryDisplay from "./test-data/SQLQueryDisplay";
import TestDataTabs from "./test-data/TestDataTabs";
import EmptyState from "./test-data/EmptyState";
import TargetSelectionFilters from "./test-data/TargetSelectionFilters";
import OpenAIKeyModal from "./OpenAIKeyModal";

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
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showOpenAIModal, setShowOpenAIModal] = useState(false);
  
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

  const generateCompleteAnalysis = async () => {
    // Check if OpenAI API key is available
    const openAIService = createOpenAIService();
    if (!openAIService) {
      setShowOpenAIModal(true);
      return;
    }

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
      console.log("Starting OpenAI analysis pipeline for filtered mappings:", {
        originalCount: mappingFile.rows.length,
        filteredCount: filteredMappingFile.rows.length,
        selectedMalcode,
        selectedTable
      });
      
      toast({
        title: "AI Analysis Started",
        description: `Processing SQL generation, test data creation, and validation for ${filteredMappingFile.rows.length} filtered mappings...`,
      });

      // Convert filtered mapping file to the format expected by OpenAI
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

      console.log("Sending mapping info to OpenAI:", mappingInfo);

      // Call the OpenAI service directly
      const result = await openAIService.processComplete(mappingInfo);
      
      console.log("OpenAI analysis response received:", result);
      
      // Set all results
      setSqlQuery(result.sqlQuery);
      setGeneratedData(result.testData);
      setValidationResult(result.validationResults);
      setHasGenerated(true);
      
      toast({
        title: "AI Analysis Complete",
        description: `Successfully generated SQL query, ${result.testData.length} test scenarios, and validation results`,
      });
      
    } catch (error) {
      console.error("Error in AI analysis:", error);
      
      let errorMessage = "Failed to complete AI analysis";
      let errorDescription = "Please check your OpenAI API configuration and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "OpenAI API Key Issue";
          errorDescription = "Invalid or missing OpenAI API key. Please check your API key configuration.";
          setShowOpenAIModal(true);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = "Network Connection Failed";
          errorDescription = "Cannot connect to OpenAI API. Please check your internet connection.";
        } else if (error.message.includes('500')) {
          errorMessage = "OpenAI API Server Error";
          errorDescription = "OpenAI API returned a server error. Please try again in a moment.";
        } else if (error.message.includes('401')) {
          errorMessage = "OpenAI API Authentication Failed";
          errorDescription = "Invalid OpenAI API key. Please check your API key configuration.";
          setShowOpenAIModal(true);
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
        analysisType: "OpenAI Complete Analysis"
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
    link.download = `ai_analysis_results_${filteredMappingFile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "AI analysis results downloaded successfully",
    });
  };

  const handleOpenAIKeySubmit = () => {
    setShowOpenAIModal(false);
    // Try to run the analysis again if a key was added
    if (getOpenAIKey()) {
      generateCompleteAnalysis();
    }
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

      {showOpenAIModal && (
        <OpenAIKeyModal
          isOpen={showOpenAIModal}
          onClose={() => setShowOpenAIModal(false)}
          onSubmit={handleOpenAIKeySubmit}
        />
      )}
    </div>
  );
};

export default TestDataGenerator;
