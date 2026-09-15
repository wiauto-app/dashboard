import { SubscriptionPlansOverview } from "@/components/billing/subscriptionPlansOverview";
import { billingPlansService } from "@/components/billing/services/billingPlansService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import type { PaginatedResult } from "@/types/general.types";
import type { SubscriptionPlan } from "@/components/billing/services/billingPlansService";

export const Route = createFileRoute("/_authenticated/subscription-plans")({
  component: RouteComponent,
  loader: async () => billingPlansService.findAll({ page: 1, limit: 100 }),
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<SubscriptionPlan>;
  const rows = data?.data ?? [];
  const invalidate_data = useInvalidateData("/_authenticated/subscription-plans");

  return (
    <SubscriptionPlansOverview plans={rows} onDataChange={invalidate_data} />
  );
}
