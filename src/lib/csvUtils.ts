
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
      if (!event.target || typeof event.target.result === 'string') {
        reject(new Error('Failed to read file as binary string'));
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
        reject(new Error('Error parsing Excel file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
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
  // Assuming first row is headers
  const headers = csvData[0];
  const mappings: CSVMapping[] = [];
  
  // Map CSV columns to expected format
  const columnIndices = {
    pod: headers.indexOf('pod'),
    malcode: headers.indexOf('Malcode'),
    sourceColumn: headers.indexOf('source_column'),
    sourceTable: headers.indexOf('source_table'),
    targetColumn: headers.indexOf('target_column'),
    targetTable: headers.indexOf('target_table'),
    transformation: headers.indexOf('transformation')
  };
  
  // Process data rows (skip header)
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip empty rows
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;
    
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
  
  return mappings;
}

