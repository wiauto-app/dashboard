import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminDashboardGranularity,
  AdminDashboardTimeSeriesPoint,
} from "./types/admin-dashboard.types";
import {
  formatDashboardDate,
  formatDashboardNumber,
  getInventoryStatusLabel,
} from "./utils/dashboard.utils";

interface DashboardTrendsChartProps {
  timeSeries: AdminDashboardTimeSeriesPoint[];
  inventoryByStatus: Record<string, number>;
  granularity: AdminDashboardGranularity;
}

interface ChartTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
}

const SERIES = [
  { key: "newUsers", label: "Usuarios", color: "var(--chart-1)" },
  { key: "newVehicles", label: "Anuncios", color: "var(--chart-2)" },
  { key: "views", label: "Visitas", color: "var(--chart-3)" },
  { key: "impressions", label: "Impresiones", color: "var(--chart-5)" },
  { key: "leads", label: "Leads", color: "var(--chart-4)" },
] as const;

const ChartTooltipContent = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-brand-mist bg-white px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-brand-ink">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-4 text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden
              />
              {entry.name}
            </span>
            <span className="font-medium text-brand-ink">
              {formatDashboardNumber(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const DashboardTrendsChart = ({
  timeSeries,
  inventoryByStatus,
  granularity,
}: DashboardTrendsChartProps) => {
  const chartData = timeSeries.map((point) => ({
    ...point,
    label: formatDashboardDate(point.bucketStart),
  }));

  const inventoryEntries = Object.entries(inventoryByStatus).sort(
    (a, b) => b[1] - a[1],
  );
  const inventoryTotal = inventoryEntries.reduce(
    (sum, [, count]) => sum + count,
    0,
  );

  return (
    <Card size="sm" className="h-full border-brand-mist/80 shadow-none">
      <CardHeader className="border-b border-brand-mist/60">
        <CardTitle className="text-brand-ink">Tendencias</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución por {granularity === "week" ? "semana" : "día"}: altas,
          tráfico y leads.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        <div className="h-64 w-full min-w-0">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-brand-mist/30 text-sm text-muted-foreground">
              Sin datos de tendencia para este periodo
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  {SERIES.map((series) => (
                    <linearGradient
                      key={series.key}
                      id={`fill-${series.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={series.color}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={series.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--brand-mist)"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => (
                    <span className="text-muted-foreground">{value}</span>
                  )}
                />
                {SERIES.map((series) => (
                  <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stroke={series.color}
                    fill={`url(#fill-${series.key})`}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-brand-ink">
            Inventario por estado
          </p>
          {inventoryEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos de inventario</p>
          ) : (
            <ul className="space-y-2">
              {inventoryEntries.map(([status, count]) => {
                const percent =
                  inventoryTotal > 0
                    ? Math.round((count / inventoryTotal) * 100)
                    : 0;

                return (
                  <li key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {getInventoryStatusLabel(status)}
                      </span>
                      <span className="font-medium text-brand-ink">
                        {formatDashboardNumber(count)} · {percent}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-brand-mist"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${getInventoryStatusLabel(status)}: ${percent}%`}
                    >
                      <div
                        className="h-full rounded-full bg-brand-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
