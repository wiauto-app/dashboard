import { useMemo } from "react";
import { BaseSelector } from "./baseSelector";
import {
  TICKET_FILTER_ALL_LABEL,
  TICKET_FILTER_ALL_VALUE,
  TICKET_STATUS_OPTIONS,
} from "@/components/support/constants/ticket-status.constants";

type Option =
  | (typeof TICKET_STATUS_OPTIONS)[number]
  | {
      value: typeof TICKET_FILTER_ALL_VALUE;
      label: typeof TICKET_FILTER_ALL_LABEL;
    };

export const TicketStatusSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Estado del ticket",
  include_all_option = false,
}: {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...TICKET_STATUS_OPTIONS];
    return [
      { value: TICKET_FILTER_ALL_VALUE, label: TICKET_FILTER_ALL_LABEL },
      ...TICKET_STATUS_OPTIONS,
    ];
  }, [include_all_option]);

  const handleChange = (next: string | undefined) => {
    if (next === TICKET_FILTER_ALL_VALUE) {
      onValueChange(undefined);
      return;
    }
    onValueChange(next);
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
