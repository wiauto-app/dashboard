import { HomeIcon, type LucideIcon } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  icon?: LucideIcon;
  href: string;
}

const home_item: BreadcrumbItem = {
  label: "Inicio",
  icon: HomeIcon,
  href: "/",
};

const with_home = (label: string, href: string): BreadcrumbItem[] => [
  home_item,
  { label, href },
];

const vehicle_admin_parent: BreadcrumbItem = {
  label: "Administración de vehículos",
  href: "/vehicles",
};

const vehicle_admin_trail = (
  label: string,
  href: string,
): BreadcrumbItem[] => [home_item, vehicle_admin_parent, { label, href }];

const support_admin_parent: BreadcrumbItem = {
  label: "Soporte",
  href: "/tickets",
};

const support_admin_trail = (
  label: string,
  href: string,
): BreadcrumbItem[] => [home_item, support_admin_parent, { label, href }];

const reports_admin_parent: BreadcrumbItem = {
  label: "Denuncias",
  href: "/reports",
};

const reports_admin_trail = (
  label: string,
  href: string,
): BreadcrumbItem[] => [home_item, reports_admin_parent, { label, href }];

export const breadcrumbs: Record<string, BreadcrumbItem[]> = {
  "/": [{ label: "Dashboard", icon: HomeIcon, href: "/" }],
  "/users": with_home("Usuarios", "/users"),
  "/permissions": with_home("Permisos", "/permissions"),
  "/role": with_home("Roles", "/role"),
  "/dealership": with_home("Concesionarios", "/dealership"),
  "/moderation": with_home("Moderación", "/moderation"),
  "/about": with_home("Acerca", "/about"),
  "/vehicles": vehicle_admin_trail("Anuncios", "/vehicles"),
  "/categories": vehicle_admin_trail("Categorías", "/categories"),
  "/features": vehicle_admin_trail("Características", "/features"),
  "/cuotas": vehicle_admin_trail("Cuotas", "/cuotas"),
  "/tractions": vehicle_admin_trail("Tracciones", "/tractions"),
  "/vehicle-types": vehicle_admin_trail("Tipos de vehículo", "/vehicle-types"),
  "/colors": vehicle_admin_trail("Colores", "/colors"),
  "/dgt-labels": vehicle_admin_trail("Etiquetas DGT", "/dgt-labels"),
  "/warranty-types": vehicle_admin_trail("Tipos de garantía", "/warranty-types"),
  "/catalog-services": vehicle_admin_trail("Servicios", "/catalog-services"),
  "/tickets": support_admin_trail("Tickets", "/tickets"),
  "/ticket-categories": support_admin_trail(
    "Categorías de ticket",
    "/ticket-categories",
  ),
  "/reports": reports_admin_trail("Denuncias", "/reports"),
  "/report-categories": reports_admin_trail(
    "Categorías de denuncia",
    "/report-categories",
  ),
  "/profile/config": with_home("Configuración", "/profile/config"),
};
