import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const fuelTypesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "ID combustible",
    accessorKey: "fuel_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Puede cargar",
    accessorKey: "can_charge",
    type: "boolean",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Slug",
    accessorKey: "slug",
    type: "text",
    sortable: true,
    modifiable: false,
  },
];
