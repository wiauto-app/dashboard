import { FormProvider, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { vehicleSchema } from "../schemas/vehicle.schema";
import type { VehicleSchema } from "../types/vehicles.types";
import { createVehicleDefaultValues } from "../types/vehicles.types";
import { VehicleFormSteps } from "./vehicleFormSteps";
import { useState } from "react";
import { VehicleDataForm } from "./vehicleDataForm";
import { FeaturesForm } from "./featuresForm";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingDescForm } from "./pricingDescForm";
import { MediaForm } from "./mediaForm";
import { VehicleSummaryForm } from "./vehicleSummaryForm";

export const VehicleForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<VehicleSchema>({
    resolver: standardSchemaResolver(vehicleSchema),
    defaultValues: {
      ...createVehicleDefaultValues,
      vehicle_type_id: "",
      title: "",
      description: "",
    },
  });

  const handleNextStep = () => {
    if(currentStep === 5) {
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

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-6">
        <div className="md:col-span-2">
          <VehicleFormSteps currentStep={currentStep} />
        </div>
        {currentStep === 1 && <VehicleDataForm />}
        {currentStep === 2 && <FeaturesForm />}
        {currentStep === 3 && <PricingDescForm />}
        {currentStep === 4 && <MediaForm />}
        {currentStep === 5 && <VehicleSummaryForm />}
        <div className="col-span-2 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousStep}>
            <ArrowLeft className="size-4" />
            Anterior
          </Button>
          <Button type="button" onClick={handleNextStep}>
            Siguiente <ArrowRight className="size-4" />
          </Button>
          {/* <Button type="submit">Guardar</Button> */}
        </div>
      </form>
    </FormProvider>
  );
};
