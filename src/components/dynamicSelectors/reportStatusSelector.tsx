import { useMemo } from "react";
import { BaseSelector } from "./baseSelector";
import {
  REPORT_FILTER_ALL_LABEL,
  REPORT_FILTER_ALL_VALUE,
  REPORT_STATUS_OPTIONS,
} from "@/components/reports/constants/report-status.constants";
import type { ReportStatus } from "@/components/reports/types/report.types";

type Option =
  | (typeof REPORT_STATUS_OPTIONS)[number]
  | {
      value: typeof REPORT_FILTER_ALL_VALUE;
      label: typeof REPORT_FILTER_ALL_LABEL;
    };

export const ReportStatusSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Estado de la denuncia",
  include_all_option = false,
}: {
  value?: ReportStatus;
  onValueChange: (value: ReportStatus | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...REPORT_STATUS_OPTIONS];
    return [
      { value: REPORT_FILTER_ALL_VALUE, label: REPORT_FILTER_ALL_LABEL },
      ...REPORT_STATUS_OPTIONS,
    ];
  }, [include_all_option]);

  const handleChange = (next: string | undefined) => {
    if (next === REPORT_FILTER_ALL_VALUE) {
      onValueChange(undefined);
      return;
    }
    onValueChange(next as ReportStatus | undefined);
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
