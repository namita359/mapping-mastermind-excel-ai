
import { MappingFile, MappingRow } from "./types";
import { parseCSVString, convertCSVToMappingData } from "./csvUtils";

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
    const response = await fetch('/sample_mapping_template.csv');
    if (!response.ok) {
      console.error('Failed to load sample mapping data');
      return null;
    }
    
    const csvText = await response.text();
    const csvData = parseCSVString(csvText);
    const mappings = convertCSVToMappingData(csvData);
    
    if (mappings.length === 0) {
      console.error('No valid mapping data found in the sample CSV');
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
    
    return mappingFile;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return null;
  }
}
