
import { MappingFile } from "@/lib/types";
import GenerationControls from "./test-data/GenerationControls";
import TestDataStats from "./test-data/TestDataStats";
import SQLQueryDisplay from "./test-data/SQLQueryDisplay";
import TestDataTabs from "./test-data/TestDataTabs";
import EmptyState from "./test-data/EmptyState";
import TargetSelectionFilters from "./test-data/TargetSelectionFilters";
import OpenAIKeyModal from "./OpenAIKeyModal";
import { useOpenAIOperations } from "@/hooks/useOpenAIOperations";
import { useTestDataFilters } from "@/hooks/useTestDataFilters";

interface TestDataGeneratorProps {
  mappingFile: MappingFile;
}

const TestDataGenerator = ({ mappingFile }: TestDataGeneratorProps) => {
  const {
    isGenerating,
    generatedData,
    sqlQuery,
    hasGenerated,
    validationResult,
    showOpenAIModal,
    generateCompleteAnalysis,
    downloadTestData,
    handleOpenAIKeySubmit,
    setShowOpenAIModal,
    setSqlQuery,
    setGeneratedData
  } = useOpenAIOperations();

  const {
    selectedMalcode,
    selectedTable,
    filteredMappingFile,
    setSelectedMalcode,
    setSelectedTable
  } = useTestDataFilters(mappingFile);

  const handleGenerateAnalysis = () => {
    generateCompleteAnalysis(filteredMappingFile, selectedMalcode, selectedTable);
  };

  const handleDownloadData = () => {
    downloadTestData(filteredMappingFile);
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
        onGenerateSQL={handleGenerateAnalysis}
        onGenerateTestData={handleGenerateAnalysis}
        onDownloadData={handleDownloadData}
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
          onKeySet={handleOpenAIKeySubmit}
        />
      )}
    </div>
  );
};

export default TestDataGenerator;
