
export type MappingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type SourceType = 'SRZ_ADLS'; // Raw zone in ADLS
export type TargetType = 'CZ_ADLS' | 'SYNAPSE_TABLE'; // Curated zone ADLS or Synapse Table

export interface BusinessMetadata {
  malcodeDescription?: string;
  tableDescription?: string;
  columnDescription?: string;
}

export interface MappingColumn {
  id: string;
  malcode: string;
  table: string;
  column: string;
  dataType: string;
  businessMetadata?: BusinessMetadata;
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface MappingRow {
  id: string;
  sourceColumn: MappingColumn & { sourceType: SourceType };
  targetColumn: MappingColumn & { targetType: TargetType };
  transformation?: string;
  join?: string;
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
