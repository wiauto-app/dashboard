import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  adminCreateUserFormSchema,
  updateUserSchema,
  type AdminCreateUserFormValues,
} from "@/validations/resources/user.schema";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { PasswordInput } from "../ui/passwordInput";
import { toast } from "sonner";
import { profileService } from "@/services/profiles/profileService";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { profileSchema } from "@/validations/resources/profile.schema";
import { userService } from "@/services/users/userService";
import { ImageInput } from "../ui/imageInput";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { PhoneInput, DEFAULT_PHONE_CODE } from "../ui/phoneInput";
import { useNavigate } from "@tanstack/react-router";

const createEmptyUserFormValues = (): AdminCreateUserFormValues => ({
  email: "",
  password: "",
  name: "",
  last_name: "",
  is_admin: false,
  avatar_url: "",
  createDealershipProfile: false,
  dealership: {
    name: "",
    email: "",
    phone: { phone_code: DEFAULT_PHONE_CODE, phone: "" },
    address: "",
  },
});

export const UserForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);
  const navigate = useNavigate();
  const updateUserFormSchema = updateUserSchema.merge(profileSchema);
  const previousSelectedIdRef = useRef(selectedId);

  const { data: profile } = useQuery({
    queryKey: ["profile", selectedId],
    queryFn: () => profileService.getProfile(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<AdminCreateUserFormValues>({
    resolver: standardSchemaResolver(
      selectedId ? updateUserFormSchema : adminCreateUserFormSchema,
    ) as unknown as Resolver<AdminCreateUserFormValues>,
    defaultValues: createEmptyUserFormValues(),
  });

  const createDealershipProfile = Boolean(
    useWatch({
      control: form.control,
      name: "createDealershipProfile",
      disabled: Boolean(selectedId),
    }),
  );
  const userEmail = useWatch({ control: form.control, name: "email" });

  useEffect(() => {
    if (!selectedId || !profile) {
      return;
    }

    form.reset({
      ...createEmptyUserFormValues(),
      name: profile.name,
      last_name: profile.last_name,
      email: profile.user.email,
      is_admin: profile.user.is_admin === true,
      avatar_url: profile.avatar_url,
    });
  }, [profile, form, selectedId]);

  useEffect(() => {
    const previousSelectedId = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedId;
    if (!previousSelectedId || selectedId) {
      return;
    }

    form.reset(createEmptyUserFormValues());
  }, [form, selectedId]);

  useEffect(() => {
    if (selectedId || !createDealershipProfile) {
      return;
    }
    const currentDealershipEmail = form.getValues("dealership.email");
    if (!currentDealershipEmail?.trim() && userEmail?.trim()) {
      form.setValue("dealership.email", userEmail, { shouldDirty: true });
    }
  }, [createDealershipProfile, form, selectedId, userEmail]);

  const handleGoToDealerships = () => {
    setIsOpen(false);
    setSelectedId(null);
    void navigate({ to: "/dealership" });
  };

  const onSubmit = async (formData: AdminCreateUserFormValues) => {
    const dirtyFields = form.formState.dirtyFields;
    if (selectedId) {
      const payload = {
        email: formData.email,
        name: formData.name,
        last_name: formData.last_name,
        is_admin: formData.is_admin,
        avatar_url: formData.avatar_url,
        ...(dirtyFields.password && formData.password
          ? { password: formData.password }
          : {}),
      };
      const response = await userService.updateUser(selectedId, payload);
      if (response.ok) {
        toast.success("Usuario actualizado correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
        return;
      }

      toast.error(response.message || "Error al actualizar el usuario");
      return;
    }

    const createPayload: Parameters<typeof userService.createUser>[0] = {
      email: formData.email,
      password: formData.password!,
      name: formData.name,
      last_name: formData.last_name,
      is_admin: formData.is_admin,
      avatar_url: formData.avatar_url,
    };

    if (
      "createDealershipProfile" in formData &&
      formData.createDealershipProfile &&
      formData.dealership
    ) {
      createPayload.dealership = {
        name: formData.dealership.name.trim(),
        email: formData.dealership.email.trim(),
        phone_code: formData.dealership.phone.phone_code,
        phone: formData.dealership.phone.phone,
        address: formData.dealership.address.trim(),
      };
    }

    const response = await userService.createUser(createPayload);

    if (response.ok) {
      toast.success("Usuario creado correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
      return;
    }

    toast.error(response.message || "Error al crear el usuario");
  };

  return (
    <form
      className="flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto overscroll-contain pr-1 pb-1"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-3 rounded-xl border p-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Cuenta</h2>
          <p className="text-muted-foreground sr-only text-xs">
            Información de acceso del usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                <Input
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  type="email"
                  placeholder="Email"
                  {...field}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Contraseña {selectedId ? " (opcional)" : ""}
                </FieldLabel>

                <PasswordInput aria-invalid={fieldState.invalid} {...field} />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border p-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <p className="text-muted-foreground sr-only text-xs">
            Información personal del usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Controller
              name="avatar_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ImageInput
                    value={field.value}
                    onChange={field.onChange}
                    bucketName="profile-images"
                    path="avatars"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="space-y-3">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>

                  <Input
                    autoComplete="given-name"
                    aria-invalid={fieldState.invalid}
                    type="text"
                    placeholder="Nombre"
                    {...field}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="last_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Apellido</FieldLabel>

                  <Input
                    autoComplete="family-name"
                    aria-invalid={fieldState.invalid}
                    type="text"
                    placeholder="Apellido"
                    {...field}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </div>
      </section>

      <section className="flex items-start justify-between gap-3 rounded-xl border p-3">
        <Controller
          name="is_admin"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="is_admin" className="font-normal">
                  Es administrador
                </FieldLabel>
                <Switch
                  id="is_admin"
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-invalid={fieldState.invalid}
                />
              </div>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

      {!selectedId ? (
        <section className="flex flex-col gap-3 rounded-xl border p-3">
          <Controller
            name="createDealershipProfile"
            control={form.control}
            render={({ field }) => (
              <Field>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="create_dealership_profile"
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    aria-label="Crear perfil de concesionario"
                  />
                  <div className="space-y-1">
                    <FieldLabel
                      htmlFor="create_dealership_profile"
                      className="m-0"
                    >
                      Crear perfil de concesionario
                    </FieldLabel>
                    <FieldDescription>
                      Puedes completar el logo, la portada, el mapa y el resto
                      en Concesionarios.
                    </FieldDescription>
                  </div>
                </div>
              </Field>
            )}
          />

          {createDealershipProfile ? (
            <div className="flex flex-col gap-3 border-t pt-3">
              <Controller
                name="dealership.name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="dealership_name">
                      Nombre del concesionario
                    </FieldLabel>
                    <Input
                      id="dealership_name"
                      type="text"
                      placeholder="Nombre comercial"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="dealership.email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="dealership_email">
                      Correo de contacto del concesionario
                    </FieldLabel>
                    <Input
                      id="dealership_email"
                      type="email"
                      placeholder="contacto@concesionario.com"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="dealership.phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="dealership_phone">Teléfono</FieldLabel>
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
                    {form.formState.errors.dealership?.phone?.phone_code ? (
                      <FieldError
                        errors={[
                          form.formState.errors.dealership.phone.phone_code,
                        ]}
                      />
                    ) : null}
                    {form.formState.errors.dealership?.phone?.phone ? (
                      <FieldError
                        errors={[form.formState.errors.dealership.phone.phone]}
                      />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="dealership.address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="dealership_address">Dirección</FieldLabel>
                    <Input
                      id="dealership_address"
                      type="text"
                      placeholder="Calle, número, ciudad"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoToDealerships}
                >
                  Ir a concesionarios
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex justify-end pt-1">
        <Button type="submit">
          {selectedId ? "Actualizar usuario" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};
