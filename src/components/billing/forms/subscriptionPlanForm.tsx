import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CarFront,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

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

type WizardStep = 0 | 1 | 2 | 3;
type SavePhase = "plan" | "capabilities" | "stripe" | null;

const wizard_steps = [
  {
    label: "Identidad",
    description: "Nombre y visibilidad",
    icon: FileText,
  },
  {
    label: "Precios",
    description: "Facturación",
    icon: CircleDollarSign,
  },
  {
    label: "Capacidades",
    description: "Límites y accesos",
    icon: Layers,
  },
  {
    label: "Revisar",
    description: "Guardar y sincronizar",
    icon: BadgeCheck,
  },
] as const;

const default_values: PlanFormValues = {
  name: "",
  description: "",
  is_active: true,
  is_featured: false,
  sort_order: 0,
  prices: [
    {
      interval: "month",
      amount_euros: 0,
      currency: "eur",
      is_active: true,
    },
  ],
  features: [
    {
      label: "",
      description: "",
      included: true,
      sort_order: 0,
    },
  ],
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount || 0);

const interval_labels: Record<PlanFormValues["prices"][number]["interval"], string> = {
  month: "Mensual",
  year: "Anual",
  one_time: "Pago único",
};

const getSaveLabel = (phase: SavePhase) => {
  if (phase === "capabilities") {
    return "Guardando capacidades…";
  }
  if (phase === "stripe") {
    return "Sincronizando con Stripe…";
  }
  if (phase === "plan") {
    return "Guardando plan…";
  }
  return "Guardar y sincronizar";
};

interface SectionHeadingProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const SectionHeading = ({ title, description, action }: SectionHeadingProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
    {action}
  </div>
);

interface StepperProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

