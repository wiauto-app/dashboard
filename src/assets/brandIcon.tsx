import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

const VIEWBOX_WIDTH = 174;
const VIEWBOX_HEIGHT = 59;

export type BrandIconProps = {
  className?: string;
  /** Ancho en px (número) o valor CSS (`rem`, `%`, etc.). Con solo número, el alto mantiene la proporción del logo. */
  width?: number | string;
  /** Alto en px (número) o valor CSS. Con solo número, el ancho mantiene la proporción del logo. */
  height?: number | string;
};

const to_css_length = (value: number | string) =>
  typeof value === "number" ? `${value}px` : value;

export const BrandIcon = ({ className, width, height }: BrandIconProps) => {
  const style: CSSProperties = {};

  if (width !== undefined) {
    style.width = to_css_length(width);
  }
  if (height !== undefined) {
    style.height = to_css_length(height);
  }

  if (typeof width === "number" && height === undefined) {
    style.height = `${(width * VIEWBOX_HEIGHT) / VIEWBOX_WIDTH}px`;
  } else if (typeof height === "number" && width === undefined) {
    style.width = `${(height * VIEWBOX_WIDTH) / VIEWBOX_HEIGHT}px`;
  }

  return (
    <img
      src="https://media.wiauto.es/wiauto-strapi/Group_1000002682_1_8cc20235e5.avif"
      alt="Wiauto Logo"
      className={cn("inline-block shrink-0 object-contain", className)}
      style={Object.keys(style).length > 0 ? style : undefined}
    />
  );
};
