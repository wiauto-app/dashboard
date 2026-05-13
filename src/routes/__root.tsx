import { Providers } from "@/context/providers";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => {
  return (
    <>
      <Providers>
        <Outlet />
      </Providers>
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({ component: RootLayout });
