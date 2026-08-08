import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  CreditCard,
  Layers,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import {
  billingPlansService,
  type SubscriptionPlan,
} from "../services/billingPlansService";
import {
  PlanEntitlementsFields,
  buildDefaultEntitlementsState,
  entitlementsStateToPayload,
  type EntitlementsFormState,
} from "./planEntitlementsFields";
import { Textarea } from "@/components/ui/textarea";

const centsToEuros = (amount_cents: number) => amount_cents / 100;

const eurosToCents = (amount_euros: number) => Math.round(amount_euros * 100);

interface PlanFormValues {
  name: string;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  prices: Array<{
    interval: "month" | "year" | "one_time";
    amount_euros: number;
    currency: string;
    is_active: boolean;
  }>;
  features: Array<{
    label: string;
    description: string;
    included: boolean;
    sort_order: number;
  }>;
}

interface PlanSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const PlanSection = ({
  title,
  description,
  children,
  className,
  action,
}: PlanSectionProps) => (
  <section
    className={cn(
      "space-y-4 rounded-xl border bg-muted/30 p-4 md:p-5",
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const default_values: PlanFormValues = {
  name: "",
  description: "",
  is_active: true,
  is_featured: false,
  sort_order: 0,
  prices: [{ interval: "month", amount_euros: 0, currency: "eur", is_active: true }],
  features: [{ label: "", description: "", included: true, sort_order: 0 }],
};

const formatPublishedAt = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const SubscriptionPlanForm = () => {
  const selected_id = useSelectedIdStore((state) => state.selectedId);
  const set_is_open = useFormDialogStore((state) => state.setIsOpen);
  const set_selected_id = useSelectedIdStore((state) => state.setSelectedId);

  const { data: plan_response } = useQuery({
    queryKey: ["subscription-plan", selected_id],
    queryFn: () => billingPlansService.findOne(selected_id ?? ""),
    enabled: !!selected_id,
  });

  const { data: feature_catalog = [] } = useQuery({
    queryKey: ["billing-feature-catalog"],
    queryFn: () => billingPlansService.getFeatureCatalog(),
  });

  const { data: versions_response, refetch: refetch_versions } = useQuery({
    queryKey: ["subscription-plan-versions", selected_id],
    queryFn: () => billingPlansService.listVersions(selected_id ?? ""),
    enabled: !!selected_id,
  });

  const form = useForm<PlanFormValues>({ defaultValues: default_values });
  const prices_field = useFieldArray({ control: form.control, name: "prices" });
  const features_field = useFieldArray({ control: form.control, name: "features" });
  const [entitlements_state, set_entitlements_state] =
    useState<EntitlementsFormState>({});
  const [marketing_open, set_marketing_open] = useState(false);
  const [is_saving, set_is_saving] = useState(false);
  const [is_publishing, set_is_publishing] = useState(false);
  const [is_syncing, set_is_syncing] = useState(false);

  const versions = versions_response?.data ?? [];
  const draft_version = versions.find((version) => version.status === "draft");
  const published_version = versions.find(
    (version) => version.status === "published",
  );
  const published_at_label = formatPublishedAt(published_version?.published_at);

  useEffect(() => {
    const plan = plan_response?.data as SubscriptionPlan | undefined;
    if (!plan) {
      form.reset(default_values);
      set_marketing_open(false);
      return;
    }

    const has_marketing = Boolean(
      plan.features?.some((feature) => feature.label.trim()),
    );
    set_marketing_open(has_marketing);

    form.reset({
      name: plan.name,
      description: plan.description ?? "",
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
      prices:
        plan.prices?.length
          ? plan.prices.map((price) => ({
              interval: price.interval,
              amount_euros: centsToEuros(price.amount_cents),
              currency: price.currency ?? "eur",
              is_active: price.is_active ?? true,
            }))
          : default_values.prices,
      features:
        plan.features?.length
          ? plan.features.map((feature, index) => ({
              label: feature.label,
              description: feature.description ?? "",
              included: feature.included ?? true,
              sort_order: feature.sort_order ?? index,
            }))
          : default_values.features,
    });
  }, [plan_response, form, selected_id]);

  useEffect(() => {
    if (feature_catalog.length === 0) {
      return;
    }

    const versions = versions_response?.data ?? [];
    const draft = versions.find((version) => version.status === "draft");
    const published = versions.find((version) => version.status === "published");
    const source = draft ?? published;

    set_entitlements_state(
      buildDefaultEntitlementsState(feature_catalog, source?.entitlements),
    );
  }, [feature_catalog, versions_response, selected_id]);

  const buildPayload = (values: PlanFormValues) => {
    return {
      name: values.name,
      description: values.description || null,
      billing_type: "recurring" as const,
      is_active: values.is_active,
      is_featured: values.is_featured,
      sort_order: values.sort_order,
      prices: values.prices
        .filter((price) => price.amount_euros > 0)
        .map((price) => ({
          interval: price.interval,
          amount_cents: eurosToCents(price.amount_euros),
          currency: price.currency || "eur",
          is_active: price.is_active,
        })),
      features: values.features.filter((feature) => feature.label.trim()),
    };
  };

  const handleSaveEntitlements = async (plan_id: string) => {
    if (feature_catalog.length === 0) {
      return true;
    }

    const draft_response = await billingPlansService.ensureDraft(plan_id);
    if (!draft_response.ok) {
      toast.error(
        draft_response.message ||
          "El plan se guardó, pero no se pudo crear la versión borrador",
      );
      return false;
    }

    const entitlements = entitlementsStateToPayload(
      feature_catalog,
      entitlements_state,
    );
    const entitlements_response =
      await billingPlansService.replaceDraftEntitlements(plan_id, entitlements);

    if (!entitlements_response.ok) {
      toast.error(
        entitlements_response.message ||
          "El plan se guardó, pero no se pudieron guardar las capacidades",
      );
      return false;
    }

    return true;
  };

  const handlePublish = async (plan_id: string) => {
    set_is_publishing(true);
    try {
      const entitlements_ok = await handleSaveEntitlements(plan_id);
      if (!entitlements_ok) {
        return false;
      }

      const publish_response = await billingPlansService.publishPlan(plan_id);
      if (!publish_response.ok) {
        toast.error(publish_response.message || "No se pudo publicar la versión");
        return false;
      }

      toast.success("Versión publicada");
      await refetch_versions();
      return true;
    } finally {
      set_is_publishing(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    set_is_saving(true);
    try {
      const payload = buildPayload(values);
      const response = selected_id
        ? await billingPlansService.update({ id: selected_id, ...payload })
        : await billingPlansService.create(payload);

      if (!response.ok) {
        toast.error(response.message || "Error al guardar el plan");
        return;
      }

      const plan_id = response.data?.id ?? selected_id;
      if (!plan_id) {
        toast.error("No se pudo obtener el identificador del plan");
        return;
      }

      const entitlements_ok = await handleSaveEntitlements(plan_id);
      if (!entitlements_ok) {
        return;
      }

      toast.success(selected_id ? "Plan actualizado" : "Plan creado");
      set_is_open(false);
      set_selected_id(null);
      window.location.reload();
    } finally {
      set_is_saving(false);
    }
  });

  const handleSaveAndPublish = form.handleSubmit(async (values) => {
    set_is_saving(true);
    try {
      const payload = buildPayload(values);
      const response = selected_id
        ? await billingPlansService.update({ id: selected_id, ...payload })
        : await billingPlansService.create(payload);

      if (!response.ok) {
        toast.error(response.message || "Error al guardar el plan");
        return;
      }

      const plan_id = response.data?.id ?? selected_id;
      if (!plan_id) {
        toast.error("No se pudo obtener el identificador del plan");
        return;
      }

      const published = await handlePublish(plan_id);
      if (!published) {
        return;
      }

      toast.success(
        selected_id
          ? "Plan actualizado y versión publicada"
          : "Plan creado y versión publicada",
      );
      set_is_open(false);
      set_selected_id(null);
      window.location.reload();
    } finally {
      set_is_saving(false);
    }
  });

  const handleSaveEntitlementsOnly = async () => {
    if (!selected_id) {
      toast.error("Guarda el plan antes de guardar solo las capacidades");
      return;
    }

    set_is_saving(true);
    try {
      const ok = await handleSaveEntitlements(selected_id);
      if (!ok) {
        return;
      }
      toast.success("Capacidades guardadas en borrador");
      await refetch_versions();
    } finally {
      set_is_saving(false);
    }
  };

  const handleSyncStripe = async () => {
    if (!selected_id) {
      toast.error("Guarda el plan antes de sincronizar con Stripe");
      return;
    }

    set_is_syncing(true);
    try {
      const response = await billingPlansService.syncStripe(selected_id);
      if (!response.ok) {
        toast.error(response.message || "Error al sincronizar con Stripe");
        return;
      }
      toast.success("Plan sincronizado con Stripe");
    } finally {
      set_is_syncing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-h-[80vh] flex-col gap-0 overflow-hidden"
    >
      <div className="flex-1 space-y-5 overflow-y-auto pr-1 pb-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <PlanSection
            title="Identidad y visibilidad"
            description="Nombre, descripción y cómo aparece el plan en el catálogo."
          >
            <div className="grid gap-3">
              <Field>
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  {...form.register("name", { required: true })}
                  placeholder="Plan Profesional"
                  aria-label="Nombre del plan"
                />
              </Field>
              <Field>
                <FieldLabel>Descripción</FieldLabel>
                <Textarea
                  {...form.register("description")}
                  placeholder="Resumen corto para el catálogo"
                  aria-label="Descripción del plan"
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Orden</FieldLabel>
                  <Input
                    type="number"
                    {...form.register("sort_order", { valueAsNumber: true })}
                    aria-label="Orden de visualización"
                  />
                </Field>
                <div className="flex flex-col justify-end gap-3 rounded-lg border bg-background px-3 py-2">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm">Activo</span>
                    <Switch
                      checked={form.watch("is_active")}
                      onCheckedChange={(checked) =>
                        form.setValue("is_active", !!checked)
                      }
                      aria-label="Plan activo"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm">Destacado</span>
                    <Switch
                      checked={form.watch("is_featured")}
                      onCheckedChange={(checked) =>
                        form.setValue("is_featured", !!checked)
                      }
                      aria-label="Plan destacado"
                    />
                  </label>
                </div>
              </div>
            </div>
          </PlanSection>
        </div>

        <PlanSection
          title="Precios"
          description="Importes en euros. Sincroniza con Stripe cuando el plan ya exista."
          action={
            selected_id ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncStripe}
                disabled={is_syncing}
                aria-label="Sincronizar con Stripe"
              >
                <CreditCard className="size-3.5" />
                {is_syncing ? "Sincronizando…" : "Sync Stripe"}
              </Button>
            ) : null
          }
        >
          <div className="space-y-3">
            {prices_field.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-2 rounded-lg border bg-background p-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <Field>
                  <FieldLabel>Intervalo</FieldLabel>
                  <Controller
                    control={form.control}
                    name={`prices.${index}.interval`}
                    render={({ field: price_field }) => (
                      <Select
                        value={price_field.value}
                        onValueChange={price_field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Mensual</SelectItem>
                          <SelectItem value="year">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>Precio (€)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="9,99"
                    {...form.register(`prices.${index}.amount_euros`, {
                      valueAsNumber: true,
                      min: 0,
                    })}
                    aria-label={`Precio ${index + 1}`}
                  />
                </Field>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => prices_field.remove(index)}
                    aria-label={`Quitar precio ${index + 1}`}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                prices_field.append({
                  interval: "month",
                  amount_euros: 0,
                  currency: "eur",
                  is_active: true,
                })
              }
            >
              Añadir precio
            </Button>
          </div>
        </PlanSection>

        <PlanSection
          title="Capacidades"
          description="Esto define lo que puede hacer el suscriptor. Se guarda en la versión borrador y se aplica al publicar."
          className="border-primary/20"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {draft_version ? (
                <Badge variant="outline">Borrador v{draft_version.version}</Badge>
              ) : null}
              {published_version ? (
                <Badge variant="secondary">
                  Publicado v{published_version.version}
                  {published_at_label ? ` · ${published_at_label}` : ""}
                </Badge>
              ) : (
                <Badge variant="outline">Sin versión publicada</Badge>
              )}
            </div>
          }
        >
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="size-3.5" />
            Catálogo tipado de entitlements (límites, toggles e ilimitado)
          </div>
          <PlanEntitlementsFields
            catalog={feature_catalog}
            value={entitlements_state}
            onChange={set_entitlements_state}
          />
        </PlanSection>

        <section className="rounded-xl border bg-muted/30">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-4 text-left md:px-5"
            onClick={() => set_marketing_open((open) => !open)}
            aria-expanded={marketing_open}
            aria-label="Mostrar u ocultar texto en tarjetas"
            tabIndex={0}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-muted-foreground" />
                <h3 className="text-sm font-semibold tracking-tight">
                  Texto en tarjetas
                </h3>
                <Badge variant="outline">Marketing</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy opcional de las cards. No confundir con las capacidades del
                plan.
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                marketing_open && "rotate-180",
              )}
            />
          </button>

          {marketing_open ? (
            <div className="space-y-3 border-t px-4 pb-4 pt-3 md:px-5">
              {features_field.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border bg-background p-3 md:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <Input
                    placeholder="Etiqueta"
                    {...form.register(`features.${index}.label`)}
                    aria-label={`Etiqueta marketing ${index + 1}`}
                  />
                  <Input
                    placeholder="Descripción"
                    {...form.register(`features.${index}.description`)}
                    aria-label={`Descripción marketing ${index + 1}`}
                  />
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={form.watch(`features.${index}.included`)}
                      onCheckedChange={(checked) =>
                        form.setValue(`features.${index}.included`, !!checked)
                      }
                    />
                    Incluido
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => features_field.remove(index)}
                    aria-label={`Quitar característica ${index + 1}`}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  features_field.append({
                    label: "",
                    description: "",
                    included: true,
                    sort_order: features_field.fields.length,
                  })
                }
              >
                Añadir característica
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-2 border-t bg-background/95 px-1 pt-3 backdrop-blur supports-backdrop-filter:bg-background/80">
        <Button type="submit" disabled={is_saving || is_publishing}>
          {is_saving ? "Guardando…" : "Guardar plan"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={is_saving || is_publishing}
          onClick={handleSaveAndPublish}
        >
          {is_publishing ? "Publicando…" : "Guardar y publicar"}
        </Button>
        {selected_id ? (
          <Button
            type="button"
            variant="outline"
            disabled={is_saving || is_publishing}
            onClick={handleSaveEntitlementsOnly}
          >
            Guardar borrador de capacidades
          </Button>
        ) : null}
        {form.formState.errors.root ? (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        ) : null}
      </div>
    </form>
  );
};
