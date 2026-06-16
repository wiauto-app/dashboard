import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Car,
  ChevronDown,
  ChevronLeft,
  Flag,
  HomeIcon,
  Info,
  LifeBuoy,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  UserKey,
  Users,
} from "lucide-react";
import { SidebarItem } from "./components/sidebarItem";
import { MessagesNavBadge } from "./components/messagesNavBadge";
import { BrandIcon } from "@/assets/brandIcon";
import { cn } from "@/lib/utils";
import { useState, type ComponentProps } from "react";
import { IconButton } from "../ui/iconButton";

const dashboard_nav_item = {
  to: "/" as const,
  label: "Dashboard",
  icon: HomeIcon,
};

const rest_nav_items = [
  { to: "/users" as const, label: "Usuarios", icon: Users },
  { to: "/messages" as const, label: "Mensajes", icon: MessageCircle },
  { to: "/permissions" as const, label: "Permisos", icon: ShieldCheck },
  { to: "/dealership" as const, label: "Concesionarios", icon: Store },
  { to: "/role" as const, label: "Roles", icon: UserKey },
  { to: "/moderation" as const, label: "Moderación", icon: ShieldCheck },
  { to: "/about" as const, label: "Acerca", icon: Info },
] as const;

const vehicle_admin_children = [
  { to: "/vehicles" as const, label: "Anuncios" },
  { to: "/vehicle-types" as const, label: "Tipos de vehículo" },
  { to: "/categories" as const, label: "Categorías" },
  { to: "/features" as const, label: "Características" },
  { to: "/cuotas" as const, label: "Cuotas" },
  { to: "/tractions" as const, label: "Tracciones" },
  { to: "/colors" as const, label: "Colores" },
  { to: "/dgt-labels" as const, label: "Etiquetas DGT" },
  { to: "/warranty-types" as const, label: "Tipos de garantía" },
  { to: "/catalog-services" as const, label: "Servicios" },
] as const;

const support_admin_children = [
  { to: "/tickets" as const, label: "Tickets" },
  { to: "/ticket-categories" as const, label: "Categorías" },
] as const;

const locations_admin_children = [
  { to: "/provinces" as const, label: "Provincias" },
  { to: "/communities" as const, label: "Comunidades" },
  { to: "/municipalities" as const, label: "Municipios" },
] as const;

const reports_admin_children = [
  { to: "/reports" as const, label: "Denuncias" },
  { to: "/report-categories" as const, label: "Categorías" },
] as const;

const route_is_active = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

const is_vehicle_admin_section_active = (pathname: string) =>
  vehicle_admin_children.some(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );

const is_support_admin_section_active = (pathname: string) =>
  support_admin_children.some(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );

const is_locations_admin_section_active = (pathname: string) =>
  locations_admin_children.some(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );

const is_reports_admin_section_active = (pathname: string) =>
  reports_admin_children.some(
    ({ to }) => pathname === to || pathname.startsWith(`${to}/`),
  );

