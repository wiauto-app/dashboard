import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const modelsColumns: DynamicTableColumn[] = [
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
