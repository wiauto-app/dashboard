import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";

import { ImageInput } from "@/components/ui/imageInput";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { accountService } from "@/services/account/accountService";
import type { AccountSettings } from "@/types/account.types";
import {
  myProfileSchema,
  type MyProfileSchema,
} from "@/validations/account/myProfile.schema";

type ProfileSettingsSectionProps = {
  account: AccountSettings;
  onUpdated: () => Promise<void>;
};

export const ProfileSettingsSection = ({
  account,
  onUpdated,
}: ProfileSettingsSectionProps) => {
  const form = useForm<MyProfileSchema>({
    resolver: standardSchemaResolver(myProfileSchema),
    defaultValues: {
      name: account.name,
      last_name: account.last_name ?? "",
      avatar_url: account.avatar_url ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: account.name,
      last_name: account.last_name ?? "",
      avatar_url: account.avatar_url ?? "",
    });
  }, [account, form]);

  const handleSubmit = async (values: MyProfileSchema) => {
    const response = await accountService.updateMyProfile({
      name: values.name,
      last_name: values.last_name || undefined,
      avatar_url: values.avatar_url || undefined,
    });

    if (response.ok) {
      toast.success("Perfil actualizado correctamente");
      await onUpdated();
      return;
    }

    toast.error("No se pudo actualizar el perfil");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Nombre, apellidos y foto de perfil visibles en la aplicación.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex flex-col gap-4">
        <CardContent className="flex flex-col gap-4">
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
                  referenceId={account.id}
                  label="Avatar"
                  description="PNG, JPG o WEBP"
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Nombre</FieldLabel>
                  <Input
                    id="profile-name"
                    autoComplete="given-name"
                    aria-invalid={fieldState.invalid}
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
                  <FieldLabel htmlFor="profile-last-name">Apellidos</FieldLabel>
                  <Input
                    id="profile-last-name"
                    autoComplete="family-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Apellidos"
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="justify-end ">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando…" : "Guardar perfil"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
