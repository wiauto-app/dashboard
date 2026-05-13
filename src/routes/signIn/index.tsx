import { SignInForm } from "@/components/auth/signInForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
