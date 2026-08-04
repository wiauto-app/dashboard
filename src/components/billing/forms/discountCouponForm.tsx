import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { discountCouponsService } from "../services/discountCouponsService";

interface CouponFormValues {
  name: string;
  code: string;
  discount_type: "percent" | "amount";
  percent_off: number;
  amount_euros: number;
  max_redemptions: number;
  expires_at: string;
  active: boolean;
}

const default_values: CouponFormValues = {
  name: "",
  code: "",
  discount_type: "percent",
  percent_off: 10,
  amount_euros: 5,
  max_redemptions: 1,
  expires_at: "",
  active: true,
};

export const DiscountCouponForm = () => {
  const selected_id = useSelectedIdStore((state) => state.selectedId);
  const set_is_open = useFormDialogStore((state) => state.setIsOpen);
  const set_selected_id = useSelectedIdStore((state) => state.setSelectedId);
  const form = useForm<CouponFormValues>({ defaultValues: default_values });

  useEffect(() => {
    if (selected_id) {
      // Solo creación: al editar usa acciones de fila (activar/desactivar).
      set_is_open(false);
      set_selected_id(null);
      toast.message("Usa las acciones de la fila para activar o desactivar");
    }
  }, [selected_id, set_is_open, set_selected_id]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim() || undefined,
      max_redemptions: values.max_redemptions || 1,
      expires_at: values.expires_at
        ? new Date(values.expires_at).toISOString()
        : null,
      active: values.active,
      ...(values.discount_type === "percent"
        ? { percent_off: values.percent_off }
        : {
            amount_off_cents: Math.round(values.amount_euros * 100),
            currency: "eur",
          }),
    };

    const response = await discountCouponsService.create(payload);
    if (!response.ok || !response.data) {
      toast.error(response.message || "No se pudo crear el cupón");
      return;
    }

    try {
      await navigator.clipboard.writeText(response.data.code);
      toast.success(`Cupón creado. Código copiado: ${response.data.code}`);
    } catch {
      toast.success(`Cupón creado: ${response.data.code}`);
    }

    set_is_open(false);
    set_selected_id(null);
    window.location.reload();
  });

  const discount_type = form.watch("discount_type");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="coupon-name">Nombre</FieldLabel>
        <Input
          id="coupon-name"
          {...form.register("name", { required: true })}
          placeholder="Promo lanzamiento"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="coupon-code">Código (opcional)</FieldLabel>
        <Input
          id="coupon-code"
          {...form.register("code")}
          placeholder="Se genera solo si lo dejas vacío"
        />
      </Field>

      <Field>
        <FieldLabel>Tipo de descuento</FieldLabel>
        <Controller
          control={form.control}
          name="discount_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Porcentaje</SelectItem>
                <SelectItem value="amount">Importe fijo (€)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      {discount_type === "percent" ? (
        <Field>
          <FieldLabel htmlFor="percent_off">Porcentaje</FieldLabel>
          <Input
            id="percent_off"
            type="number"
            min={1}
            max={100}
            step={0.01}
            {...form.register("percent_off", { valueAsNumber: true })}
          />
        </Field>
      ) : (
        <Field>
          <FieldLabel htmlFor="amount_euros">Importe (€)</FieldLabel>
          <Input
            id="amount_euros"
            type="number"
            min={0.01}
            step={0.01}
            {...form.register("amount_euros", { valueAsNumber: true })}
          />
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="max_redemptions">Máximo de canjes</FieldLabel>
        <Input
          id="max_redemptions"
          type="number"
          min={1}
          {...form.register("max_redemptions", { valueAsNumber: true })}
        />
        <p className="text-muted-foreground text-sm">
          Por defecto 1 (un código = un canje).
        </p>
      </Field>

      <Field>
        <FieldLabel htmlFor="expires_at">Caducidad (opcional)</FieldLabel>
        <Input
          id="expires_at"
          type="datetime-local"
          {...form.register("expires_at")}
        />
      </Field>

      <label className="flex items-center gap-2">
        <Checkbox
          checked={form.watch("active")}
          onCheckedChange={(checked) => form.setValue("active", !!checked)}
        />
        Activo
      </label>

      <Button type="submit">Crear cupón</Button>
    </form>
  );
};
