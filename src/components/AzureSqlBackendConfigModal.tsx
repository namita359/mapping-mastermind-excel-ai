
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAzureSqlBackendUrl, setAzureSqlBackendUrl } from "@/lib/azureSqlBackendService";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

interface AzureSqlBackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSet: () => void;
}

const AzureSqlBackendConfigModal = ({ isOpen, onClose, onConfigSet }: AzureSqlBackendConfigModalProps) => {
  const [backendUrl, setBackendUrl] = useState(getAzureSqlBackendUrl());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');

  const testConnection = async () => {
    if (!backendUrl.trim()) return;
    
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionError('');

    try {
      const response = await fetch(`${backendUrl.trim()}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const healthData = await response.json();
        setConnectionStatus('success');
        console.log('Backend health check:', healthData);
      } else {
        setConnectionStatus('error');
        setConnectionError(`Server responded with status ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setConnectionError('Cannot connect to the backend service. Please verify the URL and ensure the service is running.');
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
    if (backendUrl.trim()) {
      setAzureSqlBackendUrl(backendUrl.trim());
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
          <DialogTitle>Configure Azure SQL Backend</DialogTitle>
          <DialogDescription>
            Set up your FastAPI backend service that handles Azure SQL database operations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backend-url">Backend Service URL</Label>
            <Input
              id="backend-url"
              type="url"
              placeholder="http://localhost:3000"
              value={backendUrl}
              onChange={(e) => {
                setBackendUrl(e.target.value);
                setConnectionStatus('idle');
                setConnectionError('');
              }}
            />
            <p className="text-sm text-muted-foreground">
              Your FastAPI backend should expose these endpoints:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• <code>/api/mapping-files</code> - CRUD operations for mapping files</li>
              <li>• <code>/api/mapping-rows/*/status</code> - Update row status</li>
              <li>• <code>/api/mapping-rows/*/comments</code> - Add comments</li>
              <li>• <code>/health</code> - Health check and database status</li>
            </ul>
          </div>

          {connectionStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Connection test successful! Your backend service is reachable and database is connected.
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
              disabled={!backendUrl.trim() || !isValidUrl(backendUrl.trim()) || isTestingConnection}
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
                disabled={!backendUrl.trim() || !isValidUrl(backendUrl.trim())}
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

export default AzureSqlBackendConfigModal;
