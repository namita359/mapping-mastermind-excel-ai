
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, Loader2, Sparkles } from "lucide-react";

interface GenerationControlsProps {
  mappingFileName: string;
  isGenerating: boolean;
  isGeneratingTestData: boolean;
  hasGenerated: boolean;
  hasGeneratedData: boolean;
  onGenerateSQL: () => void;
  onGenerateTestData: () => void;
  onDownloadData: () => void;
}

const GenerationControls = ({
  mappingFileName,
  isGenerating,
  isGeneratingTestData,
  hasGenerated,
  hasGeneratedData,
  onGenerateSQL,
  onGenerateTestData,
  onDownloadData,
}: GenerationControlsProps) => {
  const isProcessing = isGenerating || isGeneratingTestData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              OpenAI Complete Analysis Pipeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generate SQL → Create test data → Validate query using OpenAI in one complete process
            </p>
          </div>
          <div className="flex gap-2">
            {hasGeneratedData && (
              <Button variant="outline" onClick={onDownloadData} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
            )}
            <Button 
              onClick={onGenerateSQL} 
              disabled={isProcessing}
              size="sm"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Processing with OpenAI...' : 'Run Complete AI Analysis'}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GenerationControls;
