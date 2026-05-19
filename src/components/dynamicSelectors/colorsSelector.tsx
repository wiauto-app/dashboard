import { colorsService } from "@/components/vehicles/services/colorsService";
import type { ColorCatalogItem } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const ColorsSelector = ({
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
  <CatalogResourceSelector<ColorCatalogItem>
    queryKey={["colors"]}
    fetchItems={() => colorsService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Color"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => `${item.name} (${item.hex_code})`}
  />
);
