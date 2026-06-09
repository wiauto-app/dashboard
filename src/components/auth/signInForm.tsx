import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";
import { SignInFormContent } from "./signInFormContent";

export const SignInForm = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleSuccess = async () => {
    await refreshUser();
    navigate({ to: "/" });
  };

  return <SignInFormContent onSuccess={handleSuccess} />;
};
