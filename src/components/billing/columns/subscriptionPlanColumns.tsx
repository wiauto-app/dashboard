import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const subscriptionPlanColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Slug",
    accessorKey: "slug",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Audiencia",
    accessorKey: "audience",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Tipo",
    accessorKey: "billing_type",
    type: "text",
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
    header: "Destacado",
    accessorKey: "is_featured",
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
];
