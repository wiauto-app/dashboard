import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const municipalitiesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Imagen",
    accessorKey: "image_url",
    type: "image",
    sortable: false,
    modifiable: true,
    bucketName: "files",
    image_upload_path: "municipalities",
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
  {
    header: "Código INE",
    accessorKey: "ineCode",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "NUTS1",
    accessorKey: "nuts1",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "NUTS2",
    accessorKey: "nuts2",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "NUTS3",
    accessorKey: "nuts3",
    type: "text",
    sortable: true,
    modifiable: false,
  },
];
