import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const bodyTypesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "ID carrocería",
    accessorKey: "body_type_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Puertas",
    accessorKey: "doors",
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
    header: "Slug",
    accessorKey: "slug",
    type: "text",
    sortable: true,
    modifiable: false,
  },
];
