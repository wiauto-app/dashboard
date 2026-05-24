import { cn } from "@/lib/utils";
import React from "react";

export const VehicleFormSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    {
      label: "Datos del vehículo",
      key: "vehicle-data",
    },
    {
      label: "Características técnicas",
      key: "technical-features",
    },
  
    {
      label: "Precio y descripción",
      key: "price",
    },
    {
      label: "Recursos y Multimedia",
      key: "resources-and-multimedia",
    },
    {
      label: "Resumen y publicación",
      key: "summary-and-publication",
    },
  ];
  return (
    <div className="max-w-[90%] mx-auto mb-10">
      <div className="flex items-start relative  justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div
              className="flex  flex-col items-center gap-2 relative"
              key={step.key}
            >
              <div
                className={cn(
                  "bg-muted text-black  rounded-full w-8 h-8 flex items-center justify-center",
                  currentStep >= index + 1 &&
                    "bg-primary text-primary-foreground",
                )}
              >
                {index + 1}
              </div>
              <p
                className={cn(
                  "text-xs text-muted-foreground absolute -bottom-6 text-center text-nowrap",
                  currentStep >= index + 1 && "text-primary",
                )}
              >
                {step.label}
              </p>
            </div>
            <div
              className={cn(
                "h-1 w-full bg-muted last:hidden relative top-3 ",
                currentStep >= index + 1 && "bg-primary",
              )}
            ></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
