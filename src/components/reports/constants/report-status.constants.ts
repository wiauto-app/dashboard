import type { ReportStatus } from "../types/report.types";

export const REPORT_FILTER_ALL_VALUE = "__all__";
export const REPORT_FILTER_ALL_LABEL = "Todos";

export const REPORT_STATUS_OPTIONS: {
  value: ReportStatus;
  label: string;
}[] = [
  { value: "open", label: "Abierta" },
  { value: "in_review", label: "En revisión" },
  { value: "resolved", label: "Resuelta" },
  { value: "dismissed", label: "Desestimada" },
  { value: "escalated", label: "Escalada" },
];

export const get_report_status_label = (status: ReportStatus): string =>
  REPORT_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
  status;
