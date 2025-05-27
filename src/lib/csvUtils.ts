
import * as XLSX from 'xlsx';

export interface CSVColumn {
  name: string;
  dataType?: string;
  description?: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
}

export interface CSVMapping {
  pod: string;
  malcode: string;
  sourceColumn: string;
  sourceTable: string;
  targetColumn: string;
  targetTable: string;
  transformation?: string;
}

export function parseCSVFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || typeof event.target.result !== 'string') {
        reject(new Error('Failed to read file as text'));
        return;
      }
      
      try {
        const csvData = event.target.result;
        const rows = parseCSVString(csvData);
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}

export function parseExcelFile(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      try {
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        resolve(rows);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('Error parsing Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export function parseCSVString(csvText: string): string[][] {
  return parseCSV(csvText);
}

function parseCSV(csvText: string): string[][] {
  const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== '');
  return rows.map(row => {
    // Handle quoted values (which might contain commas)
    const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    return matches.map(value => value.replace(/^"(.*)"$/, '$1').trim());
  });
}

export function convertCSVToMappingData(csvData: string[][]): CSVMapping[] {
  console.log("Converting CSV to mapping data:", csvData);
  
  // Ensure we have data to process
  if (!csvData || csvData.length < 2) {
    console.error('Invalid CSV data: missing rows', csvData);
    return [];
  }
  
  // Get headers from the first row and normalize them
  const headers = csvData[0].map(header => header?.toLowerCase().trim());
  console.log('CSV headers:', headers);
  
  if (headers.length < 6) {
    console.error('Invalid CSV data: missing required columns', headers);
    return [];
  }
  
  const mappings: CSVMapping[] = [];
  
  // Map CSV columns to expected format with flexible matching
  const columnIndices = {
    pod: findColumnIndex(headers, ['pod', 'program', 'domain']),
    malcode: findColumnIndex(headers, ['malcode', 'mal_code', 'management_area', 'area_code']),
    sourceColumn: findColumnIndex(headers, ['source_column', 'sourcecolumn', 'src_column', 'source col']),
    sourceTable: findColumnIndex(headers, ['source_table', 'sourcetable', 'src_table', 'source tbl']),
    targetColumn: findColumnIndex(headers, ['target_column', 'targetcolumn', 'tgt_column', 'target col']),
    targetTable: findColumnIndex(headers, ['target_table', 'targettable', 'tgt_table', 'target tbl']),
    transformation: findColumnIndex(headers, ['transformation', 'transform', 'logic', 'rule'])
  };
  
  console.log('Column indices:', columnIndices);
  
  // Ensure all required columns exist
  const requiredColumns = ['pod', 'malcode', 'sourceColumn', 'sourceTable', 'targetColumn', 'targetTable'];
  const missingColumns = requiredColumns.filter(col => columnIndices[col as keyof typeof columnIndices] === -1);
  
  if (missingColumns.length > 0) {
    console.error(`Missing required columns: ${missingColumns.join(', ')}`);
    console.log('Available headers:', headers);
    return [];
  }
  
  // Process data rows (skip header)
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip empty rows
    if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
      console.log(`Skipping empty row at index ${i}`);
      continue;
    }
    
    if (row.length < 6) {
      console.warn(`Row ${i} has insufficient data, skipping:`, row);
      continue;
    }
    
    const mapping: CSVMapping = {
      pod: row[columnIndices.pod] || '',
      malcode: row[columnIndices.malcode] || '',
      sourceColumn: row[columnIndices.sourceColumn] || '',
      sourceTable: row[columnIndices.sourceTable] || '',
      targetColumn: row[columnIndices.targetColumn] || '',
      targetTable: row[columnIndices.targetTable] || '',
      transformation: columnIndices.transformation >= 0 ? row[columnIndices.transformation] : undefined
    };
    
    // Skip rows with missing critical data
    if (!mapping.pod || !mapping.malcode || !mapping.sourceColumn || !mapping.targetColumn) {
      console.warn(`Row ${i} missing critical data, skipping:`, mapping);
      continue;
    }
    
    mappings.push(mapping);
  }
  
  console.log(`Processed ${mappings.length} mappings from CSV data`);
  return mappings;
}

// Helper function to find column index with flexible matching
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => header === name);
    if (index !== -1) return index;
  }
  return -1;
}
