import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/authProvider";
import { GlobalSignInDialog } from "@/stores/useSignInDialogStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={0}>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AuthProvider>
            {children}
            <GlobalSignInDialog />
          </AuthProvider>
        </SidebarProvider>
      </TooltipProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
};
