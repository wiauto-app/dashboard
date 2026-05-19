import { warrantyTypesService } from "@/components/vehicles/services/warrantyTypesService";
import type { WarrantyTypeCatalogItem } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const WarrantyTypesSelector = ({
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
  <CatalogResourceSelector<WarrantyTypeCatalogItem>
    queryKey={["warranty-types"]}
    fetchItems={() => warrantyTypesService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Tipo de garantía"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
