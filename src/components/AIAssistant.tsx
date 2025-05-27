
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Copy, Sparkles } from "lucide-react";

interface AIAssistantProps {
  onClose: () => void;
}

interface MappingRecommendation {
  sourceMalcode: string;
  sourceTable: string;
  sourceColumn: string;
  targetMalcode: string;
  targetTable: string;
  targetColumn: string;
  confidence: number;
  reasoning: string;
  transformation?: string;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<MappingRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock recommendations based on the prompt
      const mockRecommendations: MappingRecommendation[] = [
        {
          sourceMalcode: "CRM_001",
          sourceTable: "customers",
          sourceColumn: "customer_id",
          targetMalcode: "DW_001",
          targetTable: "dim_customer",
          targetColumn: "customer_key",
          confidence: 95,
          reasoning: "Direct mapping of customer identifiers. High confidence due to naming similarity and data lineage patterns.",
          transformation: "CAST(customer_id AS BIGINT)"
        },
        {
          sourceMalcode: "CRM_001",
          sourceTable: "customers",
          sourceColumn: "email_address",
          targetMalcode: "DW_001",
          targetTable: "dim_customer",
          targetColumn: "email",
          confidence: 88,
          reasoning: "Email field mapping with standard data cleaning transformation.",
          transformation: "LOWER(TRIM(email_address))"
        },
        {
          sourceMalcode: "SALES_002",
          sourceTable: "orders",
          sourceColumn: "order_date",
          targetMalcode: "DW_002",
          targetTable: "fact_sales",
          targetColumn: "sale_date",
          confidence: 92,
          reasoning: "Temporal mapping between order and sale events. Standard date format conversion needed.",
          transformation: "CAST(order_date AS DATE)"
        }
      ];
      
      setRecommendations(mockRecommendations);
      
      toast({
        title: "AI Recommendations Generated",
        description: `Found ${mockRecommendations.length} mapping recommendations`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating mapping recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyMappingToClipboard = (recommendation: MappingRecommendation) => {
    const mappingText = `Source: ${recommendation.sourceMalcode}.${recommendation.sourceTable}.${recommendation.sourceColumn}
Target: ${recommendation.targetMalcode}.${recommendation.targetTable}.${recommendation.targetColumn}
Transformation: ${recommendation.transformation || 'Direct mapping'}
Confidence: ${recommendation.confidence}%
Reasoning: ${recommendation.reasoning}`;

    navigator.clipboard.writeText(mappingText);
    toast({
      title: "Copied to clipboard",
      description: "Mapping recommendation copied successfully",
    });
  };

  return (
    <div className="border rounded-md p-4 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-medium">AI Mapping Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 flex-grow">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Describe what mappings you need
          </label>
          <Textarea 
            id="prompt" 
            placeholder="e.g., I need to map customer data from CRM system to data warehouse, including email normalization and ID transformation..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="mr-2 h-4 w-4" />
                Get AI Recommendations
              </>
            )}
          </Button>
        </div>
        
        {recommendations.length > 0 && (
          <>
            <Separator />
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Recommended Mappings</h4>
                <Badge variant="secondary">{recommendations.length} suggestions</Badge>
              </div>
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-700">Source:</span> 
                              <span className="ml-1 font-mono">{rec.sourceMalcode}.{rec.sourceTable}.{rec.sourceColumn}</span>
                            </div>
                            <div>
                              <span className="font-medium text-green-700">Target:</span> 
                              <span className="ml-1 font-mono">{rec.targetMalcode}.{rec.targetTable}.{rec.targetColumn}</span>
                            </div>
                            {rec.transformation && (
                              <div>
                                <span className="font-medium text-purple-700">Transform:</span> 
                                <span className="ml-1 font-mono text-xs bg-gray-100 px-1 rounded">{rec.transformation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge 
                            variant={rec.confidence > 90 ? "default" : rec.confidence > 75 ? "secondary" : "outline"}
                            className={rec.confidence > 90 ? "bg-green-600" : rec.confidence > 75 ? "bg-yellow-500" : ""}
                          >
                            {rec.confidence}%
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMappingToClipboard(rec)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 bg-white p-2 rounded border-l-4 border-purple-200">
                        <strong>AI Reasoning:</strong> {rec.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              💡 <strong>Tip:</strong> Click the copy button to copy mapping details. Review confidence scores and reasoning before implementing.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
