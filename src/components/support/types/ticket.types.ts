export type TicketStatus =
  | "open"
  | "closed"
  | "pending"
  | "in_progress"
  | "resolved"
  | "cancelled";

export interface TicketCategoryRef {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface TicketListItem {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  status: TicketStatus;
  profile_id: string;
  profile_label: string;
  created_at: string;
  updated_at: string;
  category: TicketCategoryRef;
}

export interface CreateTicketPayload {
  category_id: string;
  title: string;
  description: string;
  file_url?: string | null;
}

export interface UpdateTicketPayload {
  category_id?: string;
  title?: string;
  description?: string;
  file_url?: string | null;
  status?: TicketStatus;
}
