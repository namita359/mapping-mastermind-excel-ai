
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
  const [isGeneratingTestData, setIsGeneratingTestData] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
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

  const checkOpenAIKey = () => {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      setShowKeyModal(true);
      return false;
    }
    return true;
  };

  const generateCompleteAnalysis = async () => {
    if (!checkOpenAIKey()) return;
    
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
      const openaiService = createOpenAIService();
      if (!openaiService) {
        throw new Error("Failed to create OpenAI service");
      }

      console.log("Starting complete OpenAI analysis pipeline for filtered mappings:", {
        originalCount: mappingFile.rows.length,
        filteredCount: filteredMappingFile.rows.length,
        selectedMalcode,
        selectedTable
      });
      
      toast({
        title: "AI Analysis Started",
        description: `OpenAI is generating SQL, test data, and validation results for ${filteredMappingFile.rows.length} filtered mappings...`,
      });

      // Convert filtered mapping file to the format expected by OpenAI service
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

      // Run the complete OpenAI pipeline
      const result = await openaiService.processComplete(mappingInfo);
      
      // Set all results
      setSqlQuery(result.sqlQuery);
      setGeneratedData(result.testData);
      setValidationResult(result.validationResults);
      setHasGenerated(true);
      
      toast({
        title: "AI Analysis Complete",
        description: `Generated SQL query, ${result.testData.length} test scenarios, and validation results for filtered mappings`,
      });
      
    } catch (error) {
      console.error("Error in OpenAI analysis:", error);
      
      let errorMessage = "Failed to complete AI analysis";
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "Invalid OpenAI API key. Please check your key and try again.";
        } else if (error.message.includes('429')) {
          errorMessage = "OpenAI rate limit exceeded. Please try again later.";
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
    link.download = `openai_test_data_${filteredMappingFile.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "OpenAI generated test data file download initiated",
    });
  };

  const handleKeySet = () => {
    toast({
      title: "API Key Saved",
      description: "OpenAI API key has been saved. You can now generate analysis.",
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

      <OpenAIKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onKeySet={handleKeySet}
      />
    </div>
  );
};

export default TestDataGenerator;
