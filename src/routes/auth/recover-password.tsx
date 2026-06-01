import { AuthRecoveryLayout } from "@/components/auth/authRecoveryLayout";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/authServices/AuthService";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const recover_password_schema = z.object({
  email: z.email({ error: "Ingresa un email válido." }),
});

type RecoverPasswordSchema = z.infer<typeof recover_password_schema>;

export const Route = createFileRoute("/auth/recover-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [is_submitted, set_is_submitted] = useState(false);
  const form = useForm<RecoverPasswordSchema>({
    resolver: standardSchemaResolver(recover_password_schema),
    defaultValues: {
      email: "",
    },
  });

  const is_submitting = form.formState.isSubmitting;

  const handleSubmit = async ({ email }: RecoverPasswordSchema) => {
    const response = await authService.requestAdminPasswordRecovery(email.trim());
    if (!response.ok) {
      toast.error(response.message || "No se pudo enviar la solicitud");
      return;
    }

    set_is_submitted(true);
    toast.success("Si el email está registrado, te enviamos instrucciones.");
  };

  if (is_submitted) {
    return (
      <AuthRecoveryLayout
        title="Revisa tu correo"
        description="Si existe una cuenta de administración con ese email, recibirás un enlace para restablecer tu contraseña."
      >
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-base"
          onClick={() => void navigate({ to: "/signIn/" })}
        >
          Volver al inicio de sesión
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => set_is_submitted(false)}
        >
          Enviar de nuevo
        </Button>
      </AuthRecoveryLayout>
    );
  }

  return (
    <AuthRecoveryLayout
      title="Recuperar contraseña"
      description="Ingresa el email de tu cuenta de administración. Te enviaremos un enlace para restablecer la contraseña."
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <div className="relative">
                <Mail
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="email"
                  autoComplete="email"
                  className="h-11 pl-10 text-base md:text-sm"
                  placeholder="correo@empresa.com"
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
          Enviar enlace de recuperación
          {is_submitting && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>

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
