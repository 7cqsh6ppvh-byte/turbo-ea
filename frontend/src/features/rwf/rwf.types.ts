/** Shared TypeScript types for the Release Workflow module. */

export type BranchStatus =
  | "open"
  | "in_review"
  | "approved"
  | "merged"
  | "rejected"
  | "abandoned";

export interface RwfBranch {
  id: string;
  name: string;
  description?: string;
  status: BranchStatus;
  base_snapshot_at: string;
  created_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_comment?: string;
  created_at: string;
  updated_at: string;
  card_count: number;
  rel_count: number;
  diag_count: number;
}

export interface BranchListResponse {
  items: RwfBranch[];
  total: number;
  page: number;
  page_size: number;
}

export interface EaSnapshot {
  id: string;
  name: string;
  description?: string;
  snapshot_at: string;
  created_by?: string;
  created_at: string;
}

export interface SnapshotListResponse {
  items: EaSnapshot[];
  total: number;
  page: number;
  page_size: number;
}

export type OverrideOperation = "modified" | "created" | "deleted";

export interface CardOverride {
  override_id: string;
  card_id?: string;
  operation: OverrideOperation;
  draft: Record<string, unknown>;
  base_snapshot?: Record<string, unknown>;
  has_conflicts: boolean;
  conflicts: Record<string, string>;
}

export interface RelationOverride {
  override_id: string;
  relation_id?: string;
  operation: OverrideOperation;
  draft: Record<string, unknown>;
}

export interface DiagramOverride {
  override_id: string;
  diagram_id?: string;
  operation: OverrideOperation;
  draft: Record<string, unknown>;
  base_snapshot?: Record<string, unknown>;
  has_conflicts: boolean;
  conflicts: Record<string, string>;
}

export interface BranchDiff {
  cards: CardOverride[];
  relations: RelationOverride[];
  diagrams: DiagramOverride[];
}

export interface BranchCard {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  status: string;
  description?: string;
  attributes?: Record<string, unknown>;
  lifecycle?: Record<string, unknown>;
  _override?: OverrideOperation;
  _override_id?: string;
}

export interface BranchRelation {
  id?: string;
  type: string;
  source_id: string;
  target_id: string;
  source_name?: string;
  target_name?: string;
  attributes?: Record<string, unknown>;
  _override?: OverrideOperation;
  _override_id?: string;
}

export interface SnapshotDiff {
  snapshot_id: string;
  snapshot_name: string;
  snapshot_at: string;
  cards_added: Record<string, unknown>[];
  cards_removed: Record<string, unknown>[];
  cards_modified: { id: string; diff: Record<string, unknown> }[];
  relations_added: Record<string, unknown>[];
  relations_removed: Record<string, unknown>[];
  diagrams_added: Record<string, unknown>[];
  diagrams_removed: Record<string, unknown>[];
}
