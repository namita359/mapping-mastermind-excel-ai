
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
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

  console.log('=== MetadataDropdownForm Debug ===');
  console.log('Malcodes loaded:', malcodes?.length || 0);
  console.log('Malcodes data:', malcodes);
  console.log('Loading state:', loading);
  console.log('Source tables:', sourceTables?.length || 0);
  console.log('Target tables:', targetTables?.length || 0);
  console.log('Component rendered at:', new Date().toISOString());

  const handleSourceMalcodeChange = (malcodeId: string) => {
    console.log('Source malcode changed:', malcodeId);
    setFormData(prev => ({
      ...prev,
      sourceMalcodeId: malcodeId,
      sourceTableId: '',
      sourceColumnId: ''
    }));
    loadTablesForMalcode(malcodeId, true);
  };

  const handleTargetMalcodeChange = (malcodeId: string) => {
    console.log('Target malcode changed:', malcodeId);
    setFormData(prev => ({
      ...prev,
      targetMalcodeId: malcodeId,
      targetTableId: '',
      targetColumnId: ''
    }));
    loadTablesForMalcode(malcodeId, false);
  };

  const handleSourceTableChange = (tableId: string) => {
    console.log('Source table changed:', tableId);
    setFormData(prev => ({
      ...prev,
      sourceTableId: tableId,
      sourceColumnId: ''
    }));
    loadColumnsForTable(tableId, true);
  };

  const handleTargetTableChange = (tableId: string) => {
    console.log('Target table changed:', tableId);
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
    <div className="space-y-6 p-4">
      {/* Enhanced Debug Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>Malcodes loaded: <strong>{malcodes?.length || 0}</strong></div>
          <div>Loading state: <strong>{loading.toString()}</strong></div>
          <div>Source tables: <strong>{sourceTables?.length || 0}</strong></div>
          <div>Target tables: <strong>{targetTables?.length || 0}</strong></div>
          <div>Form data: <code className="text-xs">{JSON.stringify(formData, null, 2)}</code></div>
        </CardContent>
      </Card>
      
      {loading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading metadata...</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Column */}
        <Card className="border-2">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg">Source Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sourceMalcode" className="text-sm font-medium">
                Malcode <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Select value={formData.sourceMalcodeId} onValueChange={handleSourceMalcodeChange}>
                  <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500">
                    <SelectValue placeholder={
                      loading ? "Loading..." : 
                      malcodes.length === 0 ? "No malcodes available" : 
                      "Select source malcode"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading malcodes...
                        </div>
                      </SelectItem>
                    ) : malcodes.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No malcodes found - add metadata first
                      </SelectItem>
                    ) : (
                      malcodes.map((malcode) => (
                        <SelectItem key={malcode.id} value={malcode.id} className="hover:bg-gray-100">
                          <div className="flex flex-col">
                            <span className="font-medium">{malcode.malcode}</span>
                            {malcode.business_description && (
                              <span className="text-xs text-gray-500">
                                {malcode.business_description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {malcodes.length === 0 && !loading && (
                <p className="text-xs text-red-500">No malcodes available. Please add metadata first.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceTable" className="text-sm font-medium">
                Table <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.sourceTableId} 
                onValueChange={handleSourceTableChange}
                disabled={!formData.sourceMalcodeId}
              >
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.sourceMalcodeId ? "Select malcode first" : 
                    sourceTables.length === 0 ? "No tables available" : 
                    "Select source table"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {sourceTables.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No tables found for this malcode
                    </SelectItem>
                  ) : (
                    sourceTables.map((table) => (
                      <SelectItem key={table.id} value={table.id} className="hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">{table.table_name}</span>
                          {table.business_description && (
                            <span className="text-xs text-gray-500">
                              {table.business_description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceColumn" className="text-sm font-medium">
                Column <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.sourceColumnId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, sourceColumnId: value }))}
                disabled={!formData.sourceTableId}
              >
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.sourceTableId ? "Select table first" : 
                    sourceColumns.length === 0 ? "No columns available" : 
                    "Select source column"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {sourceColumns.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No columns found for this table
                    </SelectItem>
                  ) : (
                    sourceColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id} className="hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">{column.column_name}</span>
                          <span className="text-xs text-gray-500">
                            Type: {column.data_type}
                            {column.business_description && ` - ${column.business_description}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceType" className="text-sm font-medium">Source Type</Label>
              <Select value={formData.sourceType} onValueChange={(value) => setFormData(prev => ({ ...prev, sourceType: value }))}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="SRZ_ADLS">SRZ_ADLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Target Column */}
        <Card className="border-2">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">Target Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="targetMalcode" className="text-sm font-medium">
                Malcode <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.targetMalcodeId} onValueChange={handleTargetMalcodeChange}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500">
                  <SelectValue placeholder={
                    loading ? "Loading..." : 
                    malcodes.length === 0 ? "No malcodes available" : 
                    "Select target malcode"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading malcodes...
                      </div>
                    </SelectItem>
                  ) : malcodes.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No malcodes found - add metadata first
                    </SelectItem>
                  ) : (
                    malcodes.map((malcode) => (
                      <SelectItem key={malcode.id} value={malcode.id} className="hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">{malcode.malcode}</span>
                          {malcode.business_description && (
                            <span className="text-xs text-gray-500">
                              {malcode.business_description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetTable" className="text-sm font-medium">
                Table <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.targetTableId} 
                onValueChange={handleTargetTableChange}
                disabled={!formData.targetMalcodeId}
              >
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.targetMalcodeId ? "Select malcode first" : 
                    targetTables.length === 0 ? "No tables available" : 
                    "Select target table"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {targetTables.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No tables found for this malcode
                    </SelectItem>
                  ) : (
                    targetTables.map((table) => (
                      <SelectItem key={table.id} value={table.id} className="hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">{table.table_name}</span>
                          {table.business_description && (
                            <span className="text-xs text-gray-500">
                              {table.business_description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetColumn" className="text-sm font-medium">
                Column <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.targetColumnId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetColumnId: value }))}
                disabled={!formData.targetTableId}
              >
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.targetTableId ? "Select table first" : 
                    targetColumns.length === 0 ? "No columns available" : 
                    "Select target column"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50 max-h-60">
                  {targetColumns.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No columns found for this table
                    </SelectItem>
                  ) : (
                    targetColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id} className="hover:bg-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">{column.column_name}</span>
                          <span className="text-xs text-gray-500">
                            Type: {column.data_type}
                            {column.business_description && ` - ${column.business_description}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetType" className="text-sm font-medium">Target Type</Label>
              <Select value={formData.targetType} onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value }))}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
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
        <div className="space-y-2">
          <Label htmlFor="transformation" className="text-sm font-medium">Transformation</Label>
          <Textarea
            id="transformation"
            value={formData.transformation}
            onChange={(e) => setFormData(prev => ({ ...prev, transformation: e.target.value }))}
            placeholder="Enter transformation logic (optional)"
            rows={3}
            className="border-2 border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="joinClause" className="text-sm font-medium">Join Clause</Label>
          <Textarea
            id="joinClause"
            value={formData.joinClause}
            onChange={(e) => setFormData(prev => ({ ...prev, joinClause: e.target.value }))}
            placeholder="Enter join clause (optional)"
            rows={3}
            className="border-2 border-gray-300"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mapping
        </Button>
      </div>
    </div>
  );
};

export default MetadataDropdownForm;
