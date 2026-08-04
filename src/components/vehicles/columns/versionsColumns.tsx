import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const versionsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "ID marca",
    accessorKey: "make_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "ID modelo",
    accessorKey: "model_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "ID carrocería",
    accessorKey: "body_type_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "ID combustible",
    accessorKey: "fuel_type_id",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "ID año",
    accessorKey: "year_id",
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
