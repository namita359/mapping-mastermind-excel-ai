
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Key } from "lucide-react";
import { setOpenAIKey } from "@/lib/openaiService";

interface OpenAIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySet: () => void;
}

const OpenAIKeyModal = ({ isOpen, onClose, onKeySet }: OpenAIKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Save to localStorage
      setOpenAIKey(apiKey.trim());
      onKeySet();
      onClose();
      setApiKey("");
    } catch (error) {
      console.error("Error saving API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            OpenAI API Key Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Security Notice:</p>
              <p>Your API key will be stored in browser localStorage. For production use, consider connecting to Supabase for secure backend storage.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
            </p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!apiKey.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save API Key"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenAIKeyModal;
