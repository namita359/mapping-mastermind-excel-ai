
import { MappingFile, MappingRow } from "./types";
import { parseCSVString, convertCSVToMappingData, parseExcelFile } from "./csvUtils";
import * as XLSX from 'xlsx';

export function createEmptyMappingFile(): MappingFile {
  return {
    id: `file-${Date.now()}`,
    name: "New Mapping",
    sourceSystem: "Source System",
    targetSystem: "Target System",
    rows: [],
    status: "draft",
    createdBy: "Current User",
    createdAt: new Date()
  };
}

export function parseCSVFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const csvData = event.target.result;
      const rows = parseCSVString(csvData);
      resolve(rows);
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

export async function loadSampleMappingData(): Promise<MappingFile | null> {
  try {
    // First try to load data.xlsx (user's preferred file)
    console.log("Attempting to load data.xlsx...");
    const dataResponse = await fetch('/data.xlsx');
    if (dataResponse.ok) {
      const excelArrayBuffer = await dataResponse.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(excelArrayBuffer), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to array of arrays
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      console.log("Data.xlsx loaded successfully:", excelData);
      
      // Validate that we have proper data structure
      if (excelData && excelData.length > 1 && excelData[0] && excelData[0].length > 0) {
        return processMapping(excelData, "Data.xlsx");
      }
    }
    
    // Fallback to sample Excel file
    console.log("Data.xlsx not available, trying sample Excel file...");
    const excelResponse = await fetch('/sample_mapping_template.xlsx');
    if (excelResponse.ok) {
      const excelArrayBuffer = await excelResponse.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(excelArrayBuffer), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to array of arrays
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      console.log("Sample Excel data loaded:", excelData);
      
      // Validate that we have proper data structure
      if (excelData && excelData.length > 1 && excelData[0] && excelData[0].length > 0) {
        return processMapping(excelData, "Sample Excel Data");
      }
    }
    
    // Final fallback to CSV
    console.log("Excel files not available, falling back to CSV");
    const csvResponse = await fetch('/sample_mapping_template.csv');
    if (!csvResponse.ok) {
      console.error('Failed to load any sample mapping data');
      return createSampleMappingData();
    }
    
    const csvText = await csvResponse.text();
    const csvData = parseCSVString(csvText);
    
    return processMapping(csvData, "Sample CSV Data");
  } catch (error) {
    console.error('Error loading sample data:', error);
    return createSampleMappingData();
  }
}

function processMapping(data: string[][], fileName: string): MappingFile | null {
  console.log("Processing mapping data:", data);
  
  // Filter out empty rows and comment rows
  const cleanData = data.filter(row => 
    row && 
    row.length > 0 && 
    row[0] && 
    typeof row[0] === 'string' && 
    !row[0].startsWith('//') && 
    row[0].trim() !== ''
  );
  
  console.log("Clean data after filtering:", cleanData);
  
  if (cleanData.length < 2) {
    console.warn('Insufficient data after cleaning, creating sample data');
    return createSampleMappingData();
  }
  
  const mappings = convertCSVToMappingData(cleanData);
  
  if (mappings.length === 0) {
    console.error('No valid mapping data found, creating sample data');
    return createSampleMappingData();
  }
  
  // Group by unique source-target system pairs
  const systems = mappings.reduce((acc, mapping) => {
    const key = `${mapping.sourceTable}-${mapping.targetTable}`;
    if (!acc[key]) {
      acc[key] = {
        source: mapping.sourceTable,
        target: mapping.targetTable
      };
    }
    return acc;
  }, {} as Record<string, {source: string, target: string}>);
  
  // Use the first pair as the default systems
  const systemPairs = Object.values(systems);
  const sourceSystem = systemPairs[0]?.source || "Source System";
  const targetSystem = systemPairs[0]?.target || "Target System";
  
  // Convert to MappingFile format with correct structure
  const mappingFile: MappingFile = {
    id: `file-${Date.now()}`,
    name: fileName,
    sourceSystem,
    targetSystem,
    rows: mappings.map((mapping, index) => ({
      id: `row-${Date.now()}-${index}`,
      sourceColumn: {
        id: `src-${Date.now()}-${index}`,
        malcode: mapping.malcode,
        table: mapping.sourceTable,
        column: mapping.sourceColumn,
        dataType: "VARCHAR",
        sourceType: "SRZ_ADLS" as const,
      },
      targetColumn: {
        id: `tgt-${Date.now()}-${index}`,
        malcode: mapping.malcode,
        table: mapping.targetTable,
        column: mapping.targetColumn,
        dataType: "VARCHAR",
        targetType: "CZ_ADLS" as const,
      },
      transformation: mapping.transformation,
      status: "pending" as const,
      createdBy: "Sample Data",
      createdAt: new Date(),
      comments: [`Pod: ${mapping.pod}`, `Malcode: ${mapping.malcode}`]
    })),
    status: "draft",
    createdBy: "Sample Data",
    createdAt: new Date()
  };
  
  console.log("Processed mapping data:", mappingFile);
  return mappingFile;
}

function createSampleMappingData(): MappingFile {
  // Create some sample data when no valid data is found
  const sampleMappings: MappingRow[] = [
    {
      id: "sample-1",
      sourceColumn: {
        id: "src-1",
        malcode: "CUST",
        table: "customers",
        column: "customer_id",
        dataType: "VARCHAR",
        sourceType: "SRZ_ADLS" as const,
      },
      targetColumn: {
        id: "tgt-1",
        malcode: "CUST",
        table: "dim_customer",
        column: "customer_key",
        dataType: "VARCHAR",
        targetType: "CZ_ADLS" as const,
      },
      transformation: "UPPER(customer_id)",
      status: "pending" as const,
      createdBy: "System",
      createdAt: new Date(),
      comments: ["Pod: Customer", "Malcode: CUST"]
    },
    {
      id: "sample-2",
      sourceColumn: {
        id: "src-2",
        malcode: "PROD",
        table: "products",
        column: "product_name",
        dataType: "VARCHAR",
        sourceType: "SRZ_ADLS" as const,
      },
      targetColumn: {
        id: "tgt-2",
        malcode: "PROD",
        table: "dim_product",
        column: "product_name",
        dataType: "VARCHAR",
        targetType: "SYNAPSE_TABLE" as const,
      },
      status: "approved" as const,
      createdBy: "System",
      createdAt: new Date(),
      comments: ["Pod: Product", "Malcode: PROD"]
    }
  ];

  return {
    id: `sample-${Date.now()}`,
    name: "Sample Mapping Data",
    sourceSystem: "SRZ (Raw Zone)",
    targetSystem: "CZ/Synapse (Target)",
    rows: sampleMappings,
    status: "draft",
    createdBy: "System",
    createdAt: new Date()
  };
}
