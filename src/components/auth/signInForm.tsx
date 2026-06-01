import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { SignInSchemaType } from "./types/auth.types";
import { signInSchema } from "./validations/auth.validations";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/passwordInput";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { authService } from "@/services/authServices/AuthService";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { TwoFactorLoginStep } from "./twoFactorLoginStep";

const inputWithIconClassName = "h-11 pl-10 text-base md:text-sm";

type SignInStep = "credentials" | "two_factor";

export const SignInForm = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, set_step] = useState<SignInStep>("credentials");
  const [pending_email, set_pending_email] = useState("");
  const [isLoading, set_isLoading] = useState(false);
  const form = useForm<SignInSchemaType>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const resumePendingChallenge = async () => {
      const response = await authService.getTwoFactorChallenge();
      if (response.ok && response.data?.type === "2fa_required") {
        set_pending_email(response.data.email);
        set_step("two_factor");
      }
    };

    void resumePendingChallenge();
  }, []);

  const handleLoginSuccess = async () => {
    await refreshUser();
    navigate({ to: "/" });
  };

  const onSubmit = async (data: SignInSchemaType) => {
    set_isLoading(true);
    try {
      const response = await authService.login(data.email, data.password);

      if (!response.ok || response.status === 401) {
        toast.error(response.message || "Credenciales incorrectas");
        return;
      }

      const login_data = response.data?.data;

      if (login_data?.type === "2fa_required") {
        set_pending_email(login_data.email ?? data.email);
        set_step("two_factor");
        return;
      }

      await handleLoginSuccess();
    } catch (error) {
      toast.error(error.message || "Credenciales incorrectas");
    } finally {
      set_isLoading(false);
    }
  };

  const handleBackToCredentials = async () => {
    set_step("credentials");
    set_pending_email("");
  };

  if (step === "two_factor") {
    return (
      <TwoFactorLoginStep
        email={pending_email}
        onSuccess={handleLoginSuccess}
        onBack={handleBackToCredentials}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground">
        Inicia Sesión
      </h1>

      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>
                Email <span className="text-destructive">*</span>
              </FieldLabel>
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
                  className={cn(
                    inputWithIconClassName,
                    fieldState.invalid && "border-destructive",
                  )}
                  {...field}
                />
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-2">
              <FieldLabel htmlFor={field.name}>
                Contraseña <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="relative">
                <Lock
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <PasswordInput
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    inputWithIconClassName,
                    "pr-10",
                    fieldState.invalid && "border-destructive",
                  )}
                  {...field}
                />
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox id="keep-signed-in" />
          <span className="text-sm text-muted-foreground">
            No cerrar sesión
          </span>
        </label>

        <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={isLoading}>
          Iniciar Sesión {isLoading && <Loader2 className="size-4 animate-spin" />}
        </Button>
      </form>

      <button
        type="button"
        className="mt-8 flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Lock aria-hidden className="size-3.5" />
        Olvidó la contraseña?
      </button>
    </div>
  );
};
