import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BrainCircuit,
  CarFront,
  Check,
  CircleAlert,
  CircleDollarSign,
  CloudOff,
  ImageIcon,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteResourceDialog } from "@/components/dynamic-table/deleteResourceDialog";
import { FormDialog } from "@/components/dynamic-table/formDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

import { SubscriptionPlanForm } from "./forms/subscriptionPlanForm";
import {
  billingPlansService,
  type FeatureCatalogItem,
  type PlanEntitlement,
  type PlanPrice,
  type PlanVersion,
  type SubscriptionPlan,
} from "./services/billingPlansService";

interface SubscriptionPlansOverviewProps {
  plans: SubscriptionPlan[];
  onDataChange: () => void;
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  index: number;
  version: PlanVersion | null;
  versionLoading: boolean;
  versionError: boolean;
  featureCatalog: FeatureCatalogItem[];
  syncing: boolean;
  onEdit: (id: string) => void;
  onSync: (plan: SubscriptionPlan) => Promise<void>;
  onDelete: () => void;
}

const entitlement_highlights = [
  { feature: "vehicles", label: "Vehículos", icon: CarFront },
  { feature: "photos_per_vehicle", label: "Fotos / vehículo", icon: ImageIcon },
  { feature: "videos_per_vehicle", label: "Vídeos / vehículo", icon: Video },
  { feature: "users", label: "Usuarios", icon: Users },
  { feature: "ai_requests", label: "Consultas IA", icon: BrainCircuit },
  { feature: "featured_listings", label: "Destacados", icon: Star },
] as const;

const interval_labels: Record<PlanPrice["interval"], string> = {
  month: "/ mes",
  year: "/ año",
  one_time: "pago único",
};

const formatMoney = (price: PlanPrice) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: price.currency?.toUpperCase() || "EUR",
    minimumFractionDigits: 2,
  }).format(price.amount_cents / 100);

const pickPrimaryPrice = (prices: PlanPrice[] = []) => {
  const active_prices = prices.filter((price) => price.is_active !== false);
  return (
    active_prices.find((price) => price.interval === "month") ??
    active_prices.find((price) => price.interval === "year") ??
    active_prices[0] ??
    null
  );
};

const entitlementValue = (entitlement?: PlanEntitlement) => {
  if (!entitlement) {
    return "—";
  }
  if (entitlement.value_type === "unlimited") {
    return "Ilimitado";
  }
  if (entitlement.value_type === "boolean") {
    return "bool" in entitlement.value && entitlement.value.bool ? "Sí" : "No";
  }
  return "limit" in entitlement.value
    ? new Intl.NumberFormat("es-ES").format(entitlement.value.limit)
    : "—";
};

const isEntitlementEnabled = (entitlement: PlanEntitlement) => {
  if (entitlement.value_type === "unlimited") {
    return true;
  }
  if (entitlement.value_type === "boolean") {
    return "bool" in entitlement.value && entitlement.value.bool;
  }
  return "limit" in entitlement.value && entitlement.value.limit > 0;
};

