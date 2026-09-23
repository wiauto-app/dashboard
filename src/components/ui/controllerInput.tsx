import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type ControllerRenderProps,
  type ControllerFieldState,
  type RegisterOptions,
} from "react-hook-form";

import { formatFieldLabel } from "@/components/vehicles/constants/vehicle-form-field-meta";
import { Input } from "./input";
import { Field, FieldError, FieldLabel } from "./field";

interface ControllerInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  /** Muestra «(opcional)» en la etiqueta. Alineado con `CreateVehicleHttpDto`. */
  optional?: boolean;
  orientation?: "vertical" | "horizontal";
  rules?: Omit<
    RegisterOptions<T, FieldPath<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  children?: (props: {
    field: ControllerRenderProps<T, FieldPath<T>>;
    fieldState: ControllerFieldState;
  }) => React.ReactNode;
}

export const ControllerInput = <T extends FieldValues>({
  name,
  control,
  label,
  optional = false,
  rules,
  children,
  orientation = "vertical",
}: ControllerInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          orientation={orientation}
        
        >
          {label ? (
            <FieldLabel htmlFor={name}>
              {formatFieldLabel(label, optional)}
            </FieldLabel>
          ) : null}

          {children ? (
            children({ field, fieldState })
          ) : (
            <Input {...field} aria-invalid={fieldState.invalid} />
          )}

          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
