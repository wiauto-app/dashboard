import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const planContactLeadColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Teléfono",
    accessorKey: "phone",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Origen",
    accessorKey: "source",
    type: "badge",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Estado",
    accessorKey: "status_label",
    type: "badge",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Fecha",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
];
