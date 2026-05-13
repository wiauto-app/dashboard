import { HomeIcon, type LucideIcon } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  icon?: LucideIcon;
  href: string;
}

export const breadcrumbs: Record<string, BreadcrumbItem[]> = {
  "/users":[
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/",
    },
    {
      label: "Usuarios",
      href: "/users",
    }
  ]
}