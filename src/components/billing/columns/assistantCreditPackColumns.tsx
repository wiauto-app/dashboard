import type { DynamicTableColumn } from "@/components/dynamic-table/types";
import { defaultColumn } from "@/components/dynamic-table/defaultColumns";

export const assistantCreditPackColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Título",
    accessorKey: "title",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Consultas",
    accessorKey: "credits_quantity",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Importe (cents)",
    accessorKey: "amount_cents",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Activo",
    accessorKey: "is_active",
    type: "boolean",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Orden",
    accessorKey: "sort_order",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Stripe price",
    accessorKey: "stripe_price_id",
    type: "text",
    sortable: false,
    modifiable: false,
  },
];
