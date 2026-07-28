import { Link } from "@tanstack/react-router";
import {
  Calculator,
  Car,
  Flag,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionItem {
  label: string;
  to: string;
  search?: Record<string, string>;
  icon: LucideIcon;
  description: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    label: "Anuncios",
    to: "/vehicles",
    icon: Car,
    description: "Inventario y moderación",
  },
  {
    label: "Usuarios",
    to: "/users",
    icon: Users,
    description: "Gestión de cuentas",
  },
  {
    label: "Tasaciones",
    to: "/tasaciones",
    search: { status: "pending" },
    icon: Calculator,
    description: "Responder solicitudes",
  },
  {
    label: "Denuncias",
    to: "/reports",
    search: { status: "open" },
    icon: Flag,
    description: "Moderación abierta",
  },
  {
    label: "Mensajes",
    to: "/messages",
    icon: MessageSquare,
    description: "Bandeja de chat",
  },
  {
    label: "Planes",
    to: "/subscription-plans",
    icon: ShieldCheck,
    description: "Planes y billing",
  },
];

export const DashboardQuickActions = () => {
  return (
    <Card size="sm" className="border-brand-mist/80 shadow-none">
      <CardHeader className="border-b border-brand-mist/60">
        <CardTitle className="text-brand-ink">Atajos rápidos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Accesos frecuentes del día a día administrativo.
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto justify-start gap-3 px-3 py-3 text-left"
              render={
                <Link
                  to={action.to}
                  search={action.search}
                  aria-label={action.label}
                />
              }
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-mist text-brand-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-brand-ink">
                  {action.label}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
