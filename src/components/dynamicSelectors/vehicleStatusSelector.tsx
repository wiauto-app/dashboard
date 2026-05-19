import { useMemo } from "react";
import { BaseSelector } from "./baseSelector";
import {
  VEHICLE_FILTER_ALL_LABEL,
  VEHICLE_FILTER_ALL_VALUE,
  VEHICLE_STATUS_OPTIONS,
} from "@/components/vehicles/constants/vehicle-enums.constants";

type Option = (typeof VEHICLE_STATUS_OPTIONS)[number] | {
  value: typeof VEHICLE_FILTER_ALL_VALUE;
  label: typeof VEHICLE_FILTER_ALL_LABEL;
};

export const VehicleStatusSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Estado del anuncio",
  include_all_option = false,
}: {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...VEHICLE_STATUS_OPTIONS];
    return [
      { value: VEHICLE_FILTER_ALL_VALUE, label: VEHICLE_FILTER_ALL_LABEL },
      ...VEHICLE_STATUS_OPTIONS,
    ];
  }, [include_all_option]);

  const handleChange = (next: string | undefined) => {
    if (next === VEHICLE_FILTER_ALL_VALUE) {
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
