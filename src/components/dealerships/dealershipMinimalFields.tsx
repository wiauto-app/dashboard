import { Controller, useFormState, type Control } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DEFAULT_PHONE_CODE, PhoneInput } from "@/components/ui/phoneInput";
import type { DealershipMinimalDraft } from "@/validations/resources/dealership-minimal.schema";

/** Formularios que alojan los datos mínimos del concesionario bajo `dealership`. */
export interface DealershipMinimalFieldsForm {
  dealership: DealershipMinimalDraft;
}

/**
 * Campos mínimos (nombre, email, teléfono, dirección) para crear un
 * concesionario. Compartido por el alta de usuario y la asignación de plan.
 */
export const DealershipMinimalFields = ({
  control,
  idPrefix = "dealership",
}: {
  control: Control<DealershipMinimalFieldsForm>;
  idPrefix?: string;
}) => {
  const { errors } = useFormState({ control, name: "dealership.phone" });
  const phone_errors = errors.dealership?.phone;

  return (
    <div className="flex flex-col gap-3">
      <Controller
        name="dealership.name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}_name`}>
              Nombre del concesionario
            </FieldLabel>
            <Input
              id={`${idPrefix}_name`}
              type="text"
              placeholder="Nombre comercial"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="dealership.email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}_email`}>
              Correo de contacto del concesionario
            </FieldLabel>
            <Input
              id={`${idPrefix}_email`}
              type="email"
              placeholder="contacto@concesionario.com"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <Controller
        name="dealership.phone"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}_phone`}>Teléfono</FieldLabel>
            <PhoneInput
              value={
                field.value ?? {
                  phone_code: DEFAULT_PHONE_CODE,
                  phone: "",
                }
              }
              onChange={field.onChange}
              ariaInvalid={fieldState.invalid}
            />
            {phone_errors?.phone_code ? (
              <FieldError errors={[phone_errors.phone_code]} />
            ) : null}
            {phone_errors?.phone ? (
              <FieldError errors={[phone_errors.phone]} />
            ) : null}
          </Field>
        )}
      />

      <Controller
        name="dealership.address"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${idPrefix}_address`}>Dirección</FieldLabel>
            <Input
              id={`${idPrefix}_address`}
              type="text"
              placeholder="Calle, número, ciudad"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />
    </div>
  );
};
