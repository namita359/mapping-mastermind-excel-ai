
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getBackendApiUrl, setBackendApiUrl } from "@/lib/backendApiService";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

interface BackendApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSet: () => void;
}

const BackendApiConfigModal = ({ isOpen, onClose, onConfigSet }: BackendApiConfigModalProps) => {
  const [apiUrl, setApiUrl] = useState(getBackendApiUrl());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  const testConnection = async () => {
    if (!apiUrl.trim()) return;
    
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionError('');

    try {
      // Test the connection by making a simple request
      const response = await fetch(`${apiUrl.trim()}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setConnectionError(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setConnectionError('Cannot connect to the backend API. Please verify the URL and ensure the service is running.');
        } else {
          setConnectionError(error.message);
        }
      } else {
        setConnectionError('Unknown connection error occurred');
      }
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    if (apiUrl.trim()) {
      setBackendApiUrl(apiUrl.trim());
      onConfigSet();
      onClose();
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Backend API</DialogTitle>
          <DialogDescription>
            Set up your backend API that handles OpenAI requests for SQL generation and data validation
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
              onChange={(e) => {
                setApiUrl(e.target.value);
                setConnectionStatus('idle');
                setConnectionError('');
              }}
            />
            <p className="text-sm text-muted-foreground">
              Your backend should expose these endpoints:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• <code>/api/openai/process-complete</code> - Complete analysis pipeline</li>
              <li>• <code>/api/openai/generate-sql</code> - SQL generation only</li>
              <li>• <code>/api/openai/generate-test-data</code> - Test data generation</li>
              <li>• <code>/api/openai/validate-sql</code> - SQL validation</li>
              <li>• <code>/health</code> - Health check (optional)</li>
            </ul>
          </div>

          {connectionStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Connection test successful! Your backend API is reachable.
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connection failed: {connectionError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={!apiUrl.trim() || !isValidUrl(apiUrl.trim()) || isTestingConnection}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!apiUrl.trim() || !isValidUrl(apiUrl.trim())}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackendApiConfigModal;
