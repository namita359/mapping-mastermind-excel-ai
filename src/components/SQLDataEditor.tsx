
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw } from "lucide-react";

interface TestRecord {
  [key: string]: any;
}

interface SQLDataEditorProps {
  originalSQL: string;
  originalData: TestRecord[];
  onSQLChange: (sql: string) => void;
  onDataChange: (data: TestRecord[]) => void;
}

const SQLDataEditor = ({ originalSQL, originalData, onSQLChange, onDataChange }: SQLDataEditorProps) => {
  const [editedSQL, setEditedSQL] = useState(originalSQL);
  const [editedDataJSON, setEditedDataJSON] = useState(JSON.stringify(originalData, null, 2));
  const [hasChanges, setHasChanges] = useState(false);

  const handleSQLChange = (value: string) => {
    setEditedSQL(value);
    setHasChanges(value !== originalSQL || editedDataJSON !== JSON.stringify(originalData, null, 2));
  };

  const handleDataChange = (value: string) => {
    setEditedDataJSON(value);
    setHasChanges(editedSQL !== originalSQL || value !== JSON.stringify(originalData, null, 2));
  };

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(editedDataJSON);
      onSQLChange(editedSQL);
      onDataChange(parsedData);
      setHasChanges(false);
    } catch (error) {
      console.error("Invalid JSON format:", error);
      alert("Invalid JSON format in test data. Please fix the format before saving.");
    }
  };

  const handleReset = () => {
    setEditedSQL(originalSQL);
    setEditedDataJSON(JSON.stringify(originalData, null, 2));
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit SQL Query & Test Data</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sql-editor">SQL Query</Label>
          <Textarea
            id="sql-editor"
            value={editedSQL}
            onChange={(e) => handleSQLChange(e.target.value)}
            className="font-mono text-sm min-h-[150px] mt-2"
            placeholder="Enter your SQL query here..."
          />
        </div>
        
        <div>
          <Label htmlFor="data-editor">Test Data (JSON)</Label>
          <Textarea
            id="data-editor"
            value={editedDataJSON}
            onChange={(e) => handleDataChange(e.target.value)}
            className="font-mono text-sm min-h-[200px] mt-2"
            placeholder="Enter test data in JSON format..."
          />
        </div>
        
        {hasChanges && (
          <p className="text-sm text-amber-600">
            You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SQLDataEditor;
