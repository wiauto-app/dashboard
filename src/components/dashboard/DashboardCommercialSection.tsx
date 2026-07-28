import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardCommercial } from "./types/admin-dashboard.types";
import {
  formatDashboardNumber,
  getSubscriptionStatusLabel,
} from "./utils/dashboard.utils";

interface DashboardCommercialSectionProps {
  commercial: AdminDashboardCommercial;
  planLeadRequests: number;
}

export const DashboardCommercialSection = ({
  commercial,
  planLeadRequests,
}: DashboardCommercialSectionProps) => {
  const appraisalsTotal =
    commercial.appraisalsResolved + commercial.appraisalsPending;
  const resolutionRatio =
    appraisalsTotal > 0
      ? Math.round((commercial.appraisalsResolved / appraisalsTotal) * 100)
      : 0;

  const subscriptionEntries = Object.entries(
    commercial.subscriptionsByStatus,
  ).sort((a, b) => b[1] - a[1]);

  return (
    <Card size="sm" className="border-brand-mist/80 shadow-none">
      <CardHeader className="border-b border-brand-mist/60">
        <CardTitle className="text-brand-ink">Snapshot comercial</CardTitle>
        <p className="text-sm text-muted-foreground">
          Suscripciones, tasaciones y solicitudes de planes en el periodo.
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 pt-4 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-ink">
            Solicitudes de planes
          </p>
          <p className="font-sans text-3xl font-semibold text-brand-ink">
            {formatDashboardNumber(planLeadRequests)}
          </p>
          <p className="text-xs text-muted-foreground">
            En cola o recientes (según overview)
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-ink">
            Suscripciones por estado
          </p>
          {subscriptionEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          ) : (
            <ul className="space-y-2">
              {subscriptionEntries.map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {getSubscriptionStatusLabel(status)}
                  </span>
                  <span className="font-medium text-brand-ink">
                    {formatDashboardNumber(count)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-ink">Tasaciones</p>
          <div className="flex items-baseline gap-2">
            <p className="font-sans text-3xl font-semibold text-brand-ink">
              {resolutionRatio}%
            </p>
            <span className="text-xs text-muted-foreground">resueltas</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Respondidas</p>
              <p className="font-medium text-brand-ink">
                {formatDashboardNumber(commercial.appraisalsResolved)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pendientes</p>
              <p className="font-medium text-brand-ink">
                {formatDashboardNumber(commercial.appraisalsPending)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
