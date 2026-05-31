import { useMemo } from "react";
import { BaseSelector } from "./baseSelector";
import {
  REPORT_FILTER_ALL_LABEL,
  REPORT_FILTER_ALL_VALUE,
  REPORT_TARGET_TYPE_OPTIONS,
} from "@/components/reports/constants/report-target-type.constants";
import type { ReportTargetType } from "@/components/reports/types/report.types";

type Option =
  | (typeof REPORT_TARGET_TYPE_OPTIONS)[number]
  | {
      value: typeof REPORT_FILTER_ALL_VALUE;
      label: typeof REPORT_FILTER_ALL_LABEL;
    };

export const ReportTargetTypeSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Tipo de objetivo",
  include_all_option = false,
}: {
  value?: ReportTargetType;
  onValueChange: (value: ReportTargetType | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...REPORT_TARGET_TYPE_OPTIONS];
    return [
      { value: REPORT_FILTER_ALL_VALUE, label: REPORT_FILTER_ALL_LABEL },
      ...REPORT_TARGET_TYPE_OPTIONS,
    ];
  }, [include_all_option]);

  const handleChange = (next: string | undefined) => {
    if (next === REPORT_FILTER_ALL_VALUE) {
      onValueChange(undefined);
      return;
    }
    onValueChange(next as ReportTargetType | undefined);
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
