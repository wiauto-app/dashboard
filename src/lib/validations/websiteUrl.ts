/** Acepta URL con protocolo o dominio (p. ej. `tuconcesionario.com`). */
export const isValidWebsiteUrlInput = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  try {
    const candidate = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    const host = url.hostname.replace(/\.$/, "");
    if (!host || host.includes(" ")) {
      return false;
    }
    return host.includes(".") || host === "localhost";
  } catch {
    return false;
  }
};

export const normalizeWebsiteUrlForStorage = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
