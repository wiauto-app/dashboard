import type { DynamicTableColumn } from "../dynamic-table/types";

export const vehiclesColumns: DynamicTableColumn[] = [
  //Identificación básica
  {
    header: "Title",
    accessorKey: "title",
    type: "text",
    sortable: true,
  },
  {
    header: "Status",
    accessorKey: "status",
    type: "badge",
    sortable: true,
  },
  {
    header: "Featured",
    accessorKey: "is_featured",
    type: "boolean",
    sortable: true,
  },
  //Precio y uso
  {
    header: "Price",
    accessorKey: "price",
    type: "text",
    sortable: true,
  },
  {
    header: "Mileage",
    accessorKey: "mileage",
    type: "text",
    sortable: true,
  },
  {
    header: "Views",
    accessorKey: "views",
    type: "text",
    sortable: true,
  },
  //Especificaciones del vehículo
  {
    header: "Transmission",
    accessorKey: "transmission_type",
    type: "text",
    sortable: false,
  },
  {
    header: "Power (HP)",
    accessorKey: "power",
    type: "text",
    sortable: false,
  },
  {
    header: "Displacement (cc)",
    accessorKey: "displacement",
    type: "text",
    sortable: false,
  },
  {
    header: "Condition",
    accessorKey: "condition",
    type: "badge",
    sortable: false,
  },
  {
    header: "Traction",
    accessorKey: "traction_id",
    type: "text",
    sortable: false,
  },

  //Eléctrico / híbrido (si aplica)

  {
    header: "Autonomy (km)",
    accessorKey: "autonomy",
    type: "text",
    sortable: false,
  },
  {
    header: "Battery Capacity",
    accessorKey: "battery_capacity",
    type: "text",
    sortable: false,
  },
  {
    header: "Charge Time",
    accessorKey: "time_to_charge",
    type: "text",
    sortable: false,
  },

  // Ubicación
  {
    header: "Latitude",
    accessorKey: "lat",
    type: "text",
    sortable: false,
  },
  {
    header: "Longitude",
    accessorKey: "lng",
    type: "text",
    sortable: false,
  },

  //Publicador / contacto

  {
    header: "Publisher Type",
    accessorKey: "publisher_type",
    type: "text",
    sortable: false,
  },
  {
    header: "Phone",
    accessorKey: "phone",
    type: "text",
    sortable: false,
  },
  {
    header: "Email",
    accessorKey: "email",
    type: "text",
    sortable: false,
  },

  //Extras útiles (opcionales
  {
    header: "License Plate",
    accessorKey: "license_plate",
    type: "text",
  },
  {
    header: "Version",
    accessorKey: "version_id",
    type: "text",
  },
];
