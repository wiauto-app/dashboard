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
import { featuredListingOffersService } from "../services/featuredListingOffersService";
import { ControllerInput } from "@/components/ui/controllerInput";

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
      description: offer.description ?? "",
      duration_days: offer.duration_days,
      boost_weight: offer.boost_weight,
      amount_euros: offer.amount_cents / 100,
      is_active: offer.is_active,
      sort_order: offer.sort_order,
    });
  }, [selected_id, offer_response, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      duration_days: values.duration_days,
      boost_weight: values.boost_weight,
      amount_cents: Math.round(values.amount_euros * 100),
      currency: "eur",
      is_active: values.is_active,
      sort_order: values.sort_order,
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
      <Field>
        <ControllerInput
          control={form.control}
          name="title"
          label="Título"
        />
      
      </Field>
      <Field>
        <FieldLabel htmlFor="offer-description">Descripción</FieldLabel>
        <Textarea
          id="offer-description"
          {...form.register("description")}
          aria-label="Descripción de la oferta"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="offer-days">Duración (días)</FieldLabel>
          <Input
            id="offer-days"
            type="number"
            min={1}
            {...form.register("duration_days", {
              required: true,
              valueAsNumber: true,
              min: 1,
            })}
            aria-label="Duración en días"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offer-boost">Boost (1-100)</FieldLabel>
          <Input
            id="offer-boost"
            type="number"
            min={1}
            max={100}
            {...form.register("boost_weight", {
              required: true,
              valueAsNumber: true,
              min: 1,
              max: 100,
            })}
            aria-label="Peso de boost de visibilidad"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="offer-price">Precio (€)</FieldLabel>
          <Input
            id="offer-price"
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
        <Field>
          <FieldLabel htmlFor="offer-sort">Orden</FieldLabel>
          <Input
            id="offer-sort"
            type="number"
            {...form.register("sort_order", { valueAsNumber: true })}
            aria-label="Orden de visualización"
          />
        </Field>
      </div>
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
                aria-label="Oferta activa"
              />
              Visible en catálogo
            </label>
          )}
        />
      </Field>
      <Button type="submit" className="w-full">
        {selected_id ? "Guardar cambios" : "Crear oferta"}
      </Button>
    </form>
  );
};
