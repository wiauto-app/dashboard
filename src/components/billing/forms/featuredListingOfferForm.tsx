import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ControllerInput } from "@/components/ui/controllerInput";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { featuredListingOffersService } from "../services/featuredListingOffersService";

interface OfferFormValues {
  title: string;
  description: string;
  duration_days: number;
  boost_weight: number;
  amount_euros: number;
  is_active: boolean;
  sort_order: number;
}

const default_values: OfferFormValues = {
  title: "",
  description: "",
  duration_days: 30,
  boost_weight: 50,
  amount_euros: 19.99,
  is_active: true,
  sort_order: 0,
};

const parse_number = (raw_value: string) => {
  const parsed = Number(raw_value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const FeaturedListingOfferForm = () => {
  const selected_id = useSelectedIdStore((state) => state.selectedId);
  const set_is_open = useFormDialogStore((state) => state.setIsOpen);
  const set_selected_id = useSelectedIdStore((state) => state.setSelectedId);
  const form = useForm<OfferFormValues>({ defaultValues: default_values });

  const { data: offer_response } = useQuery({
    queryKey: ["featured-listing-offer", selected_id],
    queryFn: () => featuredListingOffersService.findOne(selected_id ?? ""),
    enabled: !!selected_id,
  });

  useEffect(() => {
    if (!selected_id) {
      form.reset(default_values);
      return;
    }

    const offer = offer_response?.data;
    if (!offer) {
      return;
    }

    form.reset({
      title: offer.title,
      description: offer.description || "",
      duration_days: offer.duration_days,
      boost_weight: offer.boost_weight,
      amount_euros: offer.amount_cents / 100,
      is_active: offer.is_active,
      sort_order: offer.sort_order,
    });
  }, [selected_id, offer_response, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      amount_cents: Math.round(values.amount_euros * 100),
      currency: "eur",
    };
    const response = selected_id
      ? await featuredListingOffersService.update({
          id: selected_id,
          ...payload,
        })
      : await featuredListingOffersService.create(payload);

    if (!response.ok) {
      toast.error(response.message || "No se pudo guardar la oferta");
      return;
    }

    toast.success(selected_id ? "Oferta actualizada" : "Oferta creada");
    set_is_open(false);
    set_selected_id(null);
    window.location.reload();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ControllerInput
        control={form.control}
        name="title"
        label="Título"
        rules={{
          required: "El título es obligatorio",
          minLength: { value: 1, message: "El título es obligatorio" },
        }}
      />
      <ControllerInput
        control={form.control}
        name="description"
        label="Descripción"
        optional
      >
        {({ field, fieldState }) => (
          <Textarea
            id="description"
            aria-label="Descripción de la oferta"
            aria-invalid={fieldState.invalid}
            value={field.value as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      </ControllerInput>
      <div className="grid gap-3 sm:grid-cols-2">
        <ControllerInput
          control={form.control}
          name="duration_days"
          label="Duración (días)"
          rules={{
            required: "La duración es obligatoria",
            min: { value: 1, message: "Mínimo 1 día" },
            validate: (value) =>
              Number.isInteger(value) || "Debe ser un número entero",
          }}
        >
          {({ field, fieldState }) => (
            <Input
              id="duration_days"
              type="number"
              min={1}
              step={1}
              aria-label="Duración en días"
              aria-invalid={fieldState.invalid}
              value={(field.value as number | undefined) ?? ""}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parse_number(event.target.value))
              }
            />
          )}
        </ControllerInput>
        <ControllerInput
          control={form.control}
          name="boost_weight"
          label="Boost (1-100)"
          rules={{
            required: "El boost es obligatorio",
            min: { value: 1, message: "Mínimo 1" },
            max: { value: 100, message: "Máximo 100" },
            validate: (value) =>
              Number.isInteger(value) || "Debe ser un número entero",
          }}
        >
          {({ field, fieldState }) => (
            <Input
              id="boost_weight"
              type="number"
              min={1}
              max={100}
              step={1}
              aria-label="Peso de boost de visibilidad"
              aria-invalid={fieldState.invalid}
              value={(field.value as number | undefined) ?? ""}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parse_number(event.target.value))
              }
            />
          )}
        </ControllerInput>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ControllerInput
          control={form.control}
          name="amount_euros"
          label="Precio (€)"
          rules={{
            required: "El precio es obligatorio",
            min: { value: 0.01, message: "El precio debe ser mayor que 0" },
          }}
        >
          {({ field, fieldState }) => (
            <Input
              id="amount_euros"
              type="number"
              min={0.01}
              step="0.01"
              aria-label="Precio en euros"
              aria-invalid={fieldState.invalid}
              value={(field.value as number | undefined) ?? ""}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parse_number(event.target.value))
              }
            />
          )}
        </ControllerInput>
        <ControllerInput
          control={form.control}
          name="sort_order"
          label="Orden"
          rules={{
            validate: (value) =>
              value === undefined ||
              Number.isInteger(value) ||
              "Debe ser un número entero",
          }}
        >
          {({ field, fieldState }) => (
            <Input
              id="sort_order"
              type="number"
              step={1}
              aria-label="Orden de visualización"
              aria-invalid={fieldState.invalid}
              value={(field.value as number | undefined) ?? ""}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(parse_number(event.target.value))
              }
            />
          )}
        </ControllerInput>
      </div>
      <ControllerInput
        control={form.control}
        name="is_active"
        label="Activo"
        orientation="horizontal"
      >
        {({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={field.value as boolean}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-label="Oferta activa"
            />
            Visible en catálogo
          </label>
        )}
      </ControllerInput>
      <Button type="submit" className="w-full">
        {selected_id ? "Guardar cambios" : "Crear oferta"}
      </Button>
    </form>
  );
};
