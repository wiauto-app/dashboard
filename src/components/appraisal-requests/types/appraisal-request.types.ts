export type AppraisalRequestStatus = "pending" | "answered" | "closed";

export type AppraisalRequestPriority = "low" | "high";

export type AppraisalRequestTransmissionType = "manual" | "automatic";

export interface AppraisalRequestListItem {
  id: string;
  make_id: number;
  make_name: string;
  model_id: number;
  model_name: string;
  year_id: number;
  year: number;
  version_id: number | null;
  version_name: string | null;
  fuel_type_id: number | null;
  body_type_id: number | null;
  transmission_type: AppraisalRequestTransmissionType;
  mileage: number;
  lat: number;
  lng: number;
  address: string | null;
  vehicle_label: string;
  name: string;
  email: string;
  phone_code: string;
  phone: string;
  contact_label: string;
  status: AppraisalRequestStatus;
  priority: AppraisalRequestPriority;
  profile_id: string | null;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  admin_note: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RespondAppraisalRequestPayload {
  estimated_price_min: number;
  estimated_price_max: number;
  admin_note?: string;
}
