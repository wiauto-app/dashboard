import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type ControllerRenderProps,
  type ControllerFieldState,
} from "react-hook-form";

import { Input } from "./input";
import { Field, FieldError, FieldLabel } from "./field";

type ControllerInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  orientation?: "vertical" | "horizontal";
  children?: (props: {
    field: ControllerRenderProps<T, FieldPath<T>>;
    fieldState: ControllerFieldState;
  }) => React.ReactNode;
};

export const ControllerInput = <T extends FieldValues>({
  name,
  control,
  label,
  children,
  orientation = "vertical",
}: ControllerInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          orientation={orientation}
        
        >
          {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

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
