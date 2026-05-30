import { ticketCategoriesService } from "@/components/support/services/ticketCategoriesService";
import type { TicketCategoryItem } from "@/components/support/types/ticket-category.types";
import { CatalogResourceSelector } from "./catalogResourceSelector";

export const TicketCategoriesSelector = ({
  onValueChange,
  value,
  ariaInvalid,
  disabled,
}: {
  onValueChange: (value: string | undefined) => void;
  value?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
}) => (
  <CatalogResourceSelector<TicketCategoryItem>
    queryKey={["ticket-categories"]}
    fetchItems={() => ticketCategoriesService.findAll({ page: 1, limit: 100 })}
    value={value}
    onValueChange={onValueChange}
    placeholder="Categoría"
    ariaInvalid={ariaInvalid}
    disabled={disabled}
    getItemValue={(item) => item.id}
    getItemLabel={(item) => item.name}
  />
);
