
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Database, Play, Loader2, Sparkles } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              SQL Query & Test Data Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Generate SQL query and use OpenAI to create intelligent test data for validation
            </p>
          </div>
          <div className="flex gap-2">
            {hasGeneratedData && (
              <Button variant="outline" onClick={onDownloadData} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Data
              </Button>
            )}
            <Button 
              onClick={onGenerateSQL} 
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate SQL'}
            </Button>
            {hasGenerated && (
              <Button 
                onClick={onGenerateTestData} 
                disabled={isGeneratingTestData}
                size="sm"
              >
                {isGeneratingTestData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGeneratingTestData ? 'Generating with AI...' : 'Generate Test Data'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GenerationControls;
