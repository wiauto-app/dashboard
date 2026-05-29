import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RolesSelector } from "../dynamicSelectors/rolesSelector";
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
      role_id: "",
      avatar_url: "",
      // image_url: "",
    },
  });

  console.log(form.formState.errors);

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        last_name: profile.last_name,
        email: profile.user.email,
        role_id: profile.role?.id,
        avatar_url: profile.avatar_url,
        // image_url: profile.image_url,
      });
    }
  }, [profile]);

  const onSubmit = async (formData: FormSchema) => {
    const dirtyFields = form.formState.dirtyFields;
    if (selectedId) {
      const userData = {
        email: formData.email,
        ...(dirtyFields.password && formData.password
          ? { password: formData.password }
          : {}),
      };
      const response = await userService.updateUser(selectedId, userData);
      if (response.ok) {
        const profileData = {
          name: formData.name,
          last_name: formData.last_name,
          role_id: formData.role_id,
          avatar_url: formData.avatar_url,
          // image_url: formData.image_url,
        };

        const profileResponse = await profileService.updateProfile(
          selectedId,
          profileData,
        );
        if (profileResponse.ok) {
          toast.success("Usuario actualizado correctamente");
          setIsOpen(false);
          setSelectedId(null);
          onSuccess?.();
        } else {
          toast.error("Error al actualizar el perfil");
        }
      } else {
        toast.error(response.message || "Error al actualizar el usuario");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      }
    } else {
      const response = await userService.createUser(formData as any);
      if (response.ok) {
        const profileResponse = await profileService.createProfile(
          response.data.id,
          {
            name: formData.name,
            last_name: formData.last_name,
            role_id: formData.role_id,
            avatar_url: formData.avatar_url,
            // image_url: formData.image_url,
          },
        );
        if (profileResponse?.ok) {
          toast.success("Usuario creado correctamente");
          setIsOpen(false);
          setSelectedId(null);
          onSuccess?.();
        } else {
          toast.error("Error al crear el perfil");
        }
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error(response.message || "Error al crear el usuario");
      }
    }
  };
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      {/* Cuenta */}
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Cuenta</h2>
          <p className="text-muted-foreground text-sm">
            Información de acceso del usuario.
          </p>
        </div>

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
      </section>

      {/* Perfil */}
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Perfil</h2>
          <p className="text-muted-foreground text-sm">
            Información personal del usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-2">
            <Controller
              name="avatar_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ImageInput
                    value={field.value}
                    onChange={(value) => {
                      console.log("value", value);
                      field.onChange(value);
                    }}
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

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
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

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </section>

      {/* Permisos */}
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Permisos</h2>
          <p className="text-muted-foreground text-sm">
            Rol y nivel de acceso del usuario.
          </p>
        </div>

        <Controller
          name="role_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Rol</FieldLabel>

              <RolesSelector
                onValueChange={field.onChange}
                value={field.value}
                ariaInvalid={fieldState.invalid}
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

      <div className="flex justify-end">
        <Button type="submit">
          {selectedId ? "Actualizar usuario" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};
