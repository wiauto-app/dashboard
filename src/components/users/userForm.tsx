import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  updateUserSchema,
  userSchema,
} from "@/validations/resources/user.schema";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { PasswordInput } from "../ui/passwordInput";
import { toast } from "sonner";
import { profileService } from "@/services/profiles/profileService";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { profileSchema } from "@/validations/resources/profile.schema";
import type z from "zod";
import { userService } from "@/services/users/userService";
import { ImageInput } from "../ui/imageInput";
import { Switch } from "../ui/switch";

export const UserForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const formSchema = selectedId
    ? updateUserSchema.merge(profileSchema)
    : userSchema.merge(profileSchema);
  type FormSchema = z.infer<typeof formSchema>;
  const { data: profile } = useQuery({
    queryKey: ["profile", selectedId],
    queryFn: () => profileService.getProfile(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      last_name: "",
      is_admin: false,
      avatar_url: "",
      // image_url: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        last_name: profile.last_name,
        email: profile.user.email,
        is_admin: profile.user.is_admin === true,
        avatar_url: profile.avatar_url,
        // image_url: profile.image_url,
      });
    }
  }, [profile, form]);

  const onSubmit = async (formData: FormSchema) => {
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
    } else {
      const response = await userService.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        last_name: formData.last_name,
        is_admin: formData.is_admin,
        avatar_url: formData.avatar_url,
      });

      if (response.ok) {
        toast.success("Usuario creado correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
        return;
      }

      toast.error(response.message || "Error al crear el usuario");
    }
  };
  return (
    <form
      className="flex max-h-[calc(100dvh-5rem)] flex-col gap-3 overflow-y-auto overscroll-contain pr-1 pb-1"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Cuenta */}
      <section className="flex flex-col gap-3 rounded-xl border p-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Cuenta</h2>
          <p className="text-muted-foreground text-xs sr-only">
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
                  Password {selectedId ? " (Opcional)" : ""}
                </FieldLabel>

                <PasswordInput aria-invalid={fieldState.invalid} {...field} />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </section>

      {/* Perfil */}
      <section className="flex flex-col gap-3 rounded-xl border p-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <p className="text-muted-foreground text-xs sr-only">
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

      {/* Acceso admin */}
      <section className="flex items-start justify-between gap-3 rounded-xl border p-3">
        <Controller
          name="is_admin"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2 justify-between">
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

      <div className="flex justify-end pt-1">
        <Button type="submit">
          {selectedId ? "Actualizar usuario" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};
