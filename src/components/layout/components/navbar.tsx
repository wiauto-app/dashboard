import { useRouterState } from "@tanstack/react-router";
import { breadcrumbs } from "../breadcrumbs.constants";
import { RoutesBreadcrumbs } from "./routesBreadcrumbs";
import { Notifications } from "./notifications";
import { Info } from "./info";
import { UserDropdown } from "./userDropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Navbar = () => {
  const { location } = useRouterState()
  return (
    <header className="flex items-center justify-between p-4 lg:p-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <RoutesBreadcrumbs items={breadcrumbs[location.pathname] ?? []} />
      </div>
      <div className="flex items-center gap-2">
        <Info />
        <Notifications />
        <UserDropdown />
      </div>
    </header>
  );
};
