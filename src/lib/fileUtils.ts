
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
    // First, try to load the sample CSV since we know it exists
    const csvResponse = await fetch('/sample_mapping_template.csv');
    if (!csvResponse.ok) {
      console.error('Failed to load sample CSV mapping data');
      return null;
    }
    
    const csvText = await csvResponse.text();
    const csvData = parseCSVString(csvText);
    
    // Generate Excel file if needed (this allows us to have a working Excel file)
    try {
      // Create a workbook
      const wb = XLSX.utils.book_new();
      // Convert CSV data to worksheet
      const ws = XLSX.utils.aoa_to_sheet(csvData);
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Mapping");
      
      // Generate binary data
      const excelData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      
      // Create blob and URL for potential download
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // For debugging - this would normally be used to download the file
      // But we're using it just to verify the Excel file was created successfully
      console.log("Excel file generated successfully");
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
    
    // Process the CSV data
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
  
  // Convert to MappingFile format
  const mappingFile: MappingFile = {
    id: `file-${Date.now()}`,
    name: "Sample Mapping Data",
    sourceSystem,
    targetSystem,
    rows: mappings.map((mapping, index) => ({
      id: `row-${Date.now()}-${index}`,
      sourceColumn: {
        id: `src-${Date.now()}-${index}`,
        name: mapping.sourceColumn,
        dataType: "VARCHAR", // Default type
        description: `${mapping.pod} - ${mapping.malcode}`,
      },
      targetColumn: {
        id: `tgt-${Date.now()}-${index}`,
        name: mapping.targetColumn,
        dataType: "VARCHAR", // Default type
      },
      transformation: mapping.transformation,
      status: "pending",
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
