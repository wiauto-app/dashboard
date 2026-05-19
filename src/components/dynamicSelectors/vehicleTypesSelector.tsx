import { vehicleTypesService } from "@/components/vehicles/services/vehicleTypesService";
import type { CatalogItemWithSlug } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const VehicleTypesSelector = ({
  onValueChange,
  value,
  ariaInvalid,
  disabled,
}: {
  onValueChange: (value: string) => void;
  value?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
}) => (
  <CatalogResourceSelector<CatalogItemWithSlug>
    queryKey={["vehicle-types"]}
    fetchItems={() => vehicleTypesService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Tipo de vehículo"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
