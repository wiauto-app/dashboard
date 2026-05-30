export interface TicketCategoryItem {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketCategoryPayload {
  name: string;
}

export interface UpdateTicketCategoryPayload {
  id: string;
  name?: string;
}