const VehicleAdministrationNav = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(
    () => is_vehicle_admin_section_active(pathname),
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const parent_active = is_vehicle_admin_section_active(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={handleToggle}
        isActive={parent_active}
        tooltip="Administración de vehículos"
        className="text-white flex items-center gap-2 justify-between"
        aria-expanded={open}
        aria-controls="sidebar-vehicle-admin-sub"
      >
        <div className="flex items-center gap-5">
          <Car aria-hidden />
          <span>Administración de vehículos</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub id="sidebar-vehicle-admin-sub">
          {vehicle_admin_children.map(({ to, label }) => (
            <SidebarMenuSubItem key={to}>
              <SidebarMenuSubButton
                className="text-white hover:text-muted-foreground data-active:text-black data-active:bg-brand-mist"
                render={<Link to={to} />}
                isActive={route_is_active(pathname, to)}
              >
                <span>{label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};

const SupportNav = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(
    () => is_support_admin_section_active(pathname),
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const parent_active = is_support_admin_section_active(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={handleToggle}
        isActive={parent_active}
        tooltip="Soporte"
        className="text-white flex items-center gap-2 justify-between"
        aria-expanded={open}
        aria-controls="sidebar-support-admin-sub"
      >
        <div className="flex items-center gap-5">
          <LifeBuoy aria-hidden />
          <span>Soporte</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub id="sidebar-support-admin-sub">
          {support_admin_children.map(({ to, label }) => (
            <SidebarMenuSubItem key={to}>
              <SidebarMenuSubButton
                className="text-white hover:text-muted-foreground data-active:text-black data-active:bg-brand-mist"
                render={<Link to={to} />}
                isActive={route_is_active(pathname, to)}
              >
                <span>{label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};

const LocationsNav = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(
    () => is_locations_admin_section_active(pathname),
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const parent_active = is_locations_admin_section_active(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={handleToggle}
        isActive={parent_active}
        tooltip="Ubicaciones"
        className="text-white flex items-center gap-2 justify-between"
        aria-expanded={open}
        aria-controls="sidebar-locations-admin-sub"
      >
        <div className="flex items-center gap-5">
          <MapPin aria-hidden />
          <span>Ubicaciones</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub id="sidebar-locations-admin-sub">
          {locations_admin_children.map(({ to, label }) => (
            <SidebarMenuSubItem key={to}>
              <SidebarMenuSubButton
                className="text-white hover:text-muted-foreground data-active:text-black data-active:bg-brand-mist"
                render={<Link to={to} />}
                isActive={route_is_active(pathname, to)}
              >
                <span>{label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};

const ReportsNav = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(
    () => is_reports_admin_section_active(pathname),
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const parent_active = is_reports_admin_section_active(pathname);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={handleToggle}
        isActive={parent_active}
        tooltip="Denuncias"
        className="text-white flex items-center gap-2 justify-between"
        aria-expanded={open}
        aria-controls="sidebar-reports-admin-sub"
      >
        <div className="flex items-center gap-5">
          <Flag aria-hidden />
          <span>Denuncias</span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </SidebarMenuButton>
      {open ? (
        <SidebarMenuSub id="sidebar-reports-admin-sub">
          {reports_admin_children.map(({ to, label }) => (
            <SidebarMenuSubItem key={to}>
              <SidebarMenuSubButton
                className="text-white hover:text-muted-foreground data-active:text-black data-active:bg-brand-mist"
                render={<Link to={to} />}
                isActive={route_is_active(pathname, to)}
              >
                <span>{label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
};

export const AppSidebar = ({
  ...props
}: ComponentProps<typeof Sidebar>) => {
  const { logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className=" ">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between relative">
            <SidebarMenuButton
              size="lg"
              className="pointer-events-none md:h-14"
            >
              <BrandIcon width={120} className="max-w-full" />
            </SidebarMenuButton>
            <IconButton text="Toggle Sidebar" variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronLeft className="size-5"/>
            </IconButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarItem
                key={dashboard_nav_item.to}
                to={dashboard_nav_item.to}
                Icon={dashboard_nav_item.icon}
                props={{
                  isActive: route_is_active(pathname, dashboard_nav_item.to),
                  tooltip: dashboard_nav_item.label,
                }}
              >
                {dashboard_nav_item.label}
              </SidebarItem>
              <VehicleAdministrationNav
                key={
                  is_vehicle_admin_section_active(pathname)
                    ? "vehicle-admin-in"
                    : "vehicle-admin-out"
                }
                pathname={pathname}
              />
              <SupportNav
                key={
                  is_support_admin_section_active(pathname)
                    ? "support-admin-in"
                    : "support-admin-out"
                }
                pathname={pathname}
              />
              <LocationsNav
                key={
                  is_locations_admin_section_active(pathname)
                    ? "locations-admin-in"
                    : "locations-admin-out"
                }
                pathname={pathname}
              />
              <ReportsNav
                key={
                  is_reports_admin_section_active(pathname)
                    ? "reports-admin-in"
                    : "reports-admin-out"
                }
                pathname={pathname}
              />
              {rest_nav_items.map(({ to, label, icon: Icon }) => {
                const isActive = route_is_active(pathname, to);
                return (
                  <SidebarItem
                    key={to}
                    to={to}
                    Icon={Icon}
                    props={{ isActive, tooltip: label }}
                  >
                    <span className="flex w-full items-center gap-2">
                      {label}
                      {to === "/messages" ? <MessagesNavBadge /> : null}
                    </span>
                  </SidebarItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar sesión"
              className="text-muted-foreground hover:bg-brand-mist hover:text-brand-ink"
            >
              <LogOut aria-hidden />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
