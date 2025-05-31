import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Database } from 'lucide-react';
import { MappingRow } from '@/lib/types';
import MetadataSearch from './MetadataSearch';
import MetadataDropdownForm from './MetadataDropdownForm';
import { MetadataSearchResult } from '@/lib/metadataService';

interface EnhancedAddMappingFormProps {
  onAddMapping: (mapping: MappingRow) => void;
  onClose: () => void;
}

const EnhancedAddMappingForm = ({ onAddMapping, onClose }: EnhancedAddMappingFormProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dropdowns');

  console.log('EnhancedAddMappingForm - Rendering with activeTab:', activeTab);

  // Manual form state
  const [formData, setFormData] = useState({
    sourceMalcode: '',
    sourceTable: '',
    sourceColumn: '',
    sourceDataType: 'string',
    targetMalcode: '',
    targetTable: '',
    targetColumn: '',
    targetDataType: 'string',
    transformation: '',
    joinClause: '',
    sourceType: 'SRZ_ADLS',
    targetType: 'CZ_ADLS'
  });

  // Metadata search state
  const [sourceMetadata, setSourceMetadata] = useState<MetadataSearchResult | null>(null);
  const [targetMetadata, setTargetMetadata] = useState<MetadataSearchResult | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSourceMetadataSelect = (metadata: MetadataSearchResult) => {
    setSourceMetadata(metadata);
    setFormData(prev => ({
      ...prev,
      sourceMalcode: metadata.malcode,
      sourceTable: metadata.table_name,
      sourceColumn: metadata.column_name,
      sourceDataType: metadata.data_type || 'string'
    }));
    
    toast({
      title: "Source metadata selected",
      description: `${metadata.malcode}.${metadata.table_name}.${metadata.column_name}`,
    });
  };

  const handleTargetMetadataSelect = (metadata: MetadataSearchResult) => {
    setTargetMetadata(metadata);
    setFormData(prev => ({
      ...prev,
      targetMalcode: metadata.malcode,
      targetTable: metadata.table_name,
      targetColumn: metadata.column_name,
      targetDataType: metadata.data_type || 'string'
    }));
    
    toast({
      title: "Target metadata selected",
      description: `${metadata.malcode}.${metadata.table_name}.${metadata.column_name}`,
    });
  };

  const handleManualSubmit = () => {
    // Validate required fields
    const requiredFields = [
      'sourceMalcode', 'sourceTable', 'sourceColumn',
      'targetMalcode', 'targetTable', 'targetColumn'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all source and target column information",
        variant: "destructive"
      });
      return;
    }

    const newMapping: MappingRow = {
      id: `mapping-${Date.now()}`,
      sourceColumn: {
        id: `source-${Date.now()}`,
        malcode: formData.sourceMalcode,
        table: formData.sourceTable,
        column: formData.sourceColumn,
        dataType: formData.sourceDataType,
        sourceType: formData.sourceType as 'SRZ_ADLS'
      },
      targetColumn: {
        id: `target-${Date.now()}`,
        malcode: formData.targetMalcode,
        table: formData.targetTable,
        column: formData.targetColumn,
        dataType: formData.targetDataType,
        targetType: formData.targetType as 'CZ_ADLS' | 'SYNAPSE_TABLE'
      },
      transformation: formData.transformation || undefined,
      join: formData.joinClause || undefined,
      status: 'draft',
      createdBy: 'User',
      createdAt: new Date(),
      comments: []
    };

    console.log('EnhancedAddMappingForm - Manual submission:', newMapping);
    onAddMapping(newMapping);
    onClose();
  };

  const handleMappingAdd = (mapping: MappingRow) => {
    console.log('EnhancedAddMappingForm - Received mapping from dropdown form:', mapping);
    onAddMapping(mapping);
  };

  return (
    <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Mapping
        </CardTitle>
        <CardDescription>
          Create a new data mapping using metadata dropdowns, search, or manual entry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dropdowns" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Metadata Dropdowns
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="dropdowns" className="space-y-4">
            <MetadataDropdownForm onAddMapping={handleMappingAdd} onClose={onClose} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Metadata Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Source Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetadataSearch
                    onSelectMetadata={handleSourceMetadataSelect}
                    placeholder="Search for source column metadata..."
                  />
                  {sourceMetadata && (
                    <Card className="mt-4 bg-green-50 border-green-200">
                      <CardContent className="p-3">
                        <div className="text-sm">
                          <strong>Selected:</strong> {sourceMetadata.malcode}.{sourceMetadata.table_name}.{sourceMetadata.column_name}
                          {sourceMetadata.business_description && (
                            <p className="text-muted-foreground mt-1">{sourceMetadata.business_description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Target Metadata Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Target Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MetadataSearch
                    onSelectMetadata={handleTargetMetadataSelect}
                    placeholder="Search for target column metadata..."
                  />
                  {targetMetadata && (
                    <Card className="mt-4 bg-blue-50 border-blue-200">
                      <CardContent className="p-3">
                        <div className="text-sm">
                          <strong>Selected:</strong> {targetMetadata.malcode}.{targetMetadata.table_name}.{targetMetadata.column_name}
                          {targetMetadata.business_description && (
                            <p className="text-muted-foreground mt-1">{targetMetadata.business_description}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Transformation and Join for metadata mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transformationMeta">Transformation</Label>
                <Textarea
                  id="transformationMeta"
                  value={formData.transformation}
                  onChange={(e) => handleInputChange('transformation', e.target.value)}
                  placeholder="Enter transformation logic (optional)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="joinClauseMeta">Join Clause</Label>
                <Textarea
                  id="joinClauseMeta"
                  value={formData.joinClause}
                  onChange={(e) => handleInputChange('joinClause', e.target.value)}
                  placeholder="Enter join clause (optional)"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Source Column</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sourceMalcode">Malcode</Label>
                    <Input
                      id="sourceMalcode"
                      value={formData.sourceMalcode}
                      onChange={(e) => handleInputChange('sourceMalcode', e.target.value)}
                      placeholder="Enter source malcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceTable">Table</Label>
                    <Input
                      id="sourceTable"
                      value={formData.sourceTable}
                      onChange={(e) => handleInputChange('sourceTable', e.target.value)}
                      placeholder="Enter source table name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceColumn">Column</Label>
                    <Input
                      id="sourceColumn"
                      value={formData.sourceColumn}
                      onChange={(e) => handleInputChange('sourceColumn', e.target.value)}
                      placeholder="Enter source column name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceDataType">Data Type</Label>
                    <Select value={formData.sourceDataType} onValueChange={(value) => handleInputChange('sourceDataType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="decimal">Decimal</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="datetime">DateTime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sourceType">Source Type</Label>
                    <Select value={formData.sourceType} onValueChange={(value) => handleInputChange('sourceType', value)}>
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
                    <Input
                      id="targetMalcode"
                      value={formData.targetMalcode}
                      onChange={(e) => handleInputChange('targetMalcode', e.target.value)}
                      placeholder="Enter target malcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetTable">Table</Label>
                    <Input
                      id="targetTable"
                      value={formData.targetTable}
                      onChange={(e) => handleInputChange('targetTable', e.target.value)}
                      placeholder="Enter target table name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetColumn">Column</Label>
                    <Input
                      id="targetColumn"
                      value={formData.targetColumn}
                      onChange={(e) => handleInputChange('targetColumn', e.target.value)}
                      placeholder="Enter target column name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetDataType">Data Type</Label>
                    <Select value={formData.targetDataType} onValueChange={(value) => handleInputChange('targetDataType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="integer">Integer</SelectItem>
                        <SelectItem value="decimal">Decimal</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="datetime">DateTime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetType">Target Type</Label>
                    <Select value={formData.targetType} onValueChange={(value) => handleInputChange('targetType', value)}>
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
                  onChange={(e) => handleInputChange('transformation', e.target.value)}
                  placeholder="Enter transformation logic (optional)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="joinClause">Join Clause</Label>
                <Textarea
                  id="joinClause"
                  value={formData.joinClause}
                  onChange={(e) => handleInputChange('joinClause', e.target.value)}
                  placeholder="Enter join clause (optional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions for manual mode only */}
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleManualSubmit}>
                Add Mapping
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAddMappingForm;
