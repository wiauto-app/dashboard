import loginImage from "@/assets/login-image.webp";
import { BrandIcon } from "@/assets/brandIcon";
import { SignInForm } from "@/components/auth/signInForm";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/signIn/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }
    void navigate({ to: "/", replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4 sm:p-6 w-full">
      <Card className="w-full max-w-5xl overflow-hidden border py-0 shadow-lg">
        <div className="grid min-h-[min(720px,90vh)] md:grid-cols-2">
          <section
            aria-hidden="true"
            className="relative min-h-56 overflow-hidden md:min-h-0"
          >
            <img
              src={loginImage}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative flex h-full flex-col items-center justify-center gap-6 px-8 py-12 text-center">
              <BrandIcon width={200} className="drop-shadow-sm" />
              <p className="max-w-xs text-lg font-semibold leading-snug text-white">
                Encuentra o vende tu próximo coche hoy!
              </p>
            </div>
          </section>

          <section className="flex flex-col justify-center bg-card px-8 py-10 sm:px-12 sm:py-14">
            <SignInForm />
          </section>
        </div>
      </Card>
    </div>
  );
}
