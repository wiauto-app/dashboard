import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
export const SidebarItem = ({
  children,
  Icon,
  to,
  ...props
}: {
  children: React.ReactNode;
  Icon: LucideIcon;
  to: string;
  props?: React.ComponentProps<typeof SidebarMenuButton>;
}) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="text-white flex items-center gap-2 justify-between"
        {...props}
        render={<Link to={to} />}
      >
        <div className="flex items-center gap-5">
          <Icon />
          {children}
        </div>
        <ChevronRightIcon />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
