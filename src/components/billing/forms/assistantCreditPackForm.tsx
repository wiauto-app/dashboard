import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { assistantCreditPacksService } from "../services/assistantCreditPacksService";

interface PackFormValues {
  title: string;
  description: string;
  credits_quantity: number;
  amount_euros: number;
  is_active: boolean;
  sort_order: number;
}

const default_values: PackFormValues = {
  title: "",
  description: "",
  credits_quantity: 50,
  amount_euros: 9.99,
  is_active: true,
  sort_order: 0,
};

export const AssistantCreditPackForm = () => {
  const selected_id = useSelectedIdStore((state) => state.selectedId);
  const set_is_open = useFormDialogStore((state) => state.setIsOpen);
  const set_selected_id = useSelectedIdStore((state) => state.setSelectedId);
  const form = useForm<PackFormValues>({ defaultValues: default_values });

  const { data: pack_response } = useQuery({
    queryKey: ["assistant-credit-pack", selected_id],
    queryFn: () => assistantCreditPacksService.findOne(selected_id ?? ""),
    enabled: !!selected_id,
  });

  useEffect(() => {
    if (!selected_id) {
      form.reset(default_values);
      return;
    }

    const pack = pack_response?.data;
    if (!pack) {
      return;
    }

    form.reset({
      title: pack.title,
      description: pack.description ?? "",
      credits_quantity: pack.credits_quantity,
      amount_euros: pack.amount_cents / 100,
      is_active: pack.is_active,
      sort_order: pack.sort_order,
    });
  }, [selected_id, pack_response, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      credits_quantity: values.credits_quantity,
      amount_cents: Math.round(values.amount_euros * 100),
      currency: "eur",
      is_active: values.is_active,
      sort_order: values.sort_order,
    };

    const response = selected_id
      ? await assistantCreditPacksService.update({ id: selected_id, ...payload })
      : await assistantCreditPacksService.create(payload);

    if (!response.ok) {
      toast.error(response.message || "No se pudo guardar el pack");
      return;
    }

    toast.success(selected_id ? "Pack actualizado" : "Pack creado");
    set_is_open(false);
    set_selected_id(null);
    window.location.reload();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="pack-title">Título</FieldLabel>
        <Input
          id="pack-title"
          {...form.register("title", { required: true })}
          aria-label="Título del pack"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pack-description">Descripción</FieldLabel>
        <Textarea
          id="pack-description"
          {...form.register("description")}
          aria-label="Descripción del pack"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="pack-credits">Consultas</FieldLabel>
          <Input
            id="pack-credits"
            type="number"
            min={1}
            {...form.register("credits_quantity", {
              required: true,
              valueAsNumber: true,
              min: 1,
            })}
            aria-label="Cantidad de consultas"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="pack-price">Precio (€)</FieldLabel>
          <Input
            id="pack-price"
            type="number"
            min={0.01}
            step="0.01"
            {...form.register("amount_euros", {
              required: true,
              valueAsNumber: true,
              min: 0.01,
            })}
            aria-label="Precio en euros"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="pack-sort">Orden</FieldLabel>
          <Input
            id="pack-sort"
            type="number"
            {...form.register("sort_order", { valueAsNumber: true })}
            aria-label="Orden de visualización"
          />
        </Field>
        <Field>
          <FieldLabel>Activo</FieldLabel>
          <Controller
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-label="Pack activo"
                />
                Visible en catálogo
              </label>
            )}
          />
        </Field>
      </div>
      <Button type="submit" className="w-full">
        {selected_id ? "Guardar cambios" : "Crear pack"}
      </Button>
    </form>
  );
};
