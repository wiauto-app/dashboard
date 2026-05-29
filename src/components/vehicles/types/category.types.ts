export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryPayload {
  name: string;
  image_url?: string | null;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  image_url?: string | null;
}
