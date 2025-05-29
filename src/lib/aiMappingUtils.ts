
import { MappingFile, MappingRow } from './types';

export interface BusinessDescription {
  malcode: string;
  malcodeDescription?: string;
  table: string;
  tableDescription?: string;
  column: string;
  columnDescription?: string;
}

export const extractBusinessDescriptions = (mappingFile: MappingFile): BusinessDescription[] => {
  return mappingFile.rows.map(row => ({
    malcode: row.sourceColumn.malcode,
    malcodeDescription: row.sourceColumn.businessMetadata?.malcodeDescription,
    table: row.sourceColumn.table,
    tableDescription: row.sourceColumn.businessMetadata?.tableDescription,
    column: row.sourceColumn.column,
    columnDescription: row.sourceColumn.businessMetadata?.columnDescription,
  }));
};

export const formatBusinessContextForAI = (mappingFile: MappingFile): string => {
  const descriptions = extractBusinessDescriptions(mappingFile);
  
  const businessContext = descriptions
    .filter(desc => desc.malcodeDescription || desc.tableDescription || desc.columnDescription)
    .map(desc => {
      const context = [];
      
      if (desc.malcodeDescription) {
        context.push(`Malcode ${desc.malcode}: ${desc.malcodeDescription}`);
      }
      
      if (desc.tableDescription) {
        context.push(`Table ${desc.table}: ${desc.tableDescription}`);
      }
      
      if (desc.columnDescription) {
        context.push(`Column ${desc.column}: ${desc.columnDescription}`);
      }
      
      return `${desc.malcode}.${desc.table}.${desc.column} - ${context.join('; ')}`;
    })
    .join('\n');
    
  return businessContext || 'No business descriptions available for source data elements.';
};

export const hasBusinessDescriptions = (mappingFile: MappingFile): boolean => {
  return mappingFile.rows.some(row => 
    row.sourceColumn.businessMetadata?.malcodeDescription ||
    row.sourceColumn.businessMetadata?.tableDescription ||
    row.sourceColumn.businessMetadata?.columnDescription
  );
};
