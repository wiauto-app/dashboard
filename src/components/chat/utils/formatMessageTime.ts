import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export const formatMessageTime = (iso_date: string): string => {
  const date = new Date(iso_date);
  if (isToday(date)) {
    return format(date, "HH:mm", { locale: es });
  }
  if (isYesterday(date)) {
    return `Ayer ${format(date, "HH:mm", { locale: es })}`;
  }
  return format(date, "d MMM HH:mm", { locale: es });
};

export const formatListMessageTime = (iso_date: string | null): string => {
  if (!iso_date) return "";
  const date = new Date(iso_date);
  if (isToday(date)) {
    return format(date, "HH:mm", { locale: es });
  }
  if (isYesterday(date)) {
    return "Ayer";
  }
  return format(date, "d MMM", { locale: es });
};
