import { Link } from "@tanstack/react-router";
import { CheckCircle2, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDashboardNumber } from "./utils/dashboard.utils";

interface QueueItemConfig {
  key: string;
  label: string;
  count: number;
  to: string;
  search?: Record<string, string>;
  icon: LucideIcon;
  badgeLabel?: string;
  badgeTone?: "default" | "destructive";
}

interface DashboardQueuesSectionProps {
  items: QueueItemConfig[];
}

export const DashboardQueuesSection = ({
  items,
}: DashboardQueuesSectionProps) => {
  return (
    <Card size="sm" className="h-full border-brand-mist/80 shadow-none">
      <CardHeader className="border-b border-brand-mist/60">
        <CardTitle className="text-brand-ink">Colas de atención</CardTitle>
        <p className="text-sm text-muted-foreground">
          Trabajo pendiente para hoy. Cada fila enlaza al módulo correspondiente.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-4">
        {items.map((item) => {
          const isClear = item.count === 0;
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                isClear
                  ? "border-transparent bg-brand-mist/25"
                  : "border-brand-mist bg-white",
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  isClear ? "bg-white text-emerald-600" : "bg-brand-mist text-brand-primary",
                )}
              >
                {isClear ? (
                  <CheckCircle2 className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-brand-ink">
                    {item.label}
                  </p>
                  {item.badgeLabel && !isClear ? (
                    <Badge
                      variant={
                        item.badgeTone === "destructive"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.badgeLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isClear
                    ? "Al día"
                    : `${formatDashboardNumber(item.count)} pendientes`}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    to={item.to}
                    search={item.search}
                    aria-label={`Ver ${item.label}`}
                  />
                }
              >
                Ver
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
