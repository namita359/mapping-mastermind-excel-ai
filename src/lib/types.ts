
export type MappingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface MappingColumn {
  id: string;
  name: string;
  dataType: string;
  description?: string;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface MappingRow {
  id: string;
  sourceColumn: MappingColumn;
  targetColumn: MappingColumn;
  transformation?: string;
  status: MappingStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  reviewer?: string;
  reviewedAt?: Date;
  comments?: string[];
}

export interface MappingFile {
  id: string;
  name: string;
  description?: string;
  sourceSystem: string;
  targetSystem: string;
  rows: MappingRow[];
  status: MappingStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}
