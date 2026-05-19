import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const colorsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Hexadecimal",
    accessorKey: "hex_code",
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
  {
    header: "Creado",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Actualizado",
    accessorKey: "updated_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
];
