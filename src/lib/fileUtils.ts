
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
    // Try to load the sample Excel file first
    const excelResponse = await fetch('/sample_mapping_template.xlsx');
    if (excelResponse.ok) {
      const excelArrayBuffer = await excelResponse.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(excelArrayBuffer), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to array of arrays
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      console.log("Excel data loaded successfully:", excelData);
      return processMapping(excelData);
    }
    
    // Fallback to CSV if Excel is not available
    console.log("Excel file not available, falling back to CSV");
    const csvResponse = await fetch('/sample_mapping_template.csv');
    if (!csvResponse.ok) {
      console.error('Failed to load sample mapping data');
      return null;
    }
    
    const csvText = await csvResponse.text();
    const csvData = parseCSVString(csvText);
    
    return processMapping(csvData);
  } catch (error) {
    console.error('Error loading sample data:', error);
    return null;
  }
}

function processMapping(data: string[][]): MappingFile | null {
  const mappings = convertCSVToMappingData(data);
  
  if (mappings.length === 0) {
    console.error('No valid mapping data found in the sample file');
    return null;
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
    name: "Sample Mapping Data",
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
