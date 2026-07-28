import type { AdminDashboardMetricDelta } from "../types/admin-dashboard.types";

export const ADMIN_DASHBOARD_MAX_RANGE_DAYS = 365;
export const DEFAULT_ADMIN_DASHBOARD_RANGE_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getDefaultAdminDashboardDateRange = (): {
  startDate: string;
  endDate: string;
} => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(
    startDate.getDate() - (DEFAULT_ADMIN_DASHBOARD_RANGE_DAYS - 1),
  );

  return {
    startDate: formatDateInputValue(startDate),
    endDate: formatDateInputValue(endDate),
  };
};

export const isValidAdminDashboardDateRange = (
  startDate: string,
  endDate: string,
): boolean => {
  if (!startDate || !endDate) {
    return false;
  }

  if (startDate > endDate) {
    return false;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;

  return days <= ADMIN_DASHBOARD_MAX_RANGE_DAYS;
};

export const getAdminDashboardDateRangeError = (
  startDate: string,
  endDate: string,
): string | null => {
  if (!startDate || !endDate) {
    return "Selecciona una fecha de inicio y una de fin.";
  }

  if (startDate > endDate) {
    return "La fecha de inicio debe ser anterior o igual a la de fin.";
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;

  if (days > ADMIN_DASHBOARD_MAX_RANGE_DAYS) {
    return `El rango no puede superar ${ADMIN_DASHBOARD_MAX_RANGE_DAYS} días.`;
  }

  return null;
};

export const formatDashboardNumber = (value: number): string => {
  return new Intl.NumberFormat("es-ES").format(value);
};

export const computeDeltaPercent = (
  metric: AdminDashboardMetricDelta,
): number | null => {
  if (metric.previous === 0) {
    if (metric.current === 0) return 0;
    return null;
  }

  return ((metric.current - metric.previous) / metric.previous) * 100;
};

export const formatDeltaPercent = (percent: number | null): string => {
  if (percent === null) return "Nuevo";
  const rounded = Math.round(percent * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
};

export const isPositiveDelta = (metric: AdminDashboardMetricDelta): boolean => {
  return metric.current >= metric.previous;
};

export const formatDashboardDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export const formatTodayLabel = (): string => {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

const INVENTORY_STATUS_LABELS: Record<string, string> = {
  active: "Activos",
  pending: "Pendientes",
  sold: "Vendidos",
  inactive: "Inactivos",
  archived: "Archivados",
};

export const getInventoryStatusLabel = (status: string): string => {
  return INVENTORY_STATUS_LABELS[status] ?? status;
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activas",
  past_due: "Vencidas",
  canceled: "Canceladas",
  cancelled: "Canceladas",
  trialing: "Prueba",
  incomplete: "Incompletas",
};

export const getSubscriptionStatusLabel = (status: string): string => {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status;
};
