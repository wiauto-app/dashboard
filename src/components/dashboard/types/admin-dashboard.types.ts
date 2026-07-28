/**
 * Contrato de `GET /api/v1/admin/dashboard?startDate=&endDate=`.
 * Fechas en YYYY-MM-DD. Si faltan ambos params, el backend usa últimos 30 días.
 */

export type AdminDashboardGranularity = "day" | "week";

export interface AdminDashboardPeriod {
  days: number;
  start: string;
  end: string;
  granularity: AdminDashboardGranularity;
}

export interface AdminDashboardMetricDelta {
  current: number;
  previous: number;
}

export interface AdminDashboardKpis {
  activeVehicles: AdminDashboardMetricDelta;
  pendingVehicles: AdminDashboardMetricDelta;
  newUsers: AdminDashboardMetricDelta;
  leads: AdminDashboardMetricDelta;
  activeSubscriptions: AdminDashboardMetricDelta;
}

export interface AdminDashboardQueues {
  pendingVehicles: number;
  openReports: number;
  pendingAppraisals: number;
  highPriorityAppraisals: number;
  planLeadRequests: number;
  openTickets: number;
}

export interface AdminDashboardTimeSeriesPoint {
  bucketStart: string;
  newUsers: number;
  newVehicles: number;
  views: number;
  impressions: number;
  leads: number;
}

export interface AdminDashboardCommercial {
  subscriptionsByStatus: Record<string, number>;
  appraisalsResolved: number;
  appraisalsPending: number;
}

export interface AdminDashboardResponse {
  period: AdminDashboardPeriod;
  kpis: AdminDashboardKpis;
  queues: AdminDashboardQueues;
  timeSeries: AdminDashboardTimeSeriesPoint[];
  inventoryByStatus: Record<string, number>;
  commercial: AdminDashboardCommercial;
}

export interface AdminDashboardParams {
  startDate: string;
  endDate: string;
}
