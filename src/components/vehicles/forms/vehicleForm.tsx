import { FormProvider, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  updateVehicleSchema,
  vehicleSchema,
} from "../schemas/vehicle.schema";
import type { UpdateVehicleSchema, VehicleSchema } from "../types/vehicles.types";
import { createVehicleDefaultValues } from "../types/vehicles.types";
import { VehicleFormSteps } from "./vehicleFormSteps";
import { useEffect, useMemo, useState } from "react";
import { VehicleDataForm } from "./vehicleDataForm";
import { FeaturesForm } from "./featuresForm";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingDescForm } from "./pricingDescForm";
import { MediaForm } from "./mediaForm";
import { VehicleSummaryForm } from "./vehicleSummaryForm";
import { vehiclesService } from "../services/vehiclesService";
import { toast } from "sonner";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery } from "@tanstack/react-query";
import { mapAdminVehicleDetailToFormValues } from "../utils/mapAdminVehicleDetailToFormValues";
import type z from "zod";

export const VehicleForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const selectedId = useSelectedIdStore((state) => state.selectedId);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);

  const formSchema = selectedId ? updateVehicleSchema : vehicleSchema;
  type FormSchema = z.infer<typeof formSchema>;

  const { data: vehicleDetail, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", selectedId],
    queryFn: () => vehiclesService.findOne(selectedId ?? ""),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: createVehicleDefaultValues,
  });

  useEffect(() => {
    if (vehicleDetail) {
      const initialValues = mapAdminVehicleDetailToFormValues(vehicleDetail);
      form.reset(initialValues);
    }
  }, [vehicleDetail, form]);

  useEffect(() => {
    if (!selectedId) {
      form.reset(createVehicleDefaultValues);
    }
  }, [selectedId, form]);

  const handleNextStep = () => {
    if (currentStep === 5) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const hasNextStep = useMemo(() => currentStep < 5, [currentStep]);
  const hasPreviousStep = useMemo(() => currentStep > 1, [currentStep]);

  const handleSubmit = async (data: FormSchema) => {
    if (selectedId) {
      const response = await vehiclesService.update(
        selectedId,
        data as UpdateVehicleSchema,
      );
      if (response.ok) {
        toast.success("Vehículo actualizado correctamente");
        setSelectedId(null);
        setIsOpen(false);
        onSuccess();
      } else {
        toast.error(response.message || "Error al actualizar el vehículo");
      }
      return;
    }

    const response = await vehiclesService.create(data as VehicleSchema);
    if (response.ok) {
      toast.success("Vehículo creado correctamente");
      setSelectedId(null);
      setIsOpen(false);
      onSuccess();
    } else {
      toast.error(response.message || "Error al crear el vehículo");
    }
  };

  if (selectedId && isLoadingVehicle) {
    return (
      <div
        className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"
        aria-live="polite"
      >
        <Loader2 className="size-5 animate-spin" aria-hidden />
        Cargando anuncio…
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="md:col-span-2">
          <VehicleFormSteps currentStep={currentStep} />
        </div>
        {currentStep === 1 && <VehicleDataForm />}
        {currentStep === 2 && <FeaturesForm />}
        {currentStep === 3 && (
          <PricingDescForm
            vehicle_prices={vehicleDetail?.vehicle_prices ?? []}
            isEditMode={!!selectedId}
          />
        )}
        {currentStep === 4 && <MediaForm />}
        {currentStep === 5 && <VehicleSummaryForm />}
        <div className="col-span-2 flex items-center justify-between">
          <Button
            disabled={!hasPreviousStep}
            type="button"
            variant="outline"
            onClick={handlePreviousStep}
          >
            <ArrowLeft className="size-4" />
            Anterior
          </Button>
          {hasNextStep && (
            <Button type="button" onClick={handleNextStep}>
              Siguiente <ArrowRight className="size-4" />
            </Button>
          )}
          {currentStep === 5 && (
            <Button type="submit">
              {selectedId ? "Actualizar anuncio" : "Guardar"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
