// ── Schema models for phpMySQLDiff ───────────────────────────────────────────

export interface DbConnection {
  host: string;
  port: number;
  dbname: string;
  user: string;
  password: string;
}

export interface ConnectionTestResult {
  success: boolean;
  version: string | null;
  message: string;
}

// ── Extractor models ──────────────────────────────────────────────────────────

export interface ColumnDef {
  COLUMN_NAME: string;
  ORDINAL_POSITION: number;
  COLUMN_DEFAULT: string | null;
  IS_NULLABLE: string;
  DATA_TYPE: string;
  COLUMN_TYPE: string;
  COLUMN_KEY: string;
  EXTRA: string;
  COLUMN_COMMENT: string;
  CHARACTER_SET_NAME: string | null;
  COLLATION_NAME: string | null;
}

export interface IndexDef {
  name: string;
  unique: boolean;
  type: string;
  comment: string;
  columns: { column: string; sub_part: number | null; seq: number }[];
}

export interface ForeignKeyDef {
  name: string;
  columns: string[];
  ref_table: string;
  ref_columns: string[];
  on_update: string;
  on_delete: string;
}

export interface TableDef {
  name: string;
  engine: string;
  collation: string;
  comment: string;
  columns: Record<string, ColumnDef>;
  indexes: Record<string, IndexDef>;
  foreign_keys: Record<string, ForeignKeyDef>;
  ddl: string;
}

export interface ViewDef {
  name: string;
  definition: string;
  updatable: string;
  definer: string;
  ddl: string;
}

export interface RoutineDef {
  name: string;
  type: string;
  return_type: string;
  definition: string;
  deterministic: string;
  definer: string;
  comment: string;
  ddl: string;
}

export interface TriggerDef {
  name: string;
  event: string;
  table: string;
  timing: string;
  statement: string;
  definer: string;
  ddl: string;
}

// ── Diff models ────────────────────────────────────────────────────────────────

export type DiffStatus = 'added' | 'removed' | 'modified' | 'equal';

export interface ChangeItem {
  type: 'column' | 'index' | 'foreign_key' | 'option';
  action: DiffStatus;
  name: string;
  detail?: any;
  diff?: Record<string, { orig: any; dest: any }>;
  orig_value?: any;
  dest_value?: any;
}

export interface TableDiff {
  name: string;
  status: DiffStatus;
  changes: ChangeItem[];
}

export interface SimpleObjectDiff {
  name: string;
  status: DiffStatus;
  orig: any;
  dest: any;
}

export interface SectionSummary {
  added: number;
  removed: number;
  modified: number;
  equal: number;
  total: number;
}

export interface ComparisonSummary {
  total_changes: number;
  tables: SectionSummary;
  views: SectionSummary;
  functions: SectionSummary;
  procedures: SectionSummary;
  triggers: SectionSummary;
  [key: string]: SectionSummary | number;
}

export interface ComparisonDiff {
  tables: Record<string, TableDiff>;
  views: Record<string, SimpleObjectDiff>;
  functions: Record<string, SimpleObjectDiff>;
  procedures: Record<string, SimpleObjectDiff>;
  triggers: Record<string, SimpleObjectDiff>;
  summary: ComparisonSummary;
}

export interface CompareResult {
  history_id: number;
  summary: ComparisonSummary;
  diff: ComparisonDiff;
  script: string;
}

// ── History models ────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: number;
  created_at: string;
  origin_host: string;
  origin_db: string;
  dest_host: string;
  dest_db: string;
  summary: ComparisonSummary;
}

export interface HistoryDetail extends HistoryItem {
  diff: ComparisonDiff;
  script: string;
}

export interface HistoryListResult {
  total: number;
  items: HistoryItem[];
}
