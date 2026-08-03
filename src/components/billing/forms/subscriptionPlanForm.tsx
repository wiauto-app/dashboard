import { useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RolesSelector } from "@/components/dynamicSelectors/rolesSelector";
import { DealershipsSelector } from "@/components/dynamicSelectors/dealershipsSelector";
import { permissionService } from "@/components/permissions/services/permissionService";
import { rolesService } from "@/components/roles/services/rolesService";
import { rolesPermissionsService } from "@/components/roles/services/roles-permissionsService";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import {
  billingPlansService,
  DEFAULT_PLAN_QUOTAS,
  type PlanQuotas,
  type SubscriptionPlan,
} from "../services/billingPlansService";

const centsToEuros = (amount_cents: number) => amount_cents / 100;

const eurosToCents = (amount_euros: number) => Math.round(amount_euros * 100);

interface PlanFormValues {
  name: string;
  description: string;
  audience: "particular" | "professional" | "buyer";
  billing_type: "recurring" | "one_time";
  role_id: string;
  is_active: boolean;
  is_featured: boolean;
  is_custom: boolean;
  target_dealership_id: string;
  sort_order: number;
  effect_type: "none" | "assistant_credits" | "feature_vehicle";
  effect_credits: number;
  quotas: PlanQuotas;
  permission_ids: string[];
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

const default_values: PlanFormValues = {
  name: "",
  description: "",
  audience: "particular",
  billing_type: "recurring",
  role_id: "",
  is_active: true,
  is_featured: false,
  is_custom: false,
  target_dealership_id: "",
  sort_order: 0,
  effect_type: "none",
  effect_credits: 100,
  quotas: { ...DEFAULT_PLAN_QUOTAS },
  permission_ids: [],
  prices: [{ interval: "month", amount_euros: 0, currency: "eur", is_active: true }],
  features: [{ label: "", description: "", included: true, sort_order: 0 }],
};

const build_quotas_payload = (quotas: PlanQuotas): PlanQuotas => {
  const payload: PlanQuotas = {
    max_listings: Number.isFinite(quotas.max_listings)
      ? Math.floor(quotas.max_listings)
      : DEFAULT_PLAN_QUOTAS.max_listings,
    max_photos: Number.isFinite(quotas.max_photos)
      ? Math.floor(quotas.max_photos)
      : DEFAULT_PLAN_QUOTAS.max_photos,
    allow_videos: !!quotas.allow_videos,
  };

  if (
    typeof quotas.featured_monthly === "number" &&
    Number.isFinite(quotas.featured_monthly) &&
    quotas.featured_monthly >= 0
  ) {
    payload.featured_monthly = Math.floor(quotas.featured_monthly);
  }

  return payload;
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

  const { data: catalog = [] } = useQuery({
    queryKey: ["permissions-catalog"],
    queryFn: () => permissionService.getCatalog(),
  });

  const { data: permissions_page } = useQuery({
    queryKey: ["permissions", "catalog-ids"],
    queryFn: () => permissionService.findAll({ page: 1, limit: 100 }),
  });

  const form = useForm<PlanFormValues>({ defaultValues: default_values });
  const prices_field = useFieldArray({ control: form.control, name: "prices" });
  const features_field = useFieldArray({ control: form.control, name: "features" });

  const role_id = form.watch("role_id");
  const is_custom = form.watch("is_custom");

  const { data: role_response } = useQuery({
    queryKey: ["subscription-plan-role", role_id],
    queryFn: () => rolesService.findOne(role_id),
    enabled: !!role_id,
  });

  const key_to_permission_id = useMemo(() => {
    const map = new Map<string, string>();
    for (const permission of permissions_page?.data ?? []) {
      map.set(permission.key, permission.id);
    }
    return map;
  }, [permissions_page?.data]);

  const catalog_with_ids = useMemo(
    () =>
      catalog
        .map((item) => ({
          ...item,
          id: key_to_permission_id.get(item.key),
        }))
        .filter((item): item is typeof item & { id: string } => !!item.id),
    [catalog, key_to_permission_id],
  );

  const grouped_catalog = useMemo(() => {
    return catalog_with_ids.reduce(
      (acc: Record<string, typeof catalog_with_ids>, item) => {
        const [module_name] = item.key.split(".");
        if (!acc[module_name]) {
          acc[module_name] = [];
        }
        acc[module_name].push(item);
        return acc;
      },
      {},
    );
  }, [catalog_with_ids]);

  useEffect(() => {
    const plan = plan_response?.data as SubscriptionPlan | undefined;
    if (!plan) {
      form.reset(default_values);
      return;
    }

    form.reset({
      name: plan.name,
      description: plan.description ?? "",
      audience: plan.audience,
      billing_type: plan.billing_type,
      role_id: plan.role_id ?? "",
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      is_custom: plan.is_custom ?? false,
      target_dealership_id: plan.target_dealership_id ?? "",
      sort_order: plan.sort_order,
      effect_type: plan.effect_config?.type ?? "none",
      effect_credits: plan.effect_config?.credits ?? 100,
      quotas: {
        max_listings: plan.quotas?.max_listings ?? DEFAULT_PLAN_QUOTAS.max_listings,
        max_photos: plan.quotas?.max_photos ?? DEFAULT_PLAN_QUOTAS.max_photos,
        allow_videos: plan.quotas?.allow_videos ?? DEFAULT_PLAN_QUOTAS.allow_videos,
        featured_monthly:
          plan.quotas?.featured_monthly ?? DEFAULT_PLAN_QUOTAS.featured_monthly,
      },
      permission_ids: [],
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
    if (!role_id) {
      form.setValue("permission_ids", []);
      return;
    }

    const permission_ids =
      role_response?.data?.roles_permissions?.map(
        (role_permission) => role_permission.permission_id,
      ) ?? [];
    form.setValue("permission_ids", permission_ids);
  }, [role_id, role_response, form]);

  const handleTogglePermission = (permission_id: string) => {
    const current = form.getValues("permission_ids") ?? [];
    if (current.includes(permission_id)) {
      form.setValue(
        "permission_ids",
        current.filter((id) => id !== permission_id),
      );
      return;
    }
    form.setValue("permission_ids", [...current, permission_id]);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (values.is_custom && !values.target_dealership_id) {
      toast.error("Selecciona el concesionario objetivo del plan personalizado");
      return;
    }

    const { effect_type, effect_credits, permission_ids, ...rest } = values;

    const effect_config =
      rest.billing_type === "one_time" && effect_type !== "none"
        ? effect_type === "assistant_credits"
          ? {
              type: "assistant_credits" as const,
              credits: effect_credits,
            }
          : { type: "feature_vehicle" as const }
        : {};

    const payload = {
      name: rest.name,
      description: rest.description || null,
      audience: rest.audience,
      billing_type: rest.billing_type,
      role_id: rest.role_id || null,
      is_active: rest.is_active,
      is_featured: rest.is_featured,
      is_custom: rest.is_custom,
      target_dealership_id: rest.is_custom
        ? rest.target_dealership_id || null
        : null,
      quotas: build_quotas_payload(rest.quotas),
      sort_order: rest.sort_order,
      effect_config,
      prices: rest.prices
        .filter((price) => price.amount_euros > 0)
        .map((price) => ({
          interval: price.interval,
          amount_cents: eurosToCents(price.amount_euros),
          currency: price.currency || "eur",
          is_active: price.is_active,
        })),
      features: rest.features.filter((feature) => feature.label.trim()),
    };

    const response = selected_id
      ? await billingPlansService.update({ id: selected_id, ...payload })
      : await billingPlansService.create(payload);

    if (!response.ok) {
      toast.error(response.message || "Error al guardar el plan");
      return;
    }

    if (rest.role_id) {
      const sync_response = await rolesPermissionsService.syncPermissions({
        role_id: rest.role_id,
        permission_ids: permission_ids ?? [],
      });
      if (!sync_response.ok) {
        toast.error(
          sync_response.message ||
            "El plan se guardó, pero no se pudieron sincronizar los permisos del rol",
        );
      }
    }

    toast.success(selected_id ? "Plan actualizado" : "Plan creado");
    set_is_open(false);
    set_selected_id(null);
    window.location.reload();
  });

  const handleSyncStripe = async () => {
    if (!selected_id) {
      toast.error("Guarda el plan antes de sincronizar con Stripe");
      return;
    }

    const response = await billingPlansService.syncStripe(selected_id);
    if (!response.ok) {
      toast.error(response.message || "Error al sincronizar con Stripe");
      return;
    }

    toast.success("Plan sincronizado con Stripe");
  };

  const handleCopyCheckoutLink = async () => {
    if (!selected_id) {
      toast.error("Guarda el plan personalizado antes de copiar el enlace");
      return;
    }

    const response = await billingPlansService.createCheckoutLink(selected_id);
    if (!response.ok || !response.data?.checkout_url) {
      toast.error(
        response.message || "No se pudo generar el enlace de suscripción",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(response.data.checkout_url);
      toast.success("Enlace de suscripción copiado");
    } catch {
      toast.error("No se pudo copiar el enlace al portapapeles");
    }
  };

  const selected_permission_ids = form.watch("permission_ids") ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field className="md:col-span-2">
          <FieldLabel>Nombre</FieldLabel>
          <Input {...form.register("name", { required: true })} />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>Descripción</FieldLabel>
          <Input {...form.register("description")} />
        </Field>
        <Field>
          <FieldLabel>Audiencia</FieldLabel>
          <Controller
            control={form.control}
            name="audience"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Audiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="buyer">Comprador</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field>
          <FieldLabel>Tipo de cobro</FieldLabel>
          <Controller
            control={form.control}
            name="billing_type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Recurrente</SelectItem>
                  <SelectItem value="one_time">Pago único</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel>Rol asociado</FieldLabel>
          <Controller
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <RolesSelector value={field.value} onValueChange={field.onChange} />
            )}
          />
        </Field>
        <Field>
          <FieldLabel>Orden</FieldLabel>
          <Input type="number" {...form.register("sort_order", { valueAsNumber: true })} />
        </Field>
        <div className="flex items-center gap-6 pt-6">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("is_active")}
              onCheckedChange={(v) => form.setValue("is_active", !!v)}
            />
            Activo
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("is_featured")}
              onCheckedChange={(v) => form.setValue("is_featured", !!v)}
            />
            Destacado
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold">¿Plan personalizado?</h3>
            <p className="text-sm text-muted-foreground">
              Los planes personalizados no aparecen en la landing de /planes.
              Requieren un concesionario objetivo y un enlace de checkout
              exclusivo.
            </p>
          </div>
          <Controller
            control={form.control}
            name="is_custom"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(!!checked);
                  if (!checked) {
                    form.setValue("target_dealership_id", "");
                  }
                }}
                aria-label="Plan personalizado"
              />
            )}
          />
        </div>

        {is_custom ? (
          <Field>
            <FieldLabel>Concesionario objetivo</FieldLabel>
            <Controller
              control={form.control}
              name="target_dealership_id"
              rules={{
                validate: (value) =>
                  !form.getValues("is_custom") || !!value
                    ? true
                    : "Selecciona un concesionario",
              }}
              render={({ field }) => (
                <DealershipsSelector
                  value={field.value || undefined}
                  onValueChange={(dealership_id) =>
                    field.onChange(dealership_id ?? "")
                  }
                  placeholder="Buscar concesionario por nombre..."
                />
              )}
            />
            {form.formState.errors.target_dealership_id ? (
              <FieldError>
                {form.formState.errors.target_dealership_id.message}
              </FieldError>
            ) : null}
          </Field>
        ) : null}

        {is_custom && selected_id ? (
          <Button type="button" variant="outline" onClick={handleCopyCheckoutLink}>
            Copiar enlace de suscripción
          </Button>
        ) : null}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Cuotas del plan</h3>
          <p className="text-sm text-muted-foreground">
            Límites compartidos por el concesionario (o por el perfil si es
            particular).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Anuncios activos (máx.)</FieldLabel>
            <Input
              type="number"
              min={0}
              {...form.register("quotas.max_listings", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel>Fotos por anuncio (máx.)</FieldLabel>
            <Input
              type="number"
              min={0}
              {...form.register("quotas.max_photos", { valueAsNumber: true })}
            />
          </Field>
          <Field>
            <FieldLabel>Destacados al mes (opcional)</FieldLabel>
            <Input
              type="number"
              min={0}
              {...form.register("quotas.featured_monthly", {
                valueAsNumber: true,
              })}
            />
          </Field>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              checked={form.watch("quotas.allow_videos")}
              onCheckedChange={(v) => form.setValue("quotas.allow_videos", !!v)}
              id="allow-videos"
            />
            <FieldLabel htmlFor="allow-videos" className="m-0">
              Permitir vídeos
            </FieldLabel>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Permisos del rol</h3>
          <p className="text-sm text-muted-foreground">
            Solo capacidades del catálogo fijo. Los cambios se aplican al rol
            asociado al guardar el plan.
          </p>
        </div>
        {!role_id ? (
          <p className="text-sm text-muted-foreground">
            Selecciona un rol para asignar permisos del catálogo.
          </p>
        ) : (
          <div className="max-h-70 space-y-4 overflow-y-auto">
            {Object.entries(grouped_catalog).map(([module_name, items]) => (
              <div key={module_name} className="rounded-lg border">
                <div className="border-b px-3 py-2">
                  <h4 className="text-sm font-medium capitalize">{module_name}</h4>
                </div>
                <div className="grid gap-2 p-3 md:grid-cols-2">
                  {items.map((item) => {
                    const checked = selected_permission_ids.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTogglePermission(item.id)}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-left transition hover:bg-muted/50 ${
                          checked ? "border-primary bg-primary/5" : ""
                        }`}
                        aria-pressed={checked}
                        aria-label={item.name}
                      >
                        <Checkbox checked={checked} tabIndex={-1} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.description || item.key}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {catalog_with_ids.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay permisos del catálogo sincronizados en la base de datos.
                Ejecuta la sincronización del catálogo en Permisos.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {form.watch("billing_type") === "one_time" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border p-4">
          <Field>
            <FieldLabel>Tipo de efecto</FieldLabel>
            <Controller
              control={form.control}
              name="effect_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de efecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    <SelectItem value="assistant_credits">Consultas del asistente</SelectItem>
                    <SelectItem value="feature_vehicle">Destacar vehículo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {form.watch("effect_type") === "assistant_credits" ? (
            <Field>
              <FieldLabel>Consultas incluidas</FieldLabel>
              <Input
                type="number"
                min={1}
                {...form.register("effect_credits", { valueAsNumber: true, min: 1 })}
              />
            </Field>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Precios</h3>
          <Button
            type="button"
            variant="outline"
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
        {prices_field.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
            <Field>
              <FieldLabel>Intervalo</FieldLabel>
              <Controller
                control={form.control}
                name={`prices.${index}.interval`}
                render={({ field: price_field }) => (
                  <Select value={price_field.value} onValueChange={price_field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Mensual</SelectItem>
                      <SelectItem value="year">Anual</SelectItem>
                      <SelectItem value="one_time">Único</SelectItem>
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
              />
            </Field>
            <div className="flex items-end">
              <Button type="button" variant="ghost" onClick={() => prices_field.remove(index)}>
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Características</h3>
          <Button
            type="button"
            variant="outline"
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
        {features_field.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Etiqueta" {...form.register(`features.${index}.label`)} />
            <Input placeholder="Descripción" {...form.register(`features.${index}.description`)} />
            <label className="flex items-center gap-2">
              <Checkbox
                checked={form.watch(`features.${index}.included`)}
                onCheckedChange={(v) => form.setValue(`features.${index}.included`, !!v)}
              />
              Incluido
            </label>
            <Button type="button" variant="ghost" onClick={() => features_field.remove(index)}>
              Quitar
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit">Guardar</Button>
        {selected_id ? (
          <Button type="button" variant="secondary" onClick={handleSyncStripe}>
            Sincronizar con Stripe
          </Button>
        ) : null}
      </div>
      {form.formState.errors.root ? (
        <FieldError>{form.formState.errors.root.message}</FieldError>
      ) : null}
    </form>
  );
};
