import { BaseSelector } from "./baseSelector";
import { VEHICLE_TRANSMISSION_TYPE_OPTIONS } from "@/components/vehicles/constants/vehicle-enums.constants";

export const VehicleTransmissionTypeSelector = ({
  value,
  onValueChange,
  disabled,
  placeholder = "Tipo de transmisión",
}: {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <BaseSelector
    items={VEHICLE_TRANSMISSION_TYPE_OPTIONS}
    value={value}
    onChange={onValueChange}
    labelKey="label"
    valueKey="value"
    placeholder={placeholder}
    disabled={disabled}
  />
);
