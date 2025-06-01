
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileWarning, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MappingFile, MappingRow, SourceType, TargetType } from "@/lib/types";
import { generateUniqueId } from "@/lib/utils";
import { useMetadataDropdowns } from "@/hooks/useMetadataDropdowns";

interface AddMappingFormProps {
  mappingFile: MappingFile;
  onAddMapping: (newRow: MappingRow) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mappingSchema = z.object({
  sourceMalcodeId: z.string().min(1, "Source malcode is required"),
  sourceTableId: z.string().min(1, "Source table is required"),
  sourceColumnId: z.string().min(1, "Source column is required"),
  targetMalcodeId: z.string().min(1, "Target malcode is required"),
  targetTableId: z.string().min(1, "Target table is required"),
  targetColumnId: z.string().min(1, "Target column is required"),
  targetType: z.enum(["CZ_ADLS", "SYNAPSE_TABLE"]),
  transformation: z.string().optional(),
  join: z.string().optional(),
});

type MappingFormValues = z.infer<typeof mappingSchema>;

export function AddMappingForm({ mappingFile, onAddMapping, isOpen, onClose }: AddMappingFormProps) {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingMapping, setExistingMapping] = useState<MappingRow | null>(null);
  const [showBusinessMetadata, setShowBusinessMetadata] = useState(false);

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
  } = useMetadataDropdowns();

  const form = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      sourceMalcodeId: "",
      sourceTableId: "",
      sourceColumnId: "",
      targetMalcodeId: "",
      targetTableId: "",
      targetColumnId: "",
      targetType: "CZ_ADLS",
      transformation: "",
      join: "",
    },
  });

  const checkDuplicateMapping = (data: MappingFormValues): MappingRow | null => {
    const sourceMalcode = getMalcodeById(data.sourceMalcodeId);
    const sourceTable = getTableById(data.sourceTableId, true);
    const sourceColumn = getColumnById(data.sourceColumnId, true);
    const targetMalcode = getMalcodeById(data.targetMalcodeId);
    const targetTable = getTableById(data.targetTableId, false);
    const targetColumn = getColumnById(data.targetColumnId, false);

    if (!sourceMalcode || !sourceTable || !sourceColumn || !targetMalcode || !targetTable || !targetColumn) {
      return null;
    }

    return mappingFile.rows.find(
      (row) => 
        row.sourceColumn.malcode.toLowerCase() === sourceMalcode.malcode.toLowerCase() &&
        row.sourceColumn.table.toLowerCase() === sourceTable.table_name.toLowerCase() &&
        row.sourceColumn.column.toLowerCase() === sourceColumn.column_name.toLowerCase() &&
        row.targetColumn.malcode.toLowerCase() === targetMalcode.malcode.toLowerCase() &&
        row.targetColumn.table.toLowerCase() === targetTable.table_name.toLowerCase() &&
        row.targetColumn.column.toLowerCase() === targetColumn.column_name.toLowerCase()
    ) || null;
  };

  const handleSourceMalcodeChange = (malcodeId: string) => {
    form.setValue("sourceMalcodeId", malcodeId);
    form.setValue("sourceTableId", "");
    form.setValue("sourceColumnId", "");
    loadTablesForMalcode(malcodeId, true);
  };

  const handleTargetMalcodeChange = (malcodeId: string) => {
    form.setValue("targetMalcodeId", malcodeId);
    form.setValue("targetTableId", "");
    form.setValue("targetColumnId", "");
    loadTablesForMalcode(malcodeId, false);
  };

  const handleSourceTableChange = (tableId: string) => {
    form.setValue("sourceTableId", tableId);
    form.setValue("sourceColumnId", "");
    loadColumnsForTable(tableId, true);
  };

  const handleTargetTableChange = (tableId: string) => {
    form.setValue("targetTableId", tableId);
    form.setValue("targetColumnId", "");
    loadColumnsForTable(tableId, false);
  };

  const onSubmit = (data: MappingFormValues) => {
    const duplicate = checkDuplicateMapping(data);
    if (duplicate) {
      setIsDuplicate(true);
      setExistingMapping(duplicate);
      return;
    }

    const sourceMalcode = getMalcodeById(data.sourceMalcodeId);
    const sourceTable = getTableById(data.sourceTableId, true);
    const sourceColumn = getColumnById(data.sourceColumnId, true);
    const targetMalcode = getMalcodeById(data.targetMalcodeId);
    const targetTable = getTableById(data.targetTableId, false);
    const targetColumn = getColumnById(data.targetColumnId, false);

    if (!sourceMalcode || !sourceTable || !sourceColumn || !targetMalcode || !targetTable || !targetColumn) {
      return;
    }

    const newMapping: MappingRow = {
      id: generateUniqueId(),
      sourceColumn: {
        id: generateUniqueId(),
        malcode: sourceMalcode.malcode,
        table: sourceTable.table_name,
        column: sourceColumn.column_name,
        dataType: sourceColumn.data_type || "VARCHAR",
        sourceType: "SRZ_ADLS" as SourceType,
        businessMetadata: {
          malcodeDescription: sourceMalcode.business_description,
          tableDescription: sourceTable.business_description,
          columnDescription: sourceColumn.business_description,
        },
        isPrimaryKey: sourceColumn.is_primary_key || false,
        isNullable: sourceColumn.is_nullable || true,
      },
      targetColumn: {
        id: generateUniqueId(),
        malcode: targetMalcode.malcode,
        table: targetTable.table_name,
        column: targetColumn.column_name,
        dataType: targetColumn.data_type || "VARCHAR",
        targetType: data.targetType,
        businessMetadata: {
          malcodeDescription: targetMalcode.business_description,
          tableDescription: targetTable.business_description,
          columnDescription: targetColumn.business_description,
        },
        isPrimaryKey: targetColumn.is_primary_key || false,
        isNullable: targetColumn.is_nullable || true,
      },
      transformation: data.transformation || undefined,
      join: data.join || undefined,
      status: "pending",
      createdBy: "Current User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAddMapping(newMapping);
    form.reset();
    setIsDuplicate(false);
    setExistingMapping(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Source-Target Mapping</DialogTitle>
          <DialogDescription>
            Create a new mapping between source (SRZ ADLS) and target (CZ ADLS or Synapse Table) columns using metadata catalog.
          </DialogDescription>
        </DialogHeader>

        {isDuplicate && existingMapping && (
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <FileWarning className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Duplicate Mapping Found</AlertTitle>
            <AlertDescription className="text-amber-700">
              <div className="mt-2">
                <p>This mapping already exists:</p>
                <div className="mt-2 p-2 bg-white rounded border text-sm">
                  <p><strong>Source:</strong> {existingMapping.sourceColumn.malcode}.{existingMapping.sourceColumn.table}.{existingMapping.sourceColumn.column}</p>
                  <p><strong>Target:</strong> {existingMapping.targetColumn.malcode}.{existingMapping.targetColumn.table}.{existingMapping.targetColumn.column}</p>
                  <p><strong>Status:</strong> {existingMapping.status}</p>
                  <p><strong>Created:</strong> {existingMapping.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBusinessMetadata(!showBusinessMetadata)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {showBusinessMetadata ? "Hide" : "Show"} Business Metadata
          </Button>
        </div>

        <div className="grid gap-4 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source column fields */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800">Source (SRZ ADLS - Raw Zone)</h3>
                  
                  <FormField
                    control={form.control}
                    name="sourceMalcodeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malcode*</FormLabel>
                        <Select 
                          onValueChange={handleSourceMalcodeChange} 
                          value={field.value}
                          disabled={loading || !malcodes || malcodes.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                loading ? "Loading..." : 
                                !malcodes || malcodes.length === 0 ? "No malcodes available" : 
                                "Select source malcode"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {malcodes && malcodes.length > 0 ? (
                              malcodes.map((malcode) => (
                                <SelectItem key={malcode.id} value={malcode.id}>
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
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No malcodes found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceTableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table*</FormLabel>
                        <Select 
                          onValueChange={handleSourceTableChange} 
                          value={field.value}
                          disabled={!form.watch("sourceMalcodeId") || sourceTables.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                !form.watch("sourceMalcodeId") ? "Select malcode first" : 
                                sourceTables.length === 0 ? "No tables available" : 
                                "Select source table"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {sourceTables.length > 0 ? (
                              sourceTables.map((table) => (
                                <SelectItem key={table.id} value={table.id}>
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
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No tables found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceColumnId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!form.watch("sourceTableId") || sourceColumns.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                !form.watch("sourceTableId") ? "Select table first" : 
                                sourceColumns.length === 0 ? "No columns available" : 
                                "Select source column"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {sourceColumns.length > 0 ? (
                              sourceColumns.map((column) => (
                                <SelectItem key={column.id} value={column.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{column.column_name}</span>
                                    <span className="text-xs text-gray-500">
                                      Type: {column.data_type}
                                      {column.business_description && ` - ${column.business_description}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No columns found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showBusinessMetadata && (
                    <div className="space-y-3 p-3 bg-blue-50 rounded">
                      <h4 className="font-medium text-sm">Business Metadata</h4>
                      {form.watch("sourceColumnId") && (
                        <div className="text-sm space-y-2">
                          {(() => {
                            const sourceColumn = getColumnById(form.watch("sourceColumnId"), true);
                            const sourceTable = getTableById(form.watch("sourceTableId"), true);
                            const sourceMalcode = getMalcodeById(form.watch("sourceMalcodeId"));
                            
                            return (
                              <>
                                {sourceMalcode?.business_description && (
                                  <div>
                                    <strong>Malcode:</strong> {sourceMalcode.business_description}
                                  </div>
                                )}
                                {sourceTable?.business_description && (
                                  <div>
                                    <strong>Table:</strong> {sourceTable.business_description}
                                  </div>
                                )}
                                {sourceColumn?.business_description && (
                                  <div>
                                    <strong>Column:</strong> {sourceColumn.business_description}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Target column fields */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium text-green-800">Target (CZ ADLS / Synapse)</h3>
                  
                  <FormField
                    control={form.control}
                    name="targetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Type*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder="Select target type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100]">
                            <SelectItem value="CZ_ADLS">CZ ADLS (Curated Zone)</SelectItem>
                            <SelectItem value="SYNAPSE_TABLE">Synapse Table</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetMalcodeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malcode*</FormLabel>
                        <Select 
                          onValueChange={handleTargetMalcodeChange} 
                          value={field.value}
                          disabled={loading || !malcodes || malcodes.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                loading ? "Loading..." : 
                                !malcodes || malcodes.length === 0 ? "No malcodes available" : 
                                "Select target malcode"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {malcodes && malcodes.length > 0 ? (
                              malcodes.map((malcode) => (
                                <SelectItem key={malcode.id} value={malcode.id}>
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
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No malcodes found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetTableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table*</FormLabel>
                        <Select 
                          onValueChange={handleTargetTableChange} 
                          value={field.value}
                          disabled={!form.watch("targetMalcodeId") || targetTables.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                !form.watch("targetMalcodeId") ? "Select malcode first" : 
                                targetTables.length === 0 ? "No tables available" : 
                                "Select target table"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {targetTables.length > 0 ? (
                              targetTables.map((table) => (
                                <SelectItem key={table.id} value={table.id}>
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
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No tables found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetColumnId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!form.watch("targetTableId") || targetColumns.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white border-2 border-gray-300">
                              <SelectValue placeholder={
                                !form.watch("targetTableId") ? "Select table first" : 
                                targetColumns.length === 0 ? "No columns available" : 
                                "Select target column"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border shadow-lg z-[100] max-h-60">
                            {targetColumns.length > 0 ? (
                              targetColumns.map((column) => (
                                <SelectItem key={column.id} value={column.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{column.column_name}</span>
                                    <span className="text-xs text-gray-500">
                                      Type: {column.data_type}
                                      {column.business_description && ` - ${column.business_description}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                No columns found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showBusinessMetadata && (
                    <div className="space-y-3 p-3 bg-green-50 rounded">
                      <h4 className="font-medium text-sm">Business Metadata</h4>
                      {form.watch("targetColumnId") && (
                        <div className="text-sm space-y-2">
                          {(() => {
                            const targetColumn = getColumnById(form.watch("targetColumnId"), false);
                            const targetTable = getTableById(form.watch("targetTableId"), false);
                            const targetMalcode = getMalcodeById(form.watch("targetMalcodeId"));
                            
                            return (
                              <>
                                {targetMalcode?.business_description && (
                                  <div>
                                    <strong>Malcode:</strong> {targetMalcode.business_description}
                                  </div>
                                )}
                                {targetTable?.business_description && (
                                  <div>
                                    <strong>Table:</strong> {targetTable.business_description}
                                  </div>
                                )}
                                {targetColumn?.business_description && (
                                  <div>
                                    <strong>Column:</strong> {targetColumn.business_description}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Transformation and Join fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transformation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transformation Logic</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="UPPER(TRIM(source_column))" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-1">
                        <Info className="h-3 w-3" /> 
                        SQL transformation logic to convert source to target format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="join"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Join Condition</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="source_table.id = lookup_table.source_id" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-1">
                        <Info className="h-3 w-3" /> 
                        Join conditions if additional tables are needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row items-center justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isDuplicate || loading}>
                  <Check className="mr-2 h-4 w-4" /> Add Mapping
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddMappingForm;
