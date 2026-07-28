import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calculator,
  Car,
  Flag,
  MessageSquare,
  RefreshCw,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { CHAT_QUERY_KEYS } from "@/components/chat/context/chatSocketContext";
import { chatService } from "@/components/chat/services/chatService";
import { DateRangeSelector } from "@/components/date-range-selector/DateRangeSelector";
import { Button } from "@/components/ui/button";
import { adminDashboardService } from "./services/adminDashboardService";
import { DashboardCommercialSection } from "./DashboardCommercialSection";
import { DashboardHomeSkeleton } from "./DashboardHomeSkeleton";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardQueuesSection } from "./DashboardQueuesSection";
import { DashboardTrendsChart } from "./DashboardTrendsChart";
import {
  DEFAULT_ADMIN_DASHBOARD_RANGE_DAYS,
  formatTodayLabel,
  getAdminDashboardDateRangeError,
  getDefaultAdminDashboardDateRange,
  isValidAdminDashboardDateRange,
} from "./utils/dashboard.utils";

export const AdminDashboardHome = () => {
  const defaultRange = getDefaultAdminDashboardDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const dateRangeError = getAdminDashboardDateRangeError(startDate, endDate);
  const isDateRangeValid = isValidAdminDashboardDateRange(startDate, endDate);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-dashboard", startDate, endDate],
    queryFn: () =>
      adminDashboardService.getOverview({ startDate, endDate }),
    enabled: isDateRangeValid,
  });

  const { data: unreadData } = useQuery({
    queryKey: CHAT_QUERY_KEYS.unreadTotal,
    queryFn: () => chatService.getUnreadTotal(),
    refetchInterval: 30_000,
  });

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
  };

  if (isLoading && isDateRangeValid) {
    return <DashboardHomeSkeleton />;
  }

  if ((isError || !data) && isDateRangeValid) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-brand-mist bg-white px-6 py-16 text-center"
        role="alert"
      >
        <AlertCircle className="size-10 text-destructive" aria-hidden />
        <div className="space-y-1">
          <h1 className="font-sans text-xl font-semibold text-brand-ink">
            No se pudo cargar el panel
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Ha ocurrido un error al obtener el resumen administrativo."}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void refetch()}
          aria-label="Reintentar carga del panel"
        >
          <RefreshCw className="size-4" aria-hidden />
          Reintentar
        </Button>
      </div>
    );
  }

  const unreadTotal = unreadData?.total ?? 0;
  const periodDays = data?.period.days ?? DEFAULT_ADMIN_DASHBOARD_RANGE_DAYS;
  const periodHint = `vs ${periodDays} días anteriores`;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-ink">
            Centro de mando
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            Hoy · {formatTodayLabel()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            error={dateRangeError}
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void refetch()}
            disabled={isFetching || !isDateRangeValid}
            aria-label="Actualizar panel"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
              aria-hidden
            />
          </Button>
        </div>
      </header>

      {!data ? (
        <DashboardHomeSkeleton />
      ) : (
        <>
          <section
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
            aria-label="Indicadores de salud"
          >
            <DashboardKpiCard
              label="Anuncios activos"
              metric={data.kpis.activeVehicles}
              icon={Car}
              to="/vehicles"
              search={{ status: "active" }}
              hint={periodHint}
            />
            <DashboardKpiCard
              label="Pendientes de revisión"
              metric={data.kpis.pendingVehicles}
              icon={Car}
              to="/vehicles"
              search={{ status: "pending" }}
              hint={periodHint}
              invertDelta
            />
            <DashboardKpiCard
              label="Usuarios nuevos"
              metric={data.kpis.newUsers}
              icon={Users}
              to="/users"
              hint={periodHint}
            />
            <DashboardKpiCard
              label="Leads de contacto"
              metric={data.kpis.leads}
              icon={MessageSquare}
              hint={periodHint}
            />
            <DashboardKpiCard
              label="Suscripciones activas"
              metric={data.kpis.activeSubscriptions}
              icon={Wallet}
              to="/subscription-plans"
              hint={periodHint}
            />
            <DashboardKpiCard
              label="Mensajes sin leer"
              metric={{ current: unreadTotal, previous: unreadTotal }}
              icon={MessageSquare}
              to="/messages"
              hint="Tiempo real · bandeja admin"
              showDelta={false}
            />
          </section>

          <section
            className="grid gap-4 xl:grid-cols-2"
            aria-label="Colas y tendencias"
          >
            <DashboardQueuesSection
              items={[
                {
                  key: "pendingVehicles",
                  label: "Anuncios por aprobar",
                  count: data.queues.pendingVehicles,
                  to: "/vehicles",
                  search: { status: "pending" },
                  icon: Car,
                },
                {
                  key: "openReports",
                  label: "Denuncias abiertas",
                  count: data.queues.openReports,
                  to: "/reports",
                  search: { status: "open" },
                  icon: Flag,
                },
                {
                  key: "pendingAppraisals",
                  label: "Tasaciones pendientes",
                  count: data.queues.pendingAppraisals,
                  to: "/tasaciones",
                  search: { status: "pending" },
                  icon: Calculator,
                  badgeLabel:
                    data.queues.highPriorityAppraisals > 0
                      ? `${data.queues.highPriorityAppraisals} alta prioridad`
                      : undefined,
                  badgeTone: "destructive",
                },
                {
                  key: "planLeadRequests",
                  label: "Solicitudes de planes",
                  count: data.queues.planLeadRequests,
                  to: "/plan-lead-requests",
                  icon: Wallet,
                },
                {
                  key: "openTickets",
                  label: "Tickets abiertos",
                  count: data.queues.openTickets,
                  to: "/tickets",
                  search: { status: "open" },
                  icon: Ticket,
                },
              ]}
            />

            <DashboardTrendsChart
              timeSeries={data.timeSeries}
              inventoryByStatus={data.inventoryByStatus}
              granularity={data.period.granularity}
            />
          </section>

          <DashboardCommercialSection
            commercial={data.commercial}
            planLeadRequests={data.queues.planLeadRequests}
          />

          <DashboardQuickActions />
        </>
      )}
    </div>
  );
};