const PlanWizardStepper = ({ currentStep, onStepChange }: StepperProps) => (
  <nav aria-label="Progreso del formulario" className="overflow-x-auto px-4 sm:px-7">
    <ol className="mx-auto flex min-w-[43rem] max-w-5xl items-center py-3">
      {wizard_steps.map((step, index) => {
        const StepIcon = step.icon;
        const is_active = index === currentStep;
        const is_complete = index < currentStep;

        return (
          <li key={step.label} className="flex flex-1 items-center last:flex-none">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-auto gap-3 rounded-xl px-2 py-2 text-left",
                is_active && "bg-primary/5 text-primary",
              )}
              onClick={() => onStepChange(index as WizardStep)}
              aria-current={is_active ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-semibold",
                  is_active && "border-primary bg-primary text-primary-foreground",
                  is_complete && "border-primary bg-primary/10 text-primary",
                )}
              >
                {is_complete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{step.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {step.description}
                </span>
              </span>
              <StepIcon className="sr-only" aria-hidden="true" />
            </Button>
            {index < wizard_steps.length - 1 ? (
              <span
                className={cn(
                  "mx-3 h-px flex-1 bg-border",
                  is_complete && "bg-primary/50",
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  </nav>
);

interface SummaryCardProps {
  values: PlanFormValues;
  entitlements: EntitlementsFormState;
  capabilityCount: number;
  currentStep: WizardStep;
}

const PlanSummaryCard = ({
  values,
  entitlements,
  capabilityCount,
  currentStep,
}: SummaryCardProps) => {
  const monthly_price = values.prices.find(
    (price) => price.interval === "month" && price.amount_euros > 0,
  );
  const annual_price = values.prices.find(
    (price) => price.interval === "year" && price.amount_euros > 0,
  );
  const unlimited_count = Object.values(entitlements).filter(
    (entry) => entry.value_type === "unlimited",
  ).length;
  const included_count = Object.values(entitlements).filter(
    (entry) => entry.value_type === "boolean" && entry.bool,
  ).length;

  return (
    <Card className="gap-5 border-border/80 bg-card shadow-sm xl:sticky xl:top-0">
      <CardHeader>
        <CardTitle>Resumen del plan</CardTitle>
        <CardDescription>
          Se actualiza mientras completas el formulario.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CarFront className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold">
                {values.name.trim() || "Plan sin nombre"}
              </p>
              <Badge variant={values.is_active ? "default" : "secondary"}>
                {values.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {values.description.trim() || "Añade una descripción para el catálogo."}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {monthly_price ? formatPrice(monthly_price.amount_euros) : "Precio pendiente"}
            {monthly_price ? (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / mes
              </span>
            ) : null}
          </p>
          {annual_price ? (
            <p className="mt-1 text-sm text-muted-foreground">
              o {formatPrice(annual_price.amount_euros)} / año
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 divide-x rounded-xl border py-3 text-center">
          <div className="px-2">
            <p className="font-semibold tabular-nums">{capabilityCount}</p>
            <p className="text-[11px] text-muted-foreground">capacidades</p>
          </div>
          <div className="px-2">
            <p className="font-semibold tabular-nums">{unlimited_count}</p>
            <p className="text-[11px] text-muted-foreground">ilimitadas</p>
          </div>
          <div className="px-2">
            <p className="font-semibold tabular-nums">{included_count}</p>
            <p className="text-[11px] text-muted-foreground">incluidas</p>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-3 text-primary">
          <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">
              {currentStep === 3 ? "Listo para sincronizar" : "Sincronización automática"}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Guardar crea o actualiza el producto y sus precios en Stripe.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t">
        <p className="text-xs text-muted-foreground">
          El plan seguirá siendo editable después de guardarlo.
        </p>
      </CardFooter>
    </Card>
  );
};

export const SubscriptionPlanForm = () => {
  const selected_id = useSelectedIdStore((state) => state.selectedId);
  const is_dialog_open = useFormDialogStore((state) => state.isOpen);
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

  const { data: versions_response } = useQuery({
    queryKey: ["subscription-plan-versions", selected_id],
    queryFn: () => billingPlansService.listVersions(selected_id ?? ""),
    enabled: !!selected_id,
  });

  const form = useForm<PlanFormValues>({ defaultValues: default_values });
  const prices_field = useFieldArray({ control: form.control, name: "prices" });
  const features_field = useFieldArray({ control: form.control, name: "features" });
  const values = useWatch({ control: form.control }) as PlanFormValues;

  const [current_step, set_current_step] = useState<WizardStep>(0);
  const [entitlements_state, set_entitlements_state] =
    useState<EntitlementsFormState>({});
  const [marketing_open, set_marketing_open] = useState(false);
  const [save_phase, set_save_phase] = useState<SavePhase>(null);

  const is_saving = save_phase !== null;
  const capability_count = feature_catalog.length;

  useEffect(() => {
    if (!is_dialog_open) {
      return;
    }
    // Every opening starts at identity, independently of the previous session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    set_current_step(0);
  }, [is_dialog_open]);

  useEffect(() => {
    const plan = plan_response?.data as SubscriptionPlan | undefined;
    if (!plan) {
      form.reset(default_values);
      // Hydrate the disclosure state alongside the query-backed form reset.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      set_marketing_open(false);
      return;
    }

    const has_marketing = Boolean(
      plan.features?.some((feature) => feature.label.trim()),
    );
    // Hydrate the disclosure state alongside the query-backed form reset.
    set_marketing_open(has_marketing);

    form.reset({
      name: plan.name,
      description: plan.description ?? "",
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
      prices: plan.prices?.length
        ? plan.prices.map((price) => ({
            interval: price.interval,
            amount_euros: centsToEuros(price.amount_cents),
            currency: price.currency ?? "eur",
            is_active: price.is_active ?? true,
          }))
        : default_values.prices,
      features: plan.features?.length
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

    // The entitlement editor is intentionally hydrated from the latest version.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    set_entitlements_state(
      buildDefaultEntitlementsState(feature_catalog, source?.entitlements),
    );
  }, [feature_catalog, versions_response, selected_id]);

  const enabled_capabilities = useMemo(
    () =>
      feature_catalog.filter((item) => {
        const entry = entitlements_state[item.feature];
        return item.value_type === "boolean"
          ? Boolean(entry?.bool)
          : entry?.value_type === "unlimited" || (entry?.limit ?? 0) > 0;
      }),
    [entitlements_state, feature_catalog],
  );

  const buildPayload = (form_values: PlanFormValues) => ({
    name: form_values.name,
    description: form_values.description || null,
    billing_type: "recurring" as const,
    is_active: form_values.is_active,
    is_featured: form_values.is_featured,
    sort_order: form_values.sort_order,
    prices: form_values.prices
      .filter((price) => price.amount_euros > 0)
      .map((price) => ({
        interval: price.interval,
        amount_cents: eurosToCents(price.amount_euros),
        currency: price.currency || "eur",
        is_active: price.is_active,
      })),
    features: form_values.features.filter((feature) => feature.label.trim()),
  });

  const saveEntitlements = async (plan_id: string) => {
    if (feature_catalog.length === 0) {
      return true;
    }

    set_save_phase("capabilities");
    const draft_response = await billingPlansService.ensureDraft(plan_id);
    if (!draft_response.ok) {
      toast.error(
        draft_response.message ||
          "El plan se guardó, pero no se pudo preparar sus capacidades",
      );
      return false;
    }

    const entitlements = entitlementsStateToPayload(
      feature_catalog,
      entitlements_state,
    );
    const response = await billingPlansService.replaceDraftEntitlements(
      plan_id,
      entitlements,
    );

    if (!response.ok) {
      toast.error(
        response.message ||
          "El plan se guardó, pero no se pudieron guardar sus capacidades",
      );
      return false;
    }

    return true;
  };

  const saveAndSync = form.handleSubmit(async (form_values) => {
    if (!form_values.prices.some((price) => Number(price.amount_euros) > 0)) {
      set_current_step(1);
      toast.error("Añade al menos un precio mayor que cero");
      return;
    }

    set_save_phase("plan");
    try {
      const payload = buildPayload(form_values);
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

      const entitlements_ok = await saveEntitlements(plan_id);
      if (!entitlements_ok) {
        return;
      }

      set_save_phase("stripe");
      const stripe_response = await billingPlansService.syncStripe(plan_id);
      if (!stripe_response.ok) {
        toast.error(
          stripe_response.message ||
            "El plan se guardó, pero no se pudo sincronizar con Stripe",
        );
        return;
      }

      toast.success(
        selected_id
          ? "Plan actualizado y sincronizado con Stripe"
          : "Plan creado y sincronizado con Stripe",
      );
      set_is_open(false);
      set_selected_id(null);
      window.location.reload();
    } catch {
      toast.error("No se pudo guardar y sincronizar el plan");
    } finally {
      set_save_phase(null);
    }
  });

  const moveToStep = async (next_step: WizardStep) => {
    if (next_step <= current_step) {
      set_current_step(next_step);
      return;
    }

    if (next_step > 0) {
      const identity_valid = await form.trigger(["name"]);
      if (!identity_valid) {
        toast.error("Añade el nombre del plan antes de continuar");
        return;
      }
    }

    if (next_step > 1) {
      const has_price = form
        .getValues("prices")
        .some((price) => Number(price.amount_euros) > 0);
      if (!has_price) {
        toast.error("Añade al menos un precio mayor que cero");
        return;
      }
    }

    set_current_step(next_step);
  };

  const goNext = () => {
    if (current_step < 3) {
      void moveToStep((current_step + 1) as WizardStep);
    }
  };

  const goBack = () => {
    if (current_step > 0) {
      set_current_step((current_step - 1) as WizardStep);
    }
  };

  const renderIdentityStep = () => (
    <Card className="gap-6 shadow-none">
      <CardHeader>
        <CardTitle>Identidad y visibilidad</CardTitle>
        <CardDescription>
          Define cómo se presenta este plan en el catálogo y quién puede contratarlo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-5">
          <Field data-invalid={Boolean(form.formState.errors.name)}>
            <FieldLabel htmlFor="plan-name">Nombre del plan</FieldLabel>
            <Input
              id="plan-name"
              {...form.register("name", {
                required: "El nombre del plan es obligatorio",
              })}
              placeholder="Plan Profesional"
              aria-invalid={Boolean(form.formState.errors.name)}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="plan-description">Descripción</FieldLabel>
              <span className="text-xs tabular-nums text-muted-foreground">
                {values.description.length} / 160
              </span>
            </div>
            <Textarea
              id="plan-description"
              {...form.register("description", { maxLength: 160 })}
              maxLength={160}
              className="min-h-24 resize-none"
              placeholder="Resume el valor del plan para el catálogo"
            />
            <FieldDescription>
              Explica en una frase para quién es el plan y qué beneficio ofrece.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="plan-sort-order">Orden en el catálogo</FieldLabel>
            <Input
              id="plan-sort-order"
              type="number"
              className="max-w-40 tabular-nums"
              {...form.register("sort_order", { valueAsNumber: true })}
            />
            <FieldDescription>
              Los números menores aparecen primero.
            </FieldDescription>
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field orientation="horizontal" className="rounded-xl border p-4">
              <FieldContent>
                <FieldTitle>Plan activo</FieldTitle>
                <FieldDescription>
                  Disponible para nuevas suscripciones.
                </FieldDescription>
              </FieldContent>
              <Switch
                checked={values.is_active}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", Boolean(checked), { shouldDirty: true })
                }
                aria-label="Plan activo"
              />
            </Field>

            <Field orientation="horizontal" className="rounded-xl border p-4">
              <FieldContent>
                <FieldTitle>Plan destacado</FieldTitle>
                <FieldDescription>
                  Aparece resaltado en el catálogo.
                </FieldDescription>
              </FieldContent>
              <Switch
                checked={values.is_featured}
                onCheckedChange={(checked) =>
                  form.setValue("is_featured", Boolean(checked), {
                    shouldDirty: true,
                  })
                }
                aria-label="Plan destacado"
              />
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );

  const renderPricesStep = () => (
    <Card className="gap-6 shadow-none">
      <CardHeader>
        <CardTitle>Precios y facturación</CardTitle>
        <CardDescription>
          Configura uno o más ciclos de cobro. Stripe se actualiza al guardar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-4">
          <CreditCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">Sincronización automática con Stripe</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Cada precio se crea o actualiza automáticamente cuando guardas el plan.
            </p>
          </div>
        </div>

        <FieldGroup className="gap-3">
          {prices_field.fields.map((price, index) => (
            <div
              key={price.id}
              className="grid gap-4 rounded-xl border bg-background p-4 lg:grid-cols-[minmax(11rem,0.8fr)_minmax(14rem,1fr)_auto] lg:items-end"
            >
              <Field>
                <FieldLabel>Intervalo</FieldLabel>
                <Controller
                  control={form.control}
                  name={`prices.${index}.interval`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="month">Mensual</SelectItem>
                          <SelectItem value="year">Anual</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`price-${index}`}>Precio</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={`price-${index}`}
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="49,00"
                    {...form.register(`prices.${index}.amount_euros`, {
                      valueAsNumber: true,
                      min: 0,
                    })}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>EUR</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <div className="flex items-center justify-between gap-3 lg:pb-0.5">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Switch
                    size="sm"
                    checked={values.prices[index]?.is_active ?? true}
                    onCheckedChange={(checked) =>
                      form.setValue(`prices.${index}.is_active`, Boolean(checked), {
                        shouldDirty: true,
                      })
                    }
                  />
                  Activo
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={prices_field.fields.length === 1}
                  onClick={() => prices_field.remove(index)}
                  aria-label={`Quitar precio ${index + 1}`}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </FieldGroup>

        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() =>
            prices_field.append({
              interval: prices_field.fields.some(
                (_, index) => values.prices[index]?.interval === "year",
              )
                ? "month"
                : "year",
              amount_euros: 0,
              currency: "eur",
              is_active: true,
            })
          }
        >
          <Plus data-icon="inline-start" />
          Añadir otro precio
        </Button>
      </CardContent>
    </Card>
  );

  const renderCapabilitiesStep = () => (
    <div className="flex flex-col gap-5">
      <Card className="gap-6 shadow-none">
        <CardHeader>
          <CardTitle>Capacidades del plan</CardTitle>
          <CardDescription>
            Define qué puede hacer el suscriptor mediante límites, acceso ilimitado o inclusión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanEntitlementsFields
            catalog={feature_catalog}
            value={entitlements_state}
            onChange={set_entitlements_state}
            variant="builder"
          />
        </CardContent>
      </Card>

      <Card className="gap-0 shadow-none">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between rounded-none px-6 py-5 text-left"
          onClick={() => set_marketing_open((open) => !open)}
          aria-expanded={marketing_open}
        >
          <span className="flex items-start gap-3">
            <Sparkles data-icon="inline-start" />
            <span className="flex flex-col gap-1">
              <span>Texto comercial del plan</span>
              <span className="text-xs font-normal whitespace-normal text-muted-foreground">
                Beneficios cortos que se muestran en la tarjeta del catálogo.
              </span>
            </span>
          </span>
          <ChevronDown
            data-icon="inline-end"
            className={cn("transition-transform", marketing_open && "rotate-180")}
          />
        </Button>

        {marketing_open ? (
          <CardContent className="flex flex-col gap-3 border-t pt-5">
            <FieldGroup className="gap-3">
              {features_field.fields.map((feature, index) => (
                <div
                  key={feature.id}
                  className="grid gap-3 rounded-xl border p-3 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(16rem,1.2fr)_auto_auto] lg:items-center"
                >
                  <Field>
                    <FieldLabel className="sr-only">Beneficio</FieldLabel>
                    <Input
                      placeholder="Beneficio"
                      {...form.register(`features.${index}.label`)}
                      aria-label={`Beneficio ${index + 1}`}
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="sr-only">Descripción</FieldLabel>
                    <Input
                      placeholder="Descripción breve"
                      {...form.register(`features.${index}.description`)}
                      aria-label={`Descripción del beneficio ${index + 1}`}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={values.features[index]?.included ?? true}
                      onCheckedChange={(checked) =>
                        form.setValue(
                          `features.${index}.included`,
                          Boolean(checked),
                          { shouldDirty: true },
                        )
                      }
                    />
                    Incluido
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => features_field.remove(index)}
                    aria-label={`Quitar beneficio ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </FieldGroup>
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() =>
                features_field.append({
                  label: "",
                  description: "",
                  included: true,
                  sort_order: features_field.fields.length,
                })
              }
            >
              <Plus data-icon="inline-start" />
              Añadir beneficio
            </Button>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );

  const renderReviewStep = () => (
    <Card className="gap-0 shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Revisa la configuración</CardTitle>
        <CardDescription>
          Comprueba los datos antes de guardar y sincronizar con Stripe.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-0 px-0">
        <section className="flex flex-col gap-4 border-b p-6">
          <SectionHeading
            title="Identidad y visibilidad"
            description="Información que verá el cliente en el catálogo."
            action={
              <Button type="button" variant="ghost" onClick={() => set_current_step(0)}>
                Editar
              </Button>
            }
          />
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CarFront className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{values.name || "Plan sin nombre"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {values.description || "Sin descripción"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={values.is_active ? "default" : "secondary"}>
                  {values.is_active ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant="outline">
                  {values.is_featured ? "Destacado" : "No destacado"}
                </Badge>
                <Badge variant="outline">Orden {values.sort_order}</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-b p-6">
          <SectionHeading
            title="Precios y facturación"
            description={`${values.prices.filter((price) => price.amount_euros > 0).length} ciclos configurados.`}
            action={
              <Button type="button" variant="ghost" onClick={() => set_current_step(1)}>
                Editar
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {values.prices
              .filter((price) => price.amount_euros > 0)
              .map((price, index) => (
                <div key={`${price.interval}-${index}`} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{interval_labels[price.interval]}</p>
                    <Badge variant={price.is_active ? "outline" : "secondary"}>
                      {price.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xl font-semibold tabular-nums">
                    {formatPrice(price.amount_euros)}
                  </p>
                </div>
              ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 p-6">
          <SectionHeading
            title="Capacidades"
            description={`${enabled_capabilities.length} de ${capability_count} capacidades activas.`}
            action={
              <Button type="button" variant="ghost" onClick={() => set_current_step(2)}>
                Editar
              </Button>
            }
          />
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {enabled_capabilities.length > 0 ? (
              enabled_capabilities.map((item) => {
                const entry = entitlements_state[item.feature];
                const value_label =
                  entry?.value_type === "unlimited"
                    ? "Ilimitado"
                    : entry?.value_type === "limit"
                      ? `Límite ${entry.limit}`
                      : "Incluido";
                return (
                  <div key={item.feature} className="flex items-center justify-between gap-3 py-1">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {value_label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay capacidades activas.
              </p>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );

  const step_content = [
    renderIdentityStep(),
    renderPricesStep(),
    renderCapabilitiesStep(),
    renderReviewStep(),
  ][current_step];

  return (
    <form
      onSubmit={saveAndSync}
      className="flex h-[min(92dvh,60rem)] min-h-0 flex-col overflow-hidden"
    >
      <header className="shrink-0 border-b bg-background px-5 pb-2 pt-5 sm:px-8">
        <div className="flex items-start justify-between gap-4 pr-10">
          <div>
            <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              {selected_id ? "Editar plan de suscripción" : "Crear plan de suscripción"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              Configura el plan y sincronízalo con Stripe cuando esté listo.
            </DialogDescription>
          </div>
          <Badge variant="outline" className="hidden border-primary/20 text-primary sm:inline-flex">
            <RefreshCw data-icon="inline-start" />
            Guardado con Stripe
          </Badge>
        </div>
        <PlanWizardStepper currentStep={current_step} onStepChange={moveToStep} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/15 p-4 sm:p-6">
        <div className="mx-auto grid max-w-[92rem] gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <main>{step_content}</main>
          <aside>
            <PlanSummaryCard
              values={values}
              entitlements={entitlements_state}
              capabilityCount={capability_count}
              currentStep={current_step}
            />
          </aside>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          {current_step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack} disabled={is_saving}>
              <ArrowLeft data-icon="inline-start" />
              Atrás
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                set_is_open(false);
                set_selected_id(null);
              }}
              disabled={is_saving}
            >
              Cancelar
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="hidden max-w-xs text-right text-xs text-muted-foreground lg:block">
            Guardar actualiza automáticamente el producto y los precios en Stripe.
          </p>
          {current_step < 3 ? (
            <>
              <Button type="submit" variant="outline" disabled={is_saving}>
                {is_saving ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {getSaveLabel(save_phase)}
              </Button>
              <Button type="button" onClick={goNext} disabled={is_saving}>
                Continuar a {wizard_steps[current_step + 1]?.label.toLowerCase()}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </>
          ) : (
            <Button type="submit" size="lg" disabled={is_saving}>
              {is_saving ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
              {getSaveLabel(save_phase)}
            </Button>
          )}
        </div>
      </footer>
    </form>
  );
};
