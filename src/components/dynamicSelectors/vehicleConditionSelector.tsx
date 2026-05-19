import { BaseSelector } from "./baseSelector";
import { VEHICLE_CONDITION_OPTIONS } from "@/components/vehicles/constants/vehicle-enums.constants";

export const VehicleConditionSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Condición",
}: {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <BaseSelector
    items={VEHICLE_CONDITION_OPTIONS}
    value={value}
    onChange={onValueChange}
    labelKey="label"
    valueKey="value"
    placeholder={placeholder}
    disabled={disabled}
  />
);
