import type { ReportTargetType } from "../types/report.types";

export const REPORT_FILTER_ALL_VALUE = "__all__";
export const REPORT_FILTER_ALL_LABEL = "Todos";

export const REPORT_TARGET_TYPE_OPTIONS: {
  value: ReportTargetType;
  label: string;
}[] = [
  { value: "profile", label: "Perfil" },
  { value: "dealership", label: "Concesionario" },
  { value: "vehicle", label: "Anuncio" },
];

export const get_report_target_type_label = (
  target_type: ReportTargetType,
): string =>
  REPORT_TARGET_TYPE_OPTIONS.find((option) => option.value === target_type)
    ?.label ?? target_type;
