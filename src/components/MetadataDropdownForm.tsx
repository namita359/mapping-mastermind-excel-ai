import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
    error,
    loadTablesForMalcode,
    loadColumnsForTable,
    getMalcodeById,
    getTableById,
    getColumnById,
    refreshMalcodes,
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

  // Debug logging
  console.log('MetadataDropdownForm - Debug Info:', {
    malcodesCount: malcodes?.length || 0,
    malcodes: malcodes,
    loading,
    error,
    formData
  });

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
    console.log('MetadataDropdownForm - handleSubmit called with:', formData);
    
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
      console.error('MetadataDropdownForm - Missing metadata objects:', {
        sourceMalcode, sourceTable, sourceColumn, targetMalcode, targetTable, targetColumn
      });
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

    console.log('MetadataDropdownForm - Creating new mapping:', newMapping);
    onAddMapping(newMapping);
    onClose();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading metadata...</span>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={refreshMalcodes} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Always show the form, even if no malcodes (with helpful message)
  return (
    <div className="space-y-6 p-4">
      {(!malcodes || malcodes.length === 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">No Malcodes Available</h3>
              <p className="text-sm text-orange-700 mt-1">
                Please add metadata using the Metadata Management page first, or check your database connection.
              </p>
              <Button onClick={refreshMalcodes} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Column */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg">Source Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sourceMalcode" className="text-sm font-medium">
                Malcode <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.sourceMalcodeId} 
                onValueChange={handleSourceMalcodeChange}
                disabled={!malcodes || malcodes.length === 0}
              >
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100">
                  <SelectValue placeholder={
                    !malcodes || malcodes.length === 0 
                      ? "No malcodes available" 
                      : "Select source malcode"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                  {!malcodes || malcodes.length === 0 ? (
                    <SelectItem value="no-data" disabled>
                      No malcodes found - please add metadata first
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

            {/* Debug info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Debug: {malcodes?.length || 0} malcodes loaded
              {malcodes && malcodes.length > 0 && (
                <div>Available: {malcodes.map(m => m.malcode).join(', ')}</div>
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.sourceMalcodeId ? "Select malcode first" : 
                    sourceTables.length === 0 ? "No tables available" : 
                    "Select source table"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.sourceTableId ? "Select table first" : 
                    sourceColumns.length === 0 ? "No columns available" : 
                    "Select source column"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100]">
                  <SelectItem value="SRZ_ADLS">SRZ_ADLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Target Column */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">Target Column</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="targetMalcode" className="text-sm font-medium">
                Malcode <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.targetMalcodeId} 
                onValueChange={handleTargetMalcodeChange}
              >
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500">
                  <SelectValue placeholder="Select target malcode" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                  {malcodes.map((malcode) => (
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
                  ))}
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.targetMalcodeId ? "Select malcode first" : 
                    targetTables.length === 0 ? "No tables available" : 
                    "Select target table"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 disabled:opacity-50">
                  <SelectValue placeholder={
                    !formData.targetTableId ? "Select table first" : 
                    targetColumns.length === 0 ? "No columns available" : 
                    "Select target column"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
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
                <SelectTrigger className="w-full bg-white border-2 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-[100]">
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
        <Button onClick={handleSubmit}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mapping
        </Button>
      </div>
    </div>
  );
};

export default MetadataDropdownForm;
