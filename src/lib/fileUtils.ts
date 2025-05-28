
import { MappingFile, MappingRow } from "./types";
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

export async function loadSampleMappingData(): Promise<MappingFile | null> {
  try {
    console.log("Loading data from data.xlsx...");
    const dataResponse = await fetch('/data.xlsx');
    
    if (!dataResponse.ok) {
      console.error('Failed to load data.xlsx');
      return null;
    }

    const excelArrayBuffer = await dataResponse.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(excelArrayBuffer), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to array of objects with headers
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    console.log("Excel data loaded:", excelData);
    
    if (!excelData || excelData.length < 2) {
      console.error('No data found in Excel file');
      return null;
    }

    return processExcelData(excelData);
  } catch (error) {
    console.error('Error loading data.xlsx:', error);
    return null;
  }
}

function processExcelData(data: string[][]): MappingFile | null {
  console.log("Processing Excel data:", data);
  
  // Get headers from first row
  const headers = data[0];
  const rows = data.slice(1);
  
  // Find column indices
  const getColumnIndex = (columnName: string): number => {
    const index = headers.findIndex(header => 
      header && header.toLowerCase().trim() === columnName.toLowerCase()
    );
    return index;
  };

  const sourceMalcodeIndex = getColumnIndex('source_malcode');
  const sourceTableIndex = getColumnIndex('source_table');
  const sourceColumnIndex = getColumnIndex('source_column');
  const targetMalcodeIndex = getColumnIndex('target_malcode');
  const targetTableIndex = getColumnIndex('target_table');
  const targetColumnIndex = getColumnIndex('target_column');
  const transformationIndex = getColumnIndex('transformation');
  const joinIndex = getColumnIndex('join');

  // Validate required columns exist
  if (sourceMalcodeIndex === -1 || sourceTableIndex === -1 || sourceColumnIndex === -1 ||
      targetMalcodeIndex === -1 || targetTableIndex === -1 || targetColumnIndex === -1) {
    console.error('Required columns not found in Excel file');
    return null;
  }

  // Filter out empty rows
  const validRows = rows.filter(row => 
    row && row.length > 0 && 
    row[sourceMalcodeIndex] && row[sourceTableIndex] && row[sourceColumnIndex] &&
    row[targetMalcodeIndex] && row[targetTableIndex] && row[targetColumnIndex]
  );

  if (validRows.length === 0) {
    console.error('No valid data rows found');
    return null;
  }

  // Convert to MappingFile format with all records auto-approved
  const mappingRows: MappingRow[] = validRows.map((row, index) => ({
    id: `row-${Date.now()}-${index}`,
    sourceColumn: {
      id: `src-${Date.now()}-${index}`,
      malcode: row[sourceMalcodeIndex] || '',
      table: row[sourceTableIndex] || '',
      column: row[sourceColumnIndex] || '',
      dataType: "VARCHAR",
      sourceType: "SRZ_ADLS" as const,
    },
    targetColumn: {
      id: `tgt-${Date.now()}-${index}`,
      malcode: row[targetMalcodeIndex] || '',
      table: row[targetTableIndex] || '',
      column: row[targetColumnIndex] || '',
      dataType: "VARCHAR",
      targetType: "CZ_ADLS" as const,
    },
    transformation: transformationIndex !== -1 ? row[transformationIndex] : undefined,
    join: joinIndex !== -1 ? row[joinIndex] : undefined,
    status: "approved" as const, // Auto-approve all records
    createdBy: "Excel Import",
    createdAt: new Date(),
    reviewer: "Auto-Approved", // Add reviewer info
    reviewedAt: new Date(), // Add review timestamp
    comments: []
  }));

  // Determine source and target systems from the data
  const sourceSystem = mappingRows[0]?.sourceColumn.table || "Source System";
  const targetSystem = mappingRows[0]?.targetColumn.table || "Target System";

  const mappingFile: MappingFile = {
    id: `file-${Date.now()}`,
    name: "Data.xlsx",
    sourceSystem,
    targetSystem,
    rows: mappingRows,
    status: "draft",
    createdBy: "Excel Import",
    createdAt: new Date()
  };

  console.log("Processed Excel mapping data with auto-approved records:", mappingFile);
  return mappingFile;
}
