
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Database, Table, Columns } from 'lucide-react';
import { metadataService, MalcodeMetadata, TableMetadata, ColumnMetadata } from '@/lib/metadataService';

const MetadataManager = () => {
  const [malcodes, setMalcodes] = useState<MalcodeMetadata[]>([]);
  const [selectedMalcode, setSelectedMalcode] = useState<string>('');
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Form states
  const [newMalcode, setNewMalcode] = useState({ malcode: '', description: '' });
  const [newTable, setNewTable] = useState({ name: '', description: '' });
  const [newColumn, setNewColumn] = useState({
    name: '',
    dataType: 'string',
    description: '',
    isPrimaryKey: false,
    isNullable: true,
    defaultValue: ''
  });

  useEffect(() => {
    loadMalcodes();
  }, []);

  useEffect(() => {
    if (selectedMalcode) {
      loadTables(selectedMalcode);
    }
  }, [selectedMalcode]);

  useEffect(() => {
    if (selectedTable) {
      loadColumns(selectedTable);
    }
  }, [selectedTable]);

  const loadMalcodes = async () => {
    try {
      const data = await metadataService.getAllMalcodes();
      setMalcodes(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load malcodes",
        variant: "destructive"
      });
    }
  };

  const loadTables = async (malcodeId: string) => {
    try {
      const data = await metadataService.getTablesByMalcode(malcodeId);
      setTables(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tables",
        variant: "destructive"
      });
    }
  };

  const loadColumns = async (tableId: string) => {
    try {
      const data = await metadataService.getColumnsByTable(tableId);
      setColumns(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load columns",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const results = await metadataService.searchMetadata(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive"
      });
    }
  };

  const createMalcode = async () => {
    if (!newMalcode.malcode || !newMalcode.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await metadataService.createMalcodeMetadata(
        newMalcode.malcode,
        newMalcode.description,
        'current_user' // In a real app, get from auth context
      );
      
      setNewMalcode({ malcode: '', description: '' });
      loadMalcodes();
      
      toast({
        title: "Success",
        description: "Malcode created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create malcode",
        variant: "destructive"
      });
    }
  };

  const createTable = async () => {
    if (!selectedMalcode || !newTable.name || !newTable.description) {
      toast({
        title: "Error",
        description: "Please select a malcode and fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await metadataService.createTableMetadata(
        selectedMalcode,
        newTable.name,
        newTable.description,
        'current_user'
      );
      
      setNewTable({ name: '', description: '' });
      loadTables(selectedMalcode);
      
      toast({
        title: "Success",
        description: "Table created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create table",
        variant: "destructive"
      });
    }
  };

  const createColumn = async () => {
    if (!selectedTable || !newColumn.name || !newColumn.description) {
      toast({
        title: "Error",
        description: "Please select a table and fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await metadataService.createColumnMetadata(selectedTable, {
        column_name: newColumn.name,
        data_type: newColumn.dataType,
        business_description: newColumn.description,
        is_primary_key: newColumn.isPrimaryKey,
        is_nullable: newColumn.isNullable,
        default_value: newColumn.defaultValue || undefined,
        created_by: 'current_user'
      });
      
      setNewColumn({
        name: '',
        dataType: 'string',
        description: '',
        isPrimaryKey: false,
        isNullable: true,
        defaultValue: ''
      });
      loadColumns(selectedTable);
      
      toast({
        title: "Success",
        description: "Column created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create column",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Metadata Management</h1>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search Metadata</TabsTrigger>
          <TabsTrigger value="manage">Manage Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Business Metadata
              </CardTitle>
              <CardDescription>
                Search for business descriptions and metadata across malcodes, tables, and columns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for business terms, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Search Results:</h3>
                  {searchResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.malcode}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {result.table_name}.{result.column_name}
                            </span>
                            {result.data_type && (
                              <Badge variant="secondary">{result.data_type}</Badge>
                            )}
                          </div>
                          {result.business_description && (
                            <p className="text-sm mt-1">{result.business_description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-6">
            {/* Malcode Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Manage Malcodes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Malcode"
                    value={newMalcode.malcode}
                    onChange={(e) => setNewMalcode({ ...newMalcode, malcode: e.target.value })}
                  />
                  <Input
                    placeholder="Business Description"
                    value={newMalcode.description}
                    onChange={(e) => setNewMalcode({ ...newMalcode, description: e.target.value })}
                  />
                  <Button onClick={createMalcode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Malcode
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Existing Malcodes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {malcodes.map((malcode) => (
                      <Badge
                        key={malcode.id}
                        variant={selectedMalcode === malcode.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedMalcode(malcode.id)}
                      >
                        {malcode.malcode}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  Manage Tables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Table Name"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    disabled={!selectedMalcode}
                  />
                  <Input
                    placeholder="Business Description"
                    value={newTable.description}
                    onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                    disabled={!selectedMalcode}
                  />
                  <Button onClick={createTable} disabled={!selectedMalcode}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Table
                  </Button>
                </div>

                {tables.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Tables for selected malcode:</h4>
                    <div className="flex flex-wrap gap-2">
                      {tables.map((table) => (
                        <Badge
                          key={table.id}
                          variant={selectedTable === table.id ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedTable(table.id)}
                        >
                          {table.table_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Columns className="h-5 w-5" />
                  Manage Columns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    placeholder="Column Name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    disabled={!selectedTable}
                  />
                  <Select
                    value={newColumn.dataType}
                    onValueChange={(value) => setNewColumn({ ...newColumn, dataType: value })}
                    disabled={!selectedTable}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Data Type" />
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
                  <Textarea
                    placeholder="Business Description"
                    value={newColumn.description}
                    onChange={(e) => setNewColumn({ ...newColumn, description: e.target.value })}
                    disabled={!selectedTable}
                    className="min-h-[40px]"
                  />
                  <Button onClick={createColumn} disabled={!selectedTable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>

                {columns.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Columns for selected table:</h4>
                    <div className="grid gap-2">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{column.column_name}</span>
                            <Badge variant="secondary" className="ml-2">{column.data_type}</Badge>
                            {column.business_description && (
                              <p className="text-sm text-muted-foreground mt-1">{column.business_description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetadataManager;
