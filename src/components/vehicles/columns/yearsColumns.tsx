import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const yearsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Año",
    accessorKey: "year",
    type: "number",
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
