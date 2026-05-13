import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RolesSelector } from "../dynamicSelectors/rolesSelector";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  userSchema,
  type UserSchema,
} from "@/validations/resources/user.schema";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { PasswordInput } from "../ui/passwordInput";
import { toast } from "sonner";
import { profileService } from "@/services/profiles/profileService";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

export const UserForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);
  const form = useForm<UserSchema>({
    resolver: standardSchemaResolver(userSchema),
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      password: "",
      role_id: "",
    },
  });
  const onSubmit = (data: UserSchema) => {
    profileService.createProfile(data).then((profile) => {
      if (profile) {
        toast.success("Usuario creado correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error("Error al crear el usuario");
      }
    });
  };
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
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
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
            <PasswordInput aria-invalid={fieldState.invalid} {...field} />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
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

      <Button type="submit">Guardar</Button>
    </form>
  );
};
