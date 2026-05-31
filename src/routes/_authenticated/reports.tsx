import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { reportsActions } from "@/components/reports/actions/reportsActions";
import { reportsColumns } from "@/components/reports/columns/reportsColumns";
import { ReportsFilter } from "@/components/reports/filters/reportsFilters";
import { ReportForm } from "@/components/reports/forms/reportForm";
import {
  reportsParamsSchema,
  type ReportsParams,
} from "@/components/reports/schemas/reports-params.schema";
import { reportsService } from "@/components/reports/services/reportsService";
import type { ReportListItem } from "@/components/reports/types/report.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/reports")({
  component: RouteComponent,
  validateSearch: reportsParamsSchema,
  loader: async ({ deps }: { deps: ReportsParams }) =>
    reportsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<ReportListItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/reports");
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  return (
    <DynamicTable
      table_id="reports"
      columns={reportsColumns}
      data={rows}
      title="Denuncias"
      route={Route}
      total={data?.total ?? 0}
      filters={<ReportsFilter />}
      form={
        <ReportForm
          key={selectedId ?? "create"}
          onSuccess={invalidateData}
        />
      }
      form_size="2xl"
      actions={(row) => reportsActions(row, invalidateData)}
    />
  );
}
