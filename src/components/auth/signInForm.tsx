import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Controller, useForm } from "react-hook-form";

import type { SignInSchemaType } from "./types/auth.types";
import { signInSchema } from "./validations/auth.validations";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/passwordInput";
import { Button } from "../ui/button";
import { authService } from "@/services/authServices/AuthService";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const SignInForm = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const form = useForm<SignInSchemaType>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    const response = await authService.login(data.email, data.password);
    if (response.ok && response.status !== 401) {
      await refreshUser();
      navigate({ to: "/" });
    } else {
      toast.error(response.message);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
            <Input aria-invalid={fieldState.invalid} type="email" {...field} />
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
      <Button type="submit">Sign In</Button>
    </form>
  );
};
