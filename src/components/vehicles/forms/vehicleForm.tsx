import { FormProvider, useForm } from "react-hook-form";
import {
  createVehicleSchema,
  vehicleSchema,
} from "../schemas/vehicle.schema";
import type {
  CreateVehicleSchema,
  UpdateVehicleSchema,
} from "../types/vehicles.types";
import { createVehicleDefaultValues } from "../types/vehicles.types";
import { VehicleFormSteps } from "./vehicleFormSteps";
import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { vehiclesService } from "../services/vehiclesService";
import { toast } from "sonner";
import { asFormResolver } from "@/lib/asFormResolver";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery } from "@tanstack/react-query";
import { mapAdminVehicleDetailToFormValues } from "../utils/mapAdminVehicleDetailToFormValues";
import type z from "zod";
import {
  ADMIN_VEHICLE_SUBMIT_ATTR,
  ADMIN_VEHICLE_WIZARD_STEPS,
  getAdminVehicleStepByIndex,
  type AdminVehicleFormField,
} from "../constants/admin-vehicle-wizard.constants";
import { AdminVehicleDatosStep } from "./steps/adminVehicleDatosStep";
import { AdminVehicleExtraStep } from "./steps/adminVehicleExtraStep";
import { AdminVehicleFinanceStep } from "./steps/adminVehicleFinanceStep";

export const VehicleForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasIncompleteImageUploads, setHasIncompleteImageUploads] =
    useState(false);
  const [hasIncompleteVideoUploads, setHasIncompleteVideoUploads] =
    useState(false);
  const hasIncompleteMediaUploads =
    hasIncompleteImageUploads || hasIncompleteVideoUploads;
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const selectedId = useSelectedIdStore((state) => state.selectedId);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const isEditMode = Boolean(selectedId);

  const formSchema = isEditMode ? vehicleSchema : createVehicleSchema;
  type FormSchema = z.infer<typeof formSchema>;

  const { data: vehicleDetail, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", selectedId],
    queryFn: () => vehiclesService.findOne(selectedId ?? ""),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: asFormResolver<FormSchema>(formSchema),
    defaultValues: createVehicleDefaultValues,
  });

  useEffect(() => {
    if (vehicleDetail) {
      const initialValues = mapAdminVehicleDetailToFormValues(vehicleDetail);
      form.reset(initialValues as FormSchema);
    }
  }, [vehicleDetail, form]);

  useEffect(() => {
    if (!selectedId) {
      form.reset(createVehicleDefaultValues);
      setCurrentStep(1);
    }
  }, [selectedId, form]);

  const totalSteps = ADMIN_VEHICLE_WIZARD_STEPS.length;
  const hasNextStep = useMemo(() => currentStep < totalSteps, [currentStep, totalSteps]);
  const hasPreviousStep = useMemo(() => currentStep > 1, [currentStep]);

  const getStepValidationFields = (
    stepIndex: number,
  ): AdminVehicleFormField[] => {
    const step = getAdminVehicleStepByIndex(stepIndex);
    if (!step) {
      return [];
    }
    if (isEditMode) {
      return step.fields.filter((field) => field !== "profile_id");
    }
    return step.fields;
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && hasIncompleteImageUploads) {
      toast.error("Espera a que terminen de subirse las fotos.");
      return;
    }
    if (currentStep === 1 && hasIncompleteVideoUploads) {
      toast.error(
        "Espera a que terminen de subirse los vídeos (o quita los que fallaron).",
      );
      return;
    }
    const fields = getStepValidationFields(currentStep);
    const is_valid = await form.trigger(
      fields as Parameters<typeof form.trigger>[0],
    );
    if (!is_valid) {
      toast.error("Revisa los campos del paso antes de continuar.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (data: FormSchema) => {
    if (hasIncompleteMediaUploads) {
      toast.error("Espera a que terminen de subirse las fotos y los vídeos.");
      return;
    }
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

    const response = await vehiclesService.create(data as CreateVehicleSchema);
    if (response.ok) {
      toast.success("Vehículo creado correctamente");
      setSelectedId(null);
      setIsOpen(false);
      onSuccess();
    } else {
      toast.error(response.message || "Error al crear el vehículo");
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLElement | null;
    const isExplicitSubmit =
      submitter?.getAttribute(ADMIN_VEHICLE_SUBMIT_ATTR) === "true";

    if (!isExplicitSubmit) {
      return;
    }

    void form.handleSubmit(handleSubmit)(event);
  };

  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;

    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (target.tagName === "BUTTON" || target.closest("button")) return;
    if (target.closest(`[${ADMIN_VEHICLE_SUBMIT_ATTR}="true"]`)) return;

    event.preventDefault();
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
        onSubmit={handleFormSubmit}
        onKeyDown={handleFormKeyDown}
      >
        <div className="md:col-span-2">
          <VehicleFormSteps currentStep={currentStep} />
        </div>
        {currentStep === 1 ? (
          <AdminVehicleDatosStep
            isCreateMode={!isEditMode}
            onImageUploadStatusChange={setHasIncompleteImageUploads}
            onVideoUploadStatusChange={setHasIncompleteVideoUploads}
          />
        ) : null}
        {currentStep === 2 ? <AdminVehicleExtraStep /> : null}
        {currentStep === 3 ? (
          <AdminVehicleFinanceStep
            isEditMode={isEditMode}
            vehicle_prices={vehicleDetail?.vehicle_prices ?? []}
          />
        ) : null}
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
          {hasNextStep ? (
            <Button
              type="button"
              disabled={currentStep === 1 && hasIncompleteMediaUploads}
              onClick={() => void handleNextStep()}
            >
              Siguiente <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={hasIncompleteMediaUploads}
              {...{ [ADMIN_VEHICLE_SUBMIT_ATTR]: "true" }}
            >
              {hasIncompleteImageUploads
                ? "Subiendo imágenes…"
                : hasIncompleteVideoUploads
                  ? "Subiendo vídeos…"
                : selectedId
                  ? "Actualizar anuncio"
                  : "Crear anuncio"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
