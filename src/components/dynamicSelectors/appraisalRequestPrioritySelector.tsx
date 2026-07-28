import { useMemo } from "react";

import {
  APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_LABEL,
  APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_VALUE,
  APPRAISAL_REQUEST_PRIORITY_OPTIONS,
} from "@/components/appraisal-requests/constants/appraisal-request-priority.constants";
import type { AppraisalRequestPriority } from "@/components/appraisal-requests/types/appraisal-request.types";

import { BaseSelector } from "./baseSelector";

type Option =
  | (typeof APPRAISAL_REQUEST_PRIORITY_OPTIONS)[number]
  | {
      value: typeof APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_VALUE;
      label: typeof APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_LABEL;
    };

export const AppraisalRequestPrioritySelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Prioridad de la solicitud",
  include_all_option = false,
}: {
  value?: AppraisalRequestPriority;
  onValueChange: (value: AppraisalRequestPriority | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...APPRAISAL_REQUEST_PRIORITY_OPTIONS];
    return [
      {
        value: APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_VALUE,
        label: APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_LABEL,
      },
      ...APPRAISAL_REQUEST_PRIORITY_OPTIONS,
    ];
  }, [include_all_option]);

  const handleChange = (next: string | undefined) => {
    if (next === APPRAISAL_REQUEST_PRIORITY_FILTER_ALL_VALUE) {
      onValueChange(undefined);
      return;
    }
    onValueChange(next as AppraisalRequestPriority | undefined);
  };

  return (
    <BaseSelector
      items={items}
      value={value}
      onChange={handleChange}
      labelKey="label"
      valueKey="value"
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};
