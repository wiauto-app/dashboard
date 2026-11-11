import { Controller, useFormContext } from "react-hook-form";
import { ControllerInput } from "@/components/ui/controllerInput";
import { PhoneInput } from "@/components/ui/phoneInput";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProfilesSelector } from "@/components/dynamicSelectors/profilesSelector";
import { VehicleConditionSelector } from "@/components/dynamicSelectors/vehicleConditionSelector";
import { VehiclePublisherTypeSelector } from "@/components/dynamicSelectors/vehiclePublisherTypeSelector";
import type { CreateVehicleSchema, VehicleSchema } from "../../types/vehicles.types";
import { MediaForm } from "../mediaForm";
import { VehicleDataForm } from "../vehicleDataForm";

interface AdminVehicleDatosStepProps {
  isCreateMode: boolean;
  onImageUploadStatusChange?: (hasIncompleteUploads: boolean) => void;
}

export const AdminVehicleDatosStep = ({
  isCreateMode,
  onImageUploadStatusChange,
}: AdminVehicleDatosStepProps) => {
  const form = useFormContext<VehicleSchema | CreateVehicleSchema>();
  const phoneValue = form.watch("phone");

  return (
    <div className="flex flex-col gap-8">
      {isCreateMode ? (
        <ControllerInput
          name="profile_id"
          control={form.control}
          label="Dueño del anuncio"
        >
          {({ field, fieldState }) => (
            <ProfilesSelector
              value={field.value as string | undefined}
              onValueChange={(next) => field.onChange(next ?? "")}
              ariaInvalid={fieldState.invalid}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
      ) : null}

      <MediaForm onImageUploadStatusChange={onImageUploadStatusChange} />

      <VehicleDataForm />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ControllerInput name="ref" control={form.control} label="Referencia" optional>
          {({ field, fieldState }) => (
            <Input
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
              maxLength={50}
              aria-invalid={fieldState.invalid}
              placeholder="Opcional"
            />
          )}
        </ControllerInput>
        <ControllerInput name="mileage" control={form.control} label="Kilometraje">
          {({ field, fieldState }) => (
            <Input
              {...field}
              value={field.value == null ? "" : String(field.value)}
              type="number"
              inputMode="numeric"
              min={0}
              aria-invalid={fieldState.invalid}
            />
          )}
        </ControllerInput>
        <ControllerInput name="condition" control={form.control} label="Estado">
          {({ field }) => (
            <VehicleConditionSelector
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={field.disabled}
            />
          )}
        </ControllerInput>
      </div>

      <ControllerInput name="price" control={form.control} label="Precio (€)">
        {({ field, fieldState }) => (
          <Input
            {...field}
            value={field.value == null ? "" : String(field.value)}
            type="number"
            min={1}
            aria-invalid={fieldState.invalid}
          />
        )}
      </ControllerInput>

      <Separator />

      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Contacto y ubicación</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ControllerInput
            name="publisher_type"
            control={form.control}
            label="Tipo de publicador"
          >
            {({ field }) => (
              <VehiclePublisherTypeSelector
                value={field.value as string | undefined}
                onValueChange={field.onChange}
                disabled={field.disabled}
                placeholder="Seleccionar tipo"
              />
            )}
          </ControllerInput>
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="admin-vehicle-phone">Teléfono</FieldLabel>
                <PhoneInput
                  value={{
                    phone_code: field.value.phone_code,
                    phone: field.value.phone,
                  }}
                  onChange={field.onChange}
                  ariaInvalid={fieldState.invalid}
                />
                {fieldState.error ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </div>

        <Controller
          name="show_phone"
          control={form.control}
          render={({ field }) => (
            <Field>
              <h3 className="sr-only">Mostrar teléfono</h3>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor="admin-show-phone">
                    Mostrar teléfono en el anuncio
                  </FieldLabel>
                  <FieldDescription>
                    Si lo desactivas, se ocultará el contacto telefónico en el
                    anuncio público.
                  </FieldDescription>
                </div>
                <Switch
                  id="admin-show-phone"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Mostrar teléfono en el anuncio"
                />
              </div>
            </Field>
          )}
        />

        <Controller
          name="has_whatsapp"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor="admin-has-whatsapp">
                    Disponible por WhatsApp
                  </FieldLabel>
                  <FieldDescription>
                    Indica si el número puede recibir mensajes por WhatsApp.
                  </FieldDescription>
                </div>
                <Switch
                  id="admin-has-whatsapp"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!phoneValue?.phone?.trim()}
                  aria-label="Disponible por WhatsApp"
                />
              </div>
            </Field>
          )}
        />

        <Controller
          name="show_exact_location"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor="admin-show-exact-location">
                    Mostrar ubicación exacta
                  </FieldLabel>
                  <FieldDescription>
                    Si lo activas, se mostrará la ubicación exacta en el anuncio
                    público.
                  </FieldDescription>
                </div>
                <Switch
                  id="admin-show-exact-location"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Mostrar ubicación exacta"
                />
              </div>
            </Field>
          )}
        />

        <Controller
          name="show_review_collab"
          control={form.control}
          render={({ field }) => (
            <Field>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="space-y-1">
                  <FieldLabel htmlFor="admin-show-review-collab">
                    Mostrar revisión de colaboración
                  </FieldLabel>
                  <FieldDescription>
                    Si lo activas, se mostrará la revisión de colaboración en el
                    anuncio público.
                  </FieldDescription>
                </div>
                <Switch
                  id="admin-show-review-collab"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Mostrar revisión de colaboración"
                />
              </div>
            </Field>
          )}
        />

        <div className="flex flex-col gap-4">
          <Label>Ubicación (coordenadas)</Label>
          <p className="text-sm text-muted-foreground">
            Introduce latitud y longitud del vehículo.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ControllerInput name="lat" control={form.control} label="Latitud">
              {({ field, fieldState }) => (
                <Input
                  {...field}
                  value={field.value == null ? "" : String(field.value)}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="Ej. 40.4168"
                  aria-invalid={fieldState.invalid}
                />
              )}
            </ControllerInput>
            <ControllerInput name="lng" control={form.control} label="Longitud">
              {({ field, fieldState }) => (
                <Input
                  {...field}
                  value={field.value == null ? "" : String(field.value)}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="Ej. -3.7038"
                  aria-invalid={fieldState.invalid}
                />
              )}
            </ControllerInput>
          </div>
        </div>
      </div>
    </div>
  );
};
