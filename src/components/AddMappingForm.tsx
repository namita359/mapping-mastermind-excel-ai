
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileWarning, Info } from "lucide-react";
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
import { MappingFile, MappingRow } from "@/lib/types";
import { generateUniqueId } from "@/lib/utils";

interface AddMappingFormProps {
  mappingFile: MappingFile;
  onAddMapping: (newRow: MappingRow) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Define a schema for form validation
const mappingSchema = z.object({
  sourceColumnName: z.string().min(1, "Source column name is required"),
  sourceColumnType: z.string().min(1, "Source data type is required"),
  sourceColumnDescription: z.string().optional(),
  targetColumnName: z.string().min(1, "Target column name is required"),
  targetColumnType: z.string().min(1, "Target data type is required"),
  targetColumnDescription: z.string().optional(),
  transformation: z.string().optional(),
  isPrimaryKey: z.boolean().default(false),
  isNullable: z.boolean().default(true),
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

  const form = useForm<MappingFormValues>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      sourceColumnName: "",
      sourceColumnType: "VARCHAR",
      sourceColumnDescription: "",
      targetColumnName: "",
      targetColumnType: "VARCHAR",
      targetColumnDescription: "",
      transformation: "",
      isPrimaryKey: false,
      isNullable: true,
    },
  });

  const checkDuplicateMapping = (data: MappingFormValues) => {
    return mappingFile.rows.some(
      (row) => 
        row.sourceColumn.name.toLowerCase() === data.sourceColumnName.toLowerCase() &&
        row.targetColumn.name.toLowerCase() === data.targetColumnName.toLowerCase()
    );
  };

  const onSubmit = (data: MappingFormValues) => {
    // Check for duplicate mapping
    if (checkDuplicateMapping(data)) {
      setIsDuplicate(true);
      return;
    }

    // Create new mapping row
    const newMapping: MappingRow = {
      id: generateUniqueId(),
      sourceColumn: {
        id: generateUniqueId(),
        name: data.sourceColumnName,
        dataType: data.sourceColumnType,
        description: data.sourceColumnDescription || undefined,
        isPrimaryKey: data.isPrimaryKey,
        isNullable: data.isNullable,
      },
      targetColumn: {
        id: generateUniqueId(),
        name: data.targetColumnName,
        dataType: data.targetColumnType,
        description: data.targetColumnDescription || undefined,
        isPrimaryKey: data.isPrimaryKey,
        isNullable: data.isNullable,
      },
      transformation: data.transformation || undefined,
      status: "pending",
      createdBy: "Current User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add new mapping
    onAddMapping(newMapping);

    // Reset form and close
    form.reset();
    setIsDuplicate(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Source-Target Mapping</DialogTitle>
          <DialogDescription>
            Create a new mapping between source and target columns.
          </DialogDescription>
        </DialogHeader>

        {isDuplicate && (
          <Alert className="bg-amber-50 border-amber-200 mb-4">
            <FileWarning className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Duplicate Mapping</AlertTitle>
            <AlertDescription className="text-amber-700">
              This source-target column mapping already exists. Please use a different combination.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source column fields */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">Source Column</h3>
                  
                  <FormField
                    control={form.control}
                    name="sourceColumnName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="customer_id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceColumnType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                  
                  <FormField
                    control={form.control}
                    name="sourceColumnDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the source column..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Target column fields */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-medium">Target Column</h3>
                  
                  <FormField
                    control={form.control}
                    name="targetColumnName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Column Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="user_id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetColumnType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type*</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                  
                  <FormField
                    control={form.control}
                    name="targetColumnDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the target column..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Transformation field */}
              <FormField
                control={form.control}
                name="transformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transformation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="CONCAT(first_name, ' ', last_name)" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-1">
                      <Info className="h-3 w-3" /> 
                      Enter SQL or transformation logic to convert source data to target format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-row items-center justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
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
