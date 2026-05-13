import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { AppSidebar } from "./appSidebar";
import { Navbar } from "./components/navbar";
import { cn } from "@/lib/utils";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { open } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }
    void navigate({ to: "/signIn/", replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div
        className="auth-app-shell flex min-h-screen items-center justify-center bg-background"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-brand-mist border-t-brand-primary motion-safe:animate-spin" />
          <span className="sr-only">Cargando sesión</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AppSidebar variant="sidebar" className="" />
      <div
        className={cn(
          "flex flex-1 flex-col",
          !open ? "" : " sidebar-background ",
        )}
      >
        <div className="@container/main flex flex-1 flex-col gap-2 bg-background rounded-3xl">
          <Navbar />
          <main className=" p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
};
