
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
  // Ensure we have data to process
  if (!csvData || csvData.length < 2) {
    console.error('Invalid CSV data: missing rows', csvData);
    return [];
  }
  
  // Get headers from the first row
  const headers = csvData[0];
  console.log('CSV headers:', headers);
  
  if (headers.length < 6) {
    console.error('Invalid CSV data: missing required columns', headers);
    return [];
  }
  
  const mappings: CSVMapping[] = [];
  
  // Map CSV columns to expected format
  const columnIndices = {
    pod: headers.findIndex(h => h?.toLowerCase() === 'pod'),
    malcode: headers.findIndex(h => h?.toLowerCase() === 'malcode'),
    sourceColumn: headers.findIndex(h => h?.toLowerCase() === 'source_column'),
    sourceTable: headers.findIndex(h => h?.toLowerCase() === 'source_table'),
    targetColumn: headers.findIndex(h => h?.toLowerCase() === 'target_column'),
    targetTable: headers.findIndex(h => h?.toLowerCase() === 'target_table'),
    transformation: headers.findIndex(h => h?.toLowerCase() === 'transformation')
  };
  
  console.log('Column indices:', columnIndices);
  
  // Ensure all required columns exist
  const requiredColumns = ['pod', 'malcode', 'sourceColumn', 'sourceTable', 'targetColumn', 'targetTable'];
  const missingColumns = requiredColumns.filter(col => columnIndices[col as keyof typeof columnIndices] === -1);
  
  if (missingColumns.length > 0) {
    console.error(`Missing required columns: ${missingColumns.join(', ')}`);
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
    
    mappings.push(mapping);
  }
  
  console.log(`Processed ${mappings.length} mappings from CSV data`);
  return mappings;
}
