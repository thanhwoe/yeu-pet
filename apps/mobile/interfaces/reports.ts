export type ReportTargetType = "photo" | "comment" | "sitter" | "user";

export interface ReportForm {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description?: string;
}

export interface Report {
  id: string;
  reporterAccountId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  description: string | null;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  createdAt: string;
  updatedAt: string | null;
}

export interface UserBlock {
  id: string;
  blockerAccountId: string;
  blockedAccountId: string;
  createdAt: string;
}
