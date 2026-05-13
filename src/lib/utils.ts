import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const objectToQueryString = (obj?: any) => {
  if (!obj) return "";
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    // Omitir valores undefined, null o strings vacíos
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Si es un array, agregar cada valor
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          params.append(key, String(v));
        }
      });
    } else {
      // Si es un valor simple, agregarlo directamente
      params.append(key, String(value));
    }
  });

  return params.toString();
}
