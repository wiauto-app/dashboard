import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const appraisalRequestsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Vehículo",
    accessorKey: "vehicle_label",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Contacto",
    accessorKey: "contact_label",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Prioridad",
    accessorKey: "priority_label",
    type: "badge",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Kilometraje",
    accessorKey: "mileage",
    type: "number",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Ubicación",
    accessorKey: "address",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Estado",
    accessorKey: "status",
    type: "badge",
    sortable: true,
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
