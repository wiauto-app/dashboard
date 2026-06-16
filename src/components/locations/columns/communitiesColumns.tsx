import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const communitiesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Imagen",
    accessorKey: "image_url",
    type: "image",
    sortable: false,
    modifiable: true,
    bucketName: "files",
    image_upload_path: "communities",
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
    header: "Cód. CCAA",
    accessorKey: "cod_ccaa",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Nombre oficial",
    accessorKey: "noml_ccaa",
    type: "text",
    sortable: true,
    modifiable: false,
  },
];
