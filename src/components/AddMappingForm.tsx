
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

interface AddMappingFormProps {
  mappingFile: MappingFile;
  onAddMapping: (newRow: MappingRow) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mappingSchema = z.object({
  sourceMalcode: z.string().min(1, "Source malcode is required"),
  sourceTable: z.string().min(1, "Source table is required"),
  sourceColumn: z.string().min(1, "Source column is required"),
  sourceDataType: z.string().min(1, "Source data type is required"),
  sourceMalcodeDescription: z.string().optional(),
  sourceTableDescription: z.string().optional(),
  sourceColumnDescription: z.string().optional(),
  targetMalcode: z.string().min(1, "Target malcode is required"),
  targetTable: z.string().min(1, "Target table is required"),
  targetColumn: z.string().min(1, "Target column is required"),
  targetDataType: z.string().min(1, "Target data type is required"),
  targetType: z.enum(["CZ_ADLS", "SYNAPSE_TABLE"]),
  targetMalcodeDescription: z.string().optional(),
  targetTableDescription: z.string().optional(),
  targetColumnDescription: z.string().optional(),
  transformation: z.string().optional(),
  join: z.string().optional(),
});

type MappingFormValues = z.infer<typeof mappingSchema>;

const dataTypes = [
  "VARCHAR", "CHAR", "TEXT",
  "INTEGER", "BIGINT", "SMALLINT", 
  "DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", 
  "DATE", "TIMESTAMP", "TIME",
  "BOOLEAN", "BINARY", "BLOB",
  "JSON", "XML", "UUID"
];

export function AddMappingForm({ mappingFile, onAddMapping, isOpen, onClose }: AddMappingFormProps) {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingMapping, setExistingMapping] = useState<MappingRow | null>(null);
  const [showBusinessMetadata, setShowBusinessMetadata] = useState(false);

  const form = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      sourceMalcode: "",
      sourceTable: "",
      sourceColumn: "",
      sourceDataType: "VARCHAR",
      sourceMalcodeDescription: "",
      sourceTableDescription: "",
      sourceColumnDescription: "",
      targetMalcode: "",
      targetTable: "",
      targetColumn: "",
      targetDataType: "VARCHAR",
      targetType: "CZ_ADLS",
      targetMalcodeDescription: "",
      targetTableDescription: "",
      targetColumnDescription: "",
      transformation: "",
      join: "",
    },
  });

  const checkDuplicateMapping = (data: MappingFormValues): MappingRow | null => {
    return mappingFile.rows.find(
      (row) => 
        row.sourceColumn.malcode.toLowerCase() === data.sourceMalcode.toLowerCase() &&
        row.sourceColumn.table.toLowerCase() === data.sourceTable.toLowerCase() &&
        row.sourceColumn.column.toLowerCase() === data.sourceColumn.toLowerCase() &&
        row.targetColumn.malcode.toLowerCase() === data.targetMalcode.toLowerCase() &&
        row.targetColumn.table.toLowerCase() === data.targetTable.toLowerCase() &&
        row.targetColumn.column.toLowerCase() === data.targetColumn.toLowerCase()
    ) || null;
  };

  const onSubmit = (data: MappingFormValues) => {
    const duplicate = checkDuplicateMapping(data);
    if (duplicate) {
      setIsDuplicate(true);
      setExistingMapping(duplicate);
      return;
    }

    const newMapping: MappingRow = {
      id: generateUniqueId(),
      sourceColumn: {
        id: generateUniqueId(),
        malcode: data.sourceMalcode,
        table: data.sourceTable,
        column: data.sourceColumn,
        dataType: data.sourceDataType,
        sourceType: "SRZ_ADLS" as SourceType,
        businessMetadata: {
          malcodeDescription: data.sourceMalcodeDescription || undefined,
          tableDescription: data.sourceTableDescription || undefined,
          columnDescription: data.sourceColumnDescription || undefined,
        },
        isPrimaryKey: false,
        isNullable: true,
      },
      targetColumn: {
        id: generateUniqueId(),
        malcode: data.targetMalcode,
        table: data.targetTable,
        column: data.targetColumn,
        dataType: data.targetDataType,
        targetType: data.targetType,
        businessMetadata: {
          malcodeDescription: data.targetMalcodeDescription || undefined,
          tableDescription: data.targetTableDescription || undefined,
          columnDescription: data.targetColumnDescription || undefined,
        },
        isPrimaryKey: false,
        isNullable: true,
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
            Create a new mapping between source (SRZ ADLS) and target (CZ ADLS or Synapse Table) columns.
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
                    name="sourceMalcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malcode*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CRM_001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceTable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., customers" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceColumn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., customer_id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceDataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showBusinessMetadata && (
                    <div className="space-y-3 p-3 bg-blue-50 rounded">
                      <h4 className="font-medium text-sm">Business Metadata</h4>
                      
                      <FormField
                        control={form.control}
                        name="sourceMalcodeDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Malcode Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the malcode..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sourceTableDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the table..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sourceColumnDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Column Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the column..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            <SelectTrigger>
                              <SelectValue placeholder="Select target type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                    name="targetMalcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malcode*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., DW_001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetTable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., dim_customer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetColumn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., customer_key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetDataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dataTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {showBusinessMetadata && (
                    <div className="space-y-3 p-3 bg-green-50 rounded">
                      <h4 className="font-medium text-sm">Business Metadata</h4>
                      
                      <FormField
                        control={form.control}
                        name="targetMalcodeDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Malcode Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the malcode..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetTableDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the table..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetColumnDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Column Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Business description of the column..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                <Button type="submit" disabled={isDuplicate}>
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
