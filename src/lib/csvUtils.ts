
export interface CSVColumn {
  name: string;
  dataType?: string;
  description?: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
}

export interface CSVMapping {
  sourceColumn: string;
  sourceDataType: string;
  sourceDescription?: string;
  sourceIsPrimaryKey?: boolean;
  sourceIsNullable?: boolean;
  targetColumn: string;
  targetDataType: string;
  targetDescription?: string;
  targetIsPrimaryKey?: boolean;
  targetIsNullable?: boolean;
  transformation?: string;
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
      const rows = parseCSV(csvData);
      resolve(rows);
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
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
    sourceColumn: headers.indexOf('Source Column'),
    sourceDataType: headers.indexOf('Source Data Type'),
    sourceDescription: headers.indexOf('Source Description'),
    sourceIsPrimaryKey: headers.indexOf('Source Is Primary Key'),
    sourceIsNullable: headers.indexOf('Source Is Nullable'),
    targetColumn: headers.indexOf('Target Column'),
    targetDataType: headers.indexOf('Target Data Type'),
    targetDescription: headers.indexOf('Target Description'),
    targetIsPrimaryKey: headers.indexOf('Target Is Primary Key'),
    targetIsNullable: headers.indexOf('Target Is Nullable'),
    transformation: headers.indexOf('Transformation')
  };
  
  // Process data rows (skip header)
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip empty rows
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;
    
    const mapping: CSVMapping = {
      sourceColumn: row[columnIndices.sourceColumn] || '',
      sourceDataType: row[columnIndices.sourceDataType] || '',
      sourceDescription: columnIndices.sourceDescription >= 0 ? row[columnIndices.sourceDescription] : undefined,
      sourceIsPrimaryKey: columnIndices.sourceIsPrimaryKey >= 0 ? row[columnIndices.sourceIsPrimaryKey]?.toLowerCase() === 'true' : undefined,
      sourceIsNullable: columnIndices.sourceIsNullable >= 0 ? row[columnIndices.sourceIsNullable]?.toLowerCase() === 'true' : undefined,
      targetColumn: row[columnIndices.targetColumn] || '',
      targetDataType: row[columnIndices.targetDataType] || '',
      targetDescription: columnIndices.targetDescription >= 0 ? row[columnIndices.targetDescription] : undefined,
      targetIsPrimaryKey: columnIndices.targetIsPrimaryKey >= 0 ? row[columnIndices.targetIsPrimaryKey]?.toLowerCase() === 'true' : undefined,
      targetIsNullable: columnIndices.targetIsNullable >= 0 ? row[columnIndices.targetIsNullable]?.toLowerCase() === 'true' : undefined,
      transformation: columnIndices.transformation >= 0 ? row[columnIndices.transformation] : undefined
    };
    
    mappings.push(mapping);
  }
  
  return mappings;
}
