import { useMemo } from "react";
import { BaseSelector } from "./baseSelector";
import {
  VEHICLE_FILTER_ALL_LABEL,
  VEHICLE_FILTER_ALL_VALUE,
  VEHICLE_PUBLISHER_TYPE_OPTIONS,
} from "@/components/vehicles/constants/vehicle-enums.constants";

type Option = (typeof VEHICLE_PUBLISHER_TYPE_OPTIONS)[number] | {
  value: typeof VEHICLE_FILTER_ALL_VALUE;
  label: typeof VEHICLE_FILTER_ALL_LABEL;
};

export const VehiclePublisherTypeSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Tipo de publicador",
  include_all_option = false,
}: {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Para filtros: primera opción “Todos” devuelve `undefined` vía el valor centinela. */
  include_all_option?: boolean;
}) => {
  const items = useMemo<Option[]>(() => {
    if (!include_all_option) return [...VEHICLE_PUBLISHER_TYPE_OPTIONS];
    return [
      { value: VEHICLE_FILTER_ALL_VALUE, label: VEHICLE_FILTER_ALL_LABEL },
      ...VEHICLE_PUBLISHER_TYPE_OPTIONS,
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
