import { dgtLabelsService } from "@/components/vehicles/services/dgtLabelsService";
import type { DgtLabelCatalogItem } from "@/components/vehicles/types/catalog.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const DgtLabelsSelector = ({
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
  <CatalogResourceSelector<DgtLabelCatalogItem>
    queryKey={["dgt-labels"]}
    fetchItems={() => dgtLabelsService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Etiqueta DGT"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => `${item.name} (${item.code})`}
  />
);
