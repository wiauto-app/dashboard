export type ReportTargetType = "profile" | "dealership" | "vehicle";

export type ReportStatus =
  | "open"
  | "in_review"
  | "resolved"
  | "dismissed"
  | "escalated";

export interface ReportCategoryRef {
  id: string;
  name: string;
  slug: string;
  target_type: ReportTargetType;
}

export interface ReportListItem {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  status: ReportStatus;
  target_type: ReportTargetType;
  target_id: string;
  target_label: string;
  reporter_profile_id: string;
  reporter_label: string;
  implicated_profile_id: string | null;
  implicated_label: string | null;
  implicated_is_suspended: boolean;
  vehicle_id_for_chat: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  category: ReportCategoryRef;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category_id: string;
  target_type: ReportTargetType;
  target_id: string;
  file_url?: string | null;
}

export interface UpdateReportPayload {
  title?: string;
  description?: string;
  file_url?: string | null;
  status?: ReportStatus;
  admin_notes?: string | null;
}
