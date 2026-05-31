import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { reportCategoriesActions } from "@/components/reports/actions/reportCategoriesActions";
import { reportCategoriesColumns } from "@/components/reports/columns/reportCategoriesColumns";
import { ReportCategoryForm } from "@/components/reports/forms/reportCategoryForm";
import {
  reportsCatalogParamsSchema,
  type ReportsCatalogParams,
} from "@/components/reports/schemas/reports-catalog-params.schema";
import { reportCategoriesService } from "@/components/reports/services/reportCategoriesService";
import type { ReportCategoryItem } from "@/components/reports/types/report-category.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/report-categories")({
  component: RouteComponent,
  validateSearch: reportsCatalogParamsSchema,
  loader: async ({ deps }: { deps: ReportsCatalogParams }) =>
    reportCategoriesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<ReportCategoryItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/report-categories");
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  return (
    <DynamicTable
      table_id="report-categories"
      columns={reportCategoriesColumns}
      data={rows}
      title="Categorías de denuncia"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => reportCategoriesActions(row, invalidateData)}
      form={
        <ReportCategoryForm
          key={selectedId ?? "create"}
          onSuccess={invalidateData}
        />
      }
    />
  );
}
