import { tractionsService } from "@/components/vehicles/services/tractionsService";
import type { CatalogItemWithSlug } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const TractionsSelector = ({
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
    queryKey={["tractions"]}
    fetchItems={() => tractionsService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Tracción"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
