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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouterState } from "@tanstack/react-router";
import { ChevronLeft, Gauge, Info, LogOut, Users } from "lucide-react";
import { SidebarItem } from "./components/sidebarItem";
import { BrandIcon } from "@/assets/brandIcon";
import { Button } from "../ui/button";

const navItems = [
  { to: "/" as const, label: "Inicio", icon: Gauge },
  { to: "/users" as const, label: "Usuarios", icon: Users },
  { to: "/about" as const, label: "Acerca", icon: Info },
];

const route_is_active = (pathname: string, to: string) =>
  to === "/" ? pathname === "/" : pathname === to;

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
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
            <Button className="text-white " size="icon" onClick={toggleSidebar}>
              <ChevronLeft className="size-5"/>
            </Button>
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
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = route_is_active(pathname, to);
                return (
                  <SidebarItem
                    key={to}
                    to={to}
                    Icon={Icon}
                    props={{ isActive, tooltip: label }}
                  >
                    {label}
                  </SidebarItem>
                  // <SidebarMenuItem key={to}>
                  //   <SidebarMenuButton
                  //     render={<Link to={to} onClick={handleNavClick} />}
                  //     isActive={isActive}
                  //     tooltip={label}
                  //     className={cn(
                  //       "text-brand-ink/90 data-active:bg-background data-active:text-brand-ink data-active:shadow-[inset_3px_0_0_var(--brand-primary)]",
                  //     )}
                  //   >
                  //     <Icon aria-hidden />
                  //     <span>{label}</span>
                  //   </SidebarMenuButton>
                  // </SidebarMenuItem>
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
