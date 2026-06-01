import { AuthRecoveryLayout } from "@/components/auth/authRecoveryLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/passwordInput";
import { authService } from "@/services/authServices/AuthService";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const reset_password_search_schema = z.object({
  token: z.string().optional(),
});

const reset_password_schema = z
  .object({
    password: z.string().min(8, {
      error: "La contraseña debe tener al menos 8 caracteres.",
    }),
    confirm_password: z.string().min(8, {
      error: "La confirmación debe tener al menos 8 caracteres.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

type ResetPasswordSchema = z.infer<typeof reset_password_schema>;

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search) => reset_password_search_schema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const has_token = Boolean(token?.trim());

  const form = useForm<ResetPasswordSchema>({
    resolver: standardSchemaResolver(reset_password_schema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const is_submitting = form.formState.isSubmitting;

  const handleSubmit = async ({ password }: ResetPasswordSchema) => {
    if (!token?.trim()) {
      toast.error("El enlace de recuperación no es válido.");
      return;
    }

    const response = await authService.changeAdminPasswordRecovery(
      token.trim(),
      password,
    );

    if (!response.ok) {
      const is_invalid_token =
        response.status === 400 ||
        response.status === 401 ||
        response.status === 404;

      if (is_invalid_token) {
        toast.error("El enlace expiró o no es válido. Solicita uno nuevo.");
        return;
      }

      toast.error(response.message || "No se pudo actualizar la contraseña.");
      return;
    }

    toast.success("Contraseña actualizada correctamente.");
    void navigate({
      to: "/signIn/",
      search: { password_reset: "success" },
      replace: true,
    });
  };

  if (!has_token) {
    return (
      <AuthRecoveryLayout
        title="Enlace inválido"
        description="El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo."
        hero_text="Restablece tu contraseña de administración"
      >
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-base"
          render={<Link to="/auth/recover-password" />}
        >
          Solicitar nuevo enlace
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full"
          render={<Link to="/signIn/" />}
        >
          Volver al inicio de sesión
        </Button>
      </AuthRecoveryLayout>
    );
  }

  return (
    <AuthRecoveryLayout
      title="Nueva contraseña"
      description="Elige una contraseña segura para tu cuenta de administración."
      hero_text="Restablece tu contraseña de administración"
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>Nueva contraseña</FieldLabel>
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <PasswordInput
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  className="h-11 pl-10 pr-10 text-base md:text-sm"
                  {...field}
                />
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirm_password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>Confirmar contraseña</FieldLabel>
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <PasswordInput
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  className="h-11 pl-10 pr-10 text-base md:text-sm"
                  {...field}
                />
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full text-base"
          disabled={is_submitting}
        >
          Guardar nueva contraseña
          {is_submitting && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        className="mt-4 w-full"
        render={<Link to="/auth/recover-password" />}
      >
        Solicitar un nuevo enlace
      </Button>
    </AuthRecoveryLayout>
  );
}
