import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/userAvatar";
import { useAuth } from "@/hooks/useAuth";

import type { AuthUser } from "@/types/auth.types";

const getDisplayName = (user?: AuthUser) => {
  const parts = [user?.name, user?.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Usuario";
};

export const UserDropdown = () => {
  const { logout, user, isLoading } = useAuth();
  const display_name = getDisplayName(user);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-transparent px-1 py-1">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="hidden h-4 w-24 rounded md:block" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto gap-2 rounded-full px-1.5 py-1 hover:bg-muted/80"
            aria-label="Menú de cuenta"
          >
            <UserAvatar className="size-8" />
            <div className="flex flex-col items-start">
              <span className="hidden max-w-36 truncate text-sm font-medium md:inline">
                {display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-0 font-normal">
          <div className="flex items-start gap-3 px-2 py-2.5">
            <UserAvatar className="size-10" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold leading-none">
                {display_name}
              </p>
              {user?.email ? (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/messages" />}>
          <MessageCircle className="size-4" />
          <span>Mensajes</span>
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link to="/profile/config" />}>
          <Settings className="size-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
