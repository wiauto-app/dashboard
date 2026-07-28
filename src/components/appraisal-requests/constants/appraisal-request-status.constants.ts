import type { AppraisalRequestStatus } from "../types/appraisal-request.types";

export const APPRAISAL_REQUEST_FILTER_ALL_VALUE = "__all__";
export const APPRAISAL_REQUEST_FILTER_ALL_LABEL = "Todos";

export const APPRAISAL_REQUEST_STATUS_OPTIONS: {
  value: AppraisalRequestStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pendiente" },
  { value: "answered", label: "Respondida" },
  { value: "closed", label: "Cerrada" },
];

export const get_appraisal_request_status_label = (
  status: AppraisalRequestStatus,
): string =>
  APPRAISAL_REQUEST_STATUS_OPTIONS.find((option) => option.value === status)
    ?.label ?? status;
