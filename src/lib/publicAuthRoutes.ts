const PUBLIC_AUTH_ROUTE_PREFIXES = [
  "/signIn",
  "/auth/recover-password",
  "/auth/reset-password",
] as const;

export const isPublicAuthRoute = (
  pathname: string = window.location.pathname,
): boolean => {
  return PUBLIC_AUTH_ROUTE_PREFIXES.some((prefix) => {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }

    return pathname.includes(prefix);
  });
};

export const isPasswordRecoveryRoute = (
  pathname: string = window.location.pathname,
): boolean => {
  return (
    pathname.startsWith("/auth/recover-password") ||
    pathname.startsWith("/auth/reset-password")
  );
};
