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
  ],
  "/permissions":[
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/",
    },
    {
      label: "Permisos",
      href: "/permissions",
    }
  ],
  "/role":[
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/",
    },
    {
      label: "Roles",
      href: "/role",
    }
  ],
  "/dealership":[
    {
      label: "Inicio",
      icon: HomeIcon,
      href: "/",
    },
    {
      label: "Concesionarios",
      href: "/dealerships",
    }
  ]
}