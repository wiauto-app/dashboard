import type { ReportTargetType } from "./report.types";

export interface ReportCategoryItem {
  id: string;
  name: string;
  slug: string;
  target_type: ReportTargetType;
  created_at: string;
  updated_at: string;
}

export interface CreateReportCategoryPayload {
  name: string;
  target_type: ReportTargetType;
}

export interface UpdateReportCategoryPayload {
  id: string;
  name?: string;
  target_type?: ReportTargetType;
}
