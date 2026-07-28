import { Link } from "@tanstack/react-router";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminDashboardMetricDelta } from "./types/admin-dashboard.types";
import {
  computeDeltaPercent,
  formatDashboardNumber,
  formatDeltaPercent,
  isPositiveDelta,
} from "./utils/dashboard.utils";

interface DashboardKpiCardProps {
  label: string;
  metric: AdminDashboardMetricDelta;
  icon: LucideIcon;
  to?: string;
  search?: Record<string, string>;
  hint?: string;
  invertDelta?: boolean;
  showDelta?: boolean;
}

export const DashboardKpiCard = ({
  label,
  metric,
  icon: Icon,
  to,
  search,
  hint,
  invertDelta = false,
  showDelta = true,
}: DashboardKpiCardProps) => {
  const deltaPercent = computeDeltaPercent(metric);
  const isUp = isPositiveDelta(metric);
  const isFavorable = invertDelta ? !isUp : isUp;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  const content = (
    <Card
      size="sm"
      className={cn(
        "h-full border-brand-mist/80 shadow-none transition-colors",
        to && "hover:border-brand-sky/50 hover:bg-brand-mist/30",
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4 text-brand-primary" aria-hidden />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="font-sans text-3xl font-semibold tracking-tight text-brand-ink">
            {formatDashboardNumber(metric.current)}
          </p>
          {showDelta ? (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isFavorable ? "text-emerald-600" : "text-red-500",
              )}
            >
              <TrendIcon className="size-3" aria-hidden />
              <span>{formatDeltaPercent(deltaPercent)}</span>
            </p>
          ) : null}
        </div>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!to) return content;

  return (
    <Link
      to={to}
      search={search}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-sky"
      aria-label={`Ver ${label}`}
      tabIndex={0}
    >
      {content}
    </Link>
  );
};