const PlanCard = ({
  plan,
  index,
  version,
  versionLoading,
  versionError,
  featureCatalog,
  syncing,
  onEdit,
  onSync,
  onDelete,
}: PlanCardProps) => {
  const primary_price = pickPrimaryPrice(plan.prices);
  const entitlement_map = new Map(
    (version?.entitlements ?? []).map((item) => [item.feature, item]),
  );
  const feature_label_map = new Map(
    featureCatalog.map((item) => [item.feature, item.label]),
  );
  const enabled_entitlements = (version?.entitlements ?? []).filter(
    isEntitlementEnabled,
  );
  const expected_count = featureCatalog.length;
  const entitlement_count = version?.entitlements?.length ?? 0;
  const capabilities_complete =
    Boolean(version) &&
    (expected_count === 0 || entitlement_count === expected_count);
  const active_prices = plan.prices?.filter(
    (price) => price.is_active !== false,
  ).length ?? 0;
  const issues = [
    !plan.is_active ? "Plan fuera del catálogo" : null,
    !primary_price ? "Sin precio activo" : null,
    versionError ? "No se pudo consultar la versión publicada" : null,
    !version && !versionLoading && !versionError ? "Sin versión publicada" : null,
    version && !capabilities_complete ? "Capacidades incompletas" : null,
    !plan.stripe_product_id ? "Pendiente de sincronizar con Stripe" : null,
  ].filter(Boolean) as string[];

  return (
    <Card
      className={cn(
        "relative h-full transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        plan.is_featured && "border-primary/40 shadow-sm",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          plan.is_featured ? "bg-primary" : "bg-muted",
        )}
        aria-hidden="true"
      />

      <CardHeader>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <span>Plan {String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true">·</span>
          <span>Orden {plan.sort_order}</span>
        </div>
        <CardTitle className="mt-2 text-xl font-semibold">{plan.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10 leading-relaxed">
          {plan.description || "Sin descripción comercial."}
        </CardDescription>
        <CardAction className="flex max-w-40 flex-wrap justify-end gap-1.5">
          <Badge variant={plan.is_active ? "default" : "secondary"}>
            {plan.is_active ? "Activo" : "Inactivo"}
          </Badge>
          {plan.is_featured ? (
            <Badge variant="outline">
              <Sparkles data-icon="inline-start" />
              Destacado
            </Badge>
          ) : null}
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Precio principal
            </p>
            {primary_price ? (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-heading text-3xl font-semibold tabular-nums tracking-tight">
                  {formatMoney(primary_price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {interval_labels[primary_price.interval]}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-lg font-medium text-muted-foreground">
                Sin precio configurado
              </p>
            )}
          </div>
          {active_prices > 1 ? (
            <Badge variant="secondary">{active_prices} tarifas</Badge>
          ) : null}
        </div>

        <Separator />

        {versionLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entitlement_highlights.map(({ feature }) => (
              <Skeleton key={feature} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entitlement_highlights.map(({ feature, label, icon: Icon }) => (
              <div
                key={feature}
                className="rounded-lg border bg-muted/20 p-3"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </div>
                <p className="mt-2 text-base font-semibold tabular-nums">
                  {entitlementValue(entitlement_map.get(feature))}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Capacidades activas
            </p>
            <span className="text-xs tabular-nums text-muted-foreground">
              {enabled_entitlements.length}/{entitlement_count || expected_count || 0}
            </span>
          </div>
          <div className="flex min-h-12 flex-wrap content-start gap-1.5">
            {enabled_entitlements.length ? (
              enabled_entitlements.slice(0, 6).map((entitlement) => (
                <Badge key={entitlement.feature} variant="outline">
                  <Check data-icon="inline-start" />
                  {feature_label_map.get(entitlement.feature) ?? entitlement.feature}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No hay capacidades activas.
              </span>
            )}
            {enabled_entitlements.length > 6 ? (
              <Badge variant="secondary">
                +{enabled_entitlements.length - 6} más
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-auto grid gap-2 rounded-lg bg-muted/25 p-3 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-2">
            {version && !versionError ? (
              <BadgeCheck className="text-primary" aria-hidden="true" />
            ) : (
              <CircleAlert className="text-destructive" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">
                {versionError
                  ? "Consulta no disponible"
                  : version
                    ? `Versión ${version.version} publicada`
                    : "Sin publicación"}
              </p>
              <p className="text-muted-foreground">
                {entitlement_count} capacidades configuradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {plan.stripe_product_id ? (
              <BadgeCheck className="text-primary" aria-hidden="true" />
            ) : (
              <CloudOff className="text-muted-foreground" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {plan.stripe_product_id ? "Stripe conectado" : "Stripe pendiente"}
              </p>
              <p className="truncate text-muted-foreground">
                {plan.stripe_product_id || "Sin product ID"}
              </p>
            </div>
          </div>
        </div>

        {issues.length ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <CircleAlert className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
            <p>{issues.join(" · ")}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BadgeCheck className="text-primary" aria-hidden="true" />
            <p>Configuración completa y lista para vender.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t bg-muted/15">
        <Button className="flex-1" onClick={() => onEdit(plan.id)}>
          <Pencil data-icon="inline-start" />
          Ver y editar
        </Button>
        <Button
          variant="outline"
          disabled={syncing}
          onClick={() => void onSync(plan)}
        >
          <RefreshCw data-icon="inline-start" />
          {syncing ? "Sincronizando…" : "Sincronizar"}
        </Button>
        <DeleteResourceDialog
          resource_id={plan.id}
          onSuccess={onDelete}
          deleteFn={billingPlansService.delete}
          title="Eliminar plan"
          description={`¿Estás seguro de querer eliminar “${plan.name}”?`}
          successToast="Plan eliminado correctamente"
          errorToast="Error al eliminar el plan"
        />
      </CardFooter>
    </Card>
  );
};

export const SubscriptionPlansOverview = ({
  plans,
  onDataChange,
}: SubscriptionPlansOverviewProps) => {
  const set_selected_id = useSelectedIdStore((state) => state.setSelectedId);
  const set_dialog_open = useFormDialogStore((state) => state.setIsOpen);
  const [syncing_id, set_syncing_id] = useState<string | null>(null);

  const { data: feature_catalog = [] } = useQuery({
    queryKey: ["billing-feature-catalog"],
    queryFn: () => billingPlansService.getFeatureCatalog(),
  });

  const version_queries = useQueries({
    queries: plans.map((plan) => ({
      queryKey: ["subscription-plan-entitlements", plan.id],
      queryFn: () => billingPlansService.getEntitlements(plan.id),
      staleTime: 30_000,
    })),
  });

  const versions_by_plan = useMemo(
    () =>
      new Map(
        plans.map((plan, index) => [
          plan.id,
          version_queries[index]?.data?.data ?? null,
        ]),
      ),
    [plans, version_queries],
  );

  const openPlanForm = (id: string | null) => {
    set_selected_id(id);
    set_dialog_open(true);
  };

  const syncPlan = async (plan: SubscriptionPlan) => {
    set_syncing_id(plan.id);
    try {
      const response = await billingPlansService.syncStripe(plan.id);
      if (!response.ok) {
        toast.error(response.message || "No se pudo sincronizar el plan");
        return;
      }
      toast.success(`${plan.name} sincronizado con Stripe`);
      onDataChange();
    } catch {
      toast.error("No se pudo conectar con Stripe");
    } finally {
      set_syncing_id(null);
    }
  };

  const active_count = plans.filter((plan) => plan.is_active).length;
  const stripe_count = plans.filter((plan) => plan.stripe_product_id).length;
  const published_count = plans.filter((plan) =>
    versions_by_plan.has(plan.id) && versions_by_plan.get(plan.id),
  ).length;
  const configured_count = plans.filter((plan) => {
    const version = versions_by_plan.get(plan.id);
    const entitlement_count = version?.entitlements?.length ?? 0;
    return (
      Boolean(pickPrimaryPrice(plan.prices)) &&
      Boolean(version) &&
      (feature_catalog.length === 0 || entitlement_count === feature_catalog.length)
    );
  }).length;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="relative overflow-hidden rounded-2xl border bg-card px-6 py-7 shadow-xs sm:px-8">
        <div
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Layers3 aria-hidden="true" />
              Catálogo comercial
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Planes de suscripción
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Controla precios, publicación, capacidades y sincronización con Stripe desde una sola vista.
            </p>
          </div>
          <Button size="lg" onClick={() => openPlanForm(null)}>
            <Plus data-icon="inline-start" />
            Crear nuevo plan
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de planes">
        {[
          {
            label: "Planes activos",
            value: `${active_count}/${plans.length}`,
            detail: "Visibles para contratación",
            icon: Layers3,
          },
          {
            label: "Versiones publicadas",
            value: `${published_count}/${plans.length}`,
            detail: "Entitlements disponibles",
            icon: BadgeCheck,
          },
          {
            label: "Conectados a Stripe",
            value: `${stripe_count}/${plans.length}`,
            detail: "Productos sincronizados",
            icon: CircleDollarSign,
          },
          {
            label: "Configuración completa",
            value: `${configured_count}/${plans.length}`,
            detail: "Precio y capacidades listos",
            icon: configured_count === plans.length ? Check : CircleAlert,
          },
        ].map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardAction>
                <Icon className="text-primary" aria-hidden="true" />
              </CardAction>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Oferta actual</h2>
          <p className="text-sm text-muted-foreground">
            {plans.length} {plans.length === 1 ? "plan configurado" : "planes configurados"}
          </p>
        </div>
        <Badge variant="outline">
          <RefreshCw data-icon="inline-start" />
          Datos del catálogo
        </Badge>
      </div>

      {plans.length ? (
        <section className="grid items-stretch gap-5 xl:grid-cols-2" aria-label="Planes configurados">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              version={versions_by_plan.get(plan.id) ?? null}
              versionLoading={version_queries[index]?.isLoading ?? false}
              versionError={
                (version_queries[index]?.isError ?? false) ||
                version_queries[index]?.data?.ok === false
              }
              featureCatalog={feature_catalog}
              syncing={syncing_id === plan.id}
              onEdit={(id) => openPlanForm(id)}
              onSync={syncPlan}
              onDelete={onDataChange}
            />
          ))}
        </section>
      ) : (
        <Card className="border-dashed py-16 text-center">
          <CardHeader>
            <CardTitle>No hay planes de suscripción</CardTitle>
            <CardDescription>
              Crea el primer plan para comenzar a configurar precios y capacidades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => openPlanForm(null)}>
              <Plus data-icon="inline-start" />
              Crear primer plan
            </Button>
          </CardContent>
        </Card>
      )}

      <FormDialog form={<SubscriptionPlanForm />} size="9xl" hideCreateButton />
    </div>
  );
};
