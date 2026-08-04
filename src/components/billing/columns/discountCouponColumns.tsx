import type { DynamicTableColumn } from "@/components/dynamic-table/types";
import { defaultColumn } from "@/components/dynamic-table/defaultColumns";

export const discountCouponColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Código",
    accessorKey: "code",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "% dto.",
    accessorKey: "percent_off",
    type: "number",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Importe (cents)",
    accessorKey: "amount_off_cents",
    type: "number",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Canjes",
    accessorKey: "times_redeemed",
    type: "number",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Máx. canjes",
    accessorKey: "max_redemptions",
    type: "number",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Activo",
    accessorKey: "active",
    type: "boolean",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Caduca",
    accessorKey: "expires_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Creado",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
];
