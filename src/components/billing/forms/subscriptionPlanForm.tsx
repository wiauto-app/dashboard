import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RolesSelector } from "@/components/dynamicSelectors/rolesSelector";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { billingPlansService, type SubscriptionPlan } from "../services/billingPlansService";

type PlanFormValues = {
  slug: string;
  name: string;
  description: string;
  audience: "particular" | "professional" | "buyer";
  billing_type: "recurring" | "one_time";
  role_id: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  prices: Array<{
    interval: "month" | "year" | "one_time";
    amount_cents: number;
    currency: string;
    is_active: boolean;
  }>;
  features: Array<{
    label: string;
    description: string;
    included: boolean;
    sort_order: number;
  }>;
};

const default_values: PlanFormValues = {
  slug: "",
  name: "",
  description: "",
  audience: "particular",
  billing_type: "recurring",
  role_id: "",
  is_active: true,
  is_featured: false,
  sort_order: 0,
  prices: [{ interval: "month", amount_cents: 0, currency: "eur", is_active: true }],
  features: [{ label: "", description: "", included: true, sort_order: 0 }],
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

  const form = useForm<PlanFormValues>({ defaultValues: default_values });
  const prices_field = useFieldArray({ control: form.control, name: "prices" });
  const features_field = useFieldArray({ control: form.control, name: "features" });

  useEffect(() => {
    const plan = plan_response?.data as SubscriptionPlan | undefined;
    if (!plan) {
      form.reset(default_values);
      return;
    }

    form.reset({
      slug: plan.slug,
      name: plan.name,
      description: plan.description ?? "",
      audience: plan.audience,
      billing_type: plan.billing_type,
      role_id: plan.role_id ?? "",
      is_active: plan.is_active,
      is_featured: plan.is_featured,
      sort_order: plan.sort_order,
      prices:
        plan.prices?.length
          ? plan.prices.map((price) => ({
              interval: price.interval,
              amount_cents: price.amount_cents,
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

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      description: values.description || null,
      role_id: values.role_id || null,
      prices: values.prices.filter((price) => price.amount_cents > 0),
      features: values.features.filter((feature) => feature.label.trim()),
    };

    const response = selected_id
      ? await billingPlansService.update({ id: selected_id, ...payload })
      : await billingPlansService.create(payload);

    if (!response.ok) {
      toast.error(response.message || "Error al guardar el plan");
      return;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Nombre</FieldLabel>
          <Input {...form.register("name", { required: true })} />
        </Field>
        <Field>
          <FieldLabel>Slug</FieldLabel>
          <Input {...form.register("slug", { required: true })} />
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
            <Checkbox checked={form.watch("is_active")} onCheckedChange={(v) => form.setValue("is_active", !!v)} />
            Activo
          </label>
          <label className="flex items-center gap-2">
            <Checkbox checked={form.watch("is_featured")} onCheckedChange={(v) => form.setValue("is_featured", !!v)} />
            Destacado
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Precios</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              prices_field.append({
                interval: "month",
                amount_cents: 0,
                currency: "eur",
                is_active: true,
              })
            }
          >
            Añadir precio
          </Button>
        </div>
        {prices_field.fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Controller
              control={form.control}
              name={`prices.${index}.interval`}
              render={({ field: price_field }) => (
                <Select value={price_field.value} onValueChange={price_field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensual</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                    <SelectItem value="one_time">Único</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Input
              type="number"
              placeholder="Centavos"
              {...form.register(`prices.${index}.amount_cents`, { valueAsNumber: true })}
            />
            <Input placeholder="Moneda" {...form.register(`prices.${index}.currency`)} />
            <Button type="button" variant="ghost" onClick={() => prices_field.remove(index)}>
              Quitar
            </Button>
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
            Añadir feature
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
