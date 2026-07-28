import type { AppraisalRequestPriority } from "../types/appraisal-request.types";

export const APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_VALUE = "__all__";
export const APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_LABEL = "Todos";

export const APPRAISAL_REQUEST_PRIORITY_OPTIONS: {
  value: AppraisalRequestPriority;
  label: string;
}[] = [
  { value: "high", label: "Alta" },
  { value: "low", label: "Baja" },
];

export const get_appraisal_request_priority_label = (
  priority: AppraisalRequestPriority,
): string =>
  APPRAISAL_REQUEST_PRIORITY_OPTIONS.find((option) => option.value === priority)
    ?.label ?? priority;
