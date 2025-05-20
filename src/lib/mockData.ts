
import { MappingFile, MappingRow, MappingStatus } from "./types";

export const generateMockRows = (count: number): MappingRow[] => {
  const statuses: MappingStatus[] = ['draft', 'pending', 'approved', 'rejected'];
  const dataTypes = ['VARCHAR', 'INTEGER', 'DATE', 'TIMESTAMP', 'DECIMAL', 'BOOLEAN'];
  
  return Array.from({ length: count }).map((_, index) => {
    const id = `row-${index + 1}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id,
      sourceColumn: {
        id: `src-${id}`,
        name: `source_column_${index + 1}`,
        dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
        description: `Source column description ${index + 1}`,
        isPrimaryKey: Math.random() > 0.8,
        isNullable: Math.random() > 0.5
      },
      targetColumn: {
        id: `tgt-${id}`,
        name: `target_column_${index + 1}`,
        dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
        description: `Target column description ${index + 1}`,
        isPrimaryKey: Math.random() > 0.8,
        isNullable: Math.random() > 0.5
      },
      transformation: Math.random() > 0.3 ? `TRANSFORM(source_column_${index + 1})` : undefined,
      status,
      createdBy: 'System User',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
      updatedAt: Math.random() > 0.5 ? new Date() : undefined,
      reviewer: status !== 'draft' ? 'Reviewer User' : undefined,
      reviewedAt: status === 'approved' || status === 'rejected' ? new Date() : undefined,
      comments: Math.random() > 0.7 ? ['Comment 1', 'Comment 2'] : []
    };
  });
};

export const mockMappingFile: MappingFile = {
  id: 'file-1',
  name: 'Customer Data Mapping',
  description: 'Mapping for customer data between CRM and Data Warehouse',
  sourceSystem: 'CRM System',
  targetSystem: 'Data Warehouse',
  rows: generateMockRows(50),
  status: 'approved',
  createdBy: 'System User',
  createdAt: new Date(Date.now() - 5000000)
};
