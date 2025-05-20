
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSQL = async () => {
    // In a real application, this would call OpenAI's API
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockSQLResponse = `
SELECT 
  s.customer_id,
  s.first_name,
  s.last_name,
  s.email,
  s.phone_number,
  t.customer_key,
  t.full_name,
  t.contact_email,
  t.contact_phone
FROM 
  crm_system.customers s
JOIN 
  data_warehouse.dim_customer t
  ON s.customer_id = t.source_customer_id
WHERE 
  s.status = 'active'
      `.trim();
      
      setResult(mockSQLResponse);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating SQL code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-4 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">AI SQL Generator</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 flex-grow">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-1">
            Describe what you want to do with your data
          </label>
          <Textarea 
            id="prompt" 
            placeholder="e.g., Show me all customers from the CRM system matching with customers in the data warehouse..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGenerateSQL}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "Generating..." : "Generate SQL"}
          </Button>
        </div>
        
        {result && (
          <>
            <Separator />
            <div className="flex-grow overflow-hidden">
              <label className="block text-sm font-medium mb-2">
                Generated SQL
              </label>
              <ScrollArea className="h-[200px] rounded-md border">
                <pre className="bg-gray-50 p-4 text-sm font-mono overflow-x-auto">
                  {result}
                </pre>
              </ScrollArea>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast({
                    title: "Copied to clipboard",
                    description: "SQL code has been copied to clipboard",
                  });
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
