
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBackendApiUrl, setBackendApiUrl } from "@/lib/backendApiService";

interface BackendApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSet: () => void;
}

const BackendApiConfigModal = ({ isOpen, onClose, onConfigSet }: BackendApiConfigModalProps) => {
  const [apiUrl, setApiUrl] = useState(getBackendApiUrl());

  const handleSave = () => {
    if (apiUrl.trim()) {
      setBackendApiUrl(apiUrl.trim());
      onConfigSet();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Backend API</DialogTitle>
          <DialogDescription>
            Enter the URL of your backend API that handles OpenAI requests
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">Backend API URL</Label>
            <Input
              id="api-url"
              type="url"
              placeholder="http://localhost:3000"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your backend should have endpoints: /api/openai/process-complete, /api/openai/generate-sql, etc.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!apiUrl.trim()}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackendApiConfigModal;
