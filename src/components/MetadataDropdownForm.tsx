
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { MappingRow } from '@/lib/types';
import { useMetadataDropdowns } from '@/hooks/useMetadataDropdowns';

interface MetadataDropdownFormProps {
  onAddMapping: (mapping: MappingRow) => void;
  onClose: () => void;
}

const MetadataDropdownForm = ({ onAddMapping, onClose }: MetadataDropdownFormProps) => {
  const { toast } = useToast();
  const {
    malcodes,
    sourceTables,
    targetTables,
    sourceColumns,
    targetColumns,
    loading,
    loadTablesForMalcode,
    loadColumnsForTable,
    getMalcodeById,
    getTableById,
    getColumnById,
  } = useMetadataDropdowns();

  const [formData, setFormData] = useState({
    sourceMalcodeId: '',
    sourceTableId: '',
    sourceColumnId: '',
    targetMalcodeId: '',
    targetTableId: '',
    targetColumnId: '',
    transformation: '',
    joinClause: '',
    sourceType: 'SRZ_ADLS',
    targetType: 'CZ_ADLS'
  });

  const handleSourceMalcodeChange = (malcodeId: string) => {
    setFormData(prev => ({
      ...prev,
      sourceMalcodeId: malcodeId,
      sourceTableId: '',
      sourceColumnId: ''
    }));
    loadTablesForMalcode(malcodeId, true);
  };

  const handleTargetMalcodeChange = (malcodeId: string) => {
    setFormData(prev => ({
      ...prev,
      targetMalcodeId: malcodeId,
      targetTableId: '',
      targetColumnId: ''
    }));
    loadTablesForMalcode(malcodeId, false);
  };

  const handleSourceTableChange = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      sourceTableId: tableId,
      sourceColumnId: ''
    }));
    loadColumnsForTable(tableId, true);
  };

  const handleTargetTableChange = (tableId: string) => {
    setFormData(prev => ({
      ...prev,
      targetTableId: tableId,
      targetColumnId: ''
    }));
    loadColumnsForTable(tableId, false);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.sourceMalcodeId || !formData.sourceTableId || !formData.sourceColumnId ||
        !formData.targetMalcodeId || !formData.targetTableId || !formData.targetColumnId) {
      toast({
        title: "Missing required fields",
        description: "Please select all source and target metadata",
        variant: "destructive"
      });
      return;
    }

    // Get the selected metadata objects
    const sourceMalcode = getMalcodeById(formData.sourceMalcodeId);
    const sourceTable = getTableById(formData.sourceTableId, true);
    const sourceColumn = getColumnById(formData.sourceColumnId, true);
    const targetMalcode = getMalcodeById(formData.targetMalcodeId);
    const targetTable = getTableById(formData.targetTableId, false);
    const targetColumn = getColumnById(formData.targetColumnId, false);

    if (!sourceMalcode || !sourceTable || !sourceColumn || !targetMalcode || !targetTable || !targetColumn) {
      toast({
        title: "Error",
        description: "Could not find selected metadata",
        variant: "destructive"
      });
      return;
    }

    const newMapping: MappingRow = {
      id: `mapping-${Date.now()}`,
      sourceColumn: {
        id: `source-${Date.now()}`,
        malcode: sourceMalcode.malcode,
        table: sourceTable.table_name,
        column: sourceColumn.column_name,
        dataType: sourceColumn.data_type || 'string',
        sourceType: formData.sourceType as 'SRZ_ADLS',
        businessMetadata: {
          malcodeDescription: sourceMalcode.business_description,
          tableDescription: sourceTable.business_description,
          columnDescription: sourceColumn.business_description
        }
      },
      targetColumn: {
        id: `target-${Date.now()}`,
        malcode: targetMalcode.malcode,
        table: targetTable.table_name,
        column: targetColumn.column_name,
        dataType: targetColumn.data_type || 'string',
        targetType: formData.targetType as 'CZ_ADLS' | 'SYNAPSE_TABLE',
        businessMetadata: {
          malcodeDescription: targetMalcode.business_description,
          tableDescription: targetTable.business_description,
          columnDescription: targetColumn.business_description
        }
      },
      transformation: formData.transformation || undefined,
      join: formData.joinClause || undefined,
      status: 'draft',
      createdBy: 'User',
      createdAt: new Date(),
      comments: []
    };

    onAddMapping(newMapping);
    onClose();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Mapping (Metadata-Driven)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Source Column</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sourceMalcode">Malcode</Label>
                <Select value={formData.sourceMalcodeId} onValueChange={handleSourceMalcodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source malcode" />
                  </SelectTrigger>
                  <SelectContent>
                    {malcodes.map((malcode) => (
                      <SelectItem key={malcode.id} value={malcode.id}>
                        {malcode.malcode}
                        {malcode.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {malcode.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sourceTable">Table</Label>
                <Select 
                  value={formData.sourceTableId} 
                  onValueChange={handleSourceTableChange}
                  disabled={!formData.sourceMalcodeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source table" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceTables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.table_name}
                        {table.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {table.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sourceColumn">Column</Label>
                <Select 
                  value={formData.sourceColumnId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sourceColumnId: value }))}
                  disabled={!formData.sourceTableId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source column" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.column_name}
                        <span className="text-muted-foreground ml-2">
                          ({column.data_type})
                        </span>
                        {column.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {column.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sourceType">Source Type</Label>
                <Select value={formData.sourceType} onValueChange={(value) => setFormData(prev => ({ ...prev, sourceType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SRZ_ADLS">SRZ_ADLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Target Column */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Column</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetMalcode">Malcode</Label>
                <Select value={formData.targetMalcodeId} onValueChange={handleTargetMalcodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target malcode" />
                  </SelectTrigger>
                  <SelectContent>
                    {malcodes.map((malcode) => (
                      <SelectItem key={malcode.id} value={malcode.id}>
                        {malcode.malcode}
                        {malcode.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {malcode.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetTable">Table</Label>
                <Select 
                  value={formData.targetTableId} 
                  onValueChange={handleTargetTableChange}
                  disabled={!formData.targetMalcodeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target table" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetTables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {table.table_name}
                        {table.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {table.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetColumn">Column</Label>
                <Select 
                  value={formData.targetColumnId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetColumnId: value }))}
                  disabled={!formData.targetTableId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target column" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.column_name}
                        <span className="text-muted-foreground ml-2">
                          ({column.data_type})
                        </span>
                        {column.business_description && (
                          <span className="text-muted-foreground ml-2">
                            - {column.business_description}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetType">Target Type</Label>
                <Select value={formData.targetType} onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CZ_ADLS">CZ_ADLS</SelectItem>
                    <SelectItem value="SYNAPSE_TABLE">SYNAPSE_TABLE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transformation and Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transformation">Transformation</Label>
            <Textarea
              id="transformation"
              value={formData.transformation}
              onChange={(e) => setFormData(prev => ({ ...prev, transformation: e.target.value }))}
              placeholder="Enter transformation logic (optional)"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="joinClause">Join Clause</Label>
            <Textarea
              id="joinClause"
              value={formData.joinClause}
              onChange={(e) => setFormData(prev => ({ ...prev, joinClause: e.target.value }))}
              placeholder="Enter join clause (optional)"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            Add Mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetadataDropdownForm;
