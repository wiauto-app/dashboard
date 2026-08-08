import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { assistantCreditPackColumns } from "@/components/billing/columns/assistantCreditPackColumns";
import { assistantCreditPackActions } from "@/components/billing/actions/assistantCreditPackActions";
import { AssistantCreditPackForm } from "@/components/billing/forms/assistantCreditPackForm";
import {
  assistantCreditPacksService,
  type AssistantCreditPack,
} from "@/components/billing/services/assistantCreditPacksService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/assistant-credit-packs")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    assistantCreditPacksService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<AssistantCreditPack>;
  const rows = data?.data ?? [];
  const invalidate_data = useInvalidateData(
    "/_authenticated/assistant-credit-packs",
  );

  return (
    <DynamicTable
      table_id="assistant-credit-packs"
      columns={assistantCreditPackColumns}
      data={rows}
      title="Consultas del asistente"
      route={Route}
      total={data?.total ?? 0}
      form_size="lg"
      actions={(row) => assistantCreditPackActions(row, invalidate_data)}
      form={<AssistantCreditPackForm />}
    />
  );
}
