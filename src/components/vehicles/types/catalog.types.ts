import type { PaginationParams } from "@/types/general.types";

export interface CatalogItemWithSlug {
  id: string;
  name: string;
  slug: string;
}

export interface ColorCatalogItem extends CatalogItemWithSlug {
  hex_code: string;
}

export interface DgtLabelCatalogItem extends CatalogItemWithSlug {
  code: string;
  description: string;
}

export interface WarrantyTypeCatalogItem extends CatalogItemWithSlug {
  description: string;
}

/** Servicios opcionales del anuncio (catálogo `v1/services`). */
export interface VehicleServiceCatalogItem extends CatalogItemWithSlug {
  description: string;
}

export interface CatalogMakeItem {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogVersionItem {
  id: number;
  make_id: number;
  model_id: number;
  body_type_id: number;
  fuel_type_id: number;
  year_id: number;
  name: string;
  slug: string;
}

export interface CatalogVersionPaginationParams extends PaginationParams {
  model_id?: number;
  fuel_type_id?: number;
  year_id?: number;
}


export interface CatalogModelItem {
  id: number;
  make_id: number;
  model_id: number;
  name: string;
  slug: string;
}

export interface CatalogModelPaginationParams extends PaginationParams {
  make_id?: number;
}

export interface CatalogBodyTypeItem {
  id: number;
  body_type_id: number;
  doors: number;
  name: string;
  slug: string;
}

export interface CatalogBodyTypePaginationParams extends PaginationParams {
  model_id?: number;
}

export interface CatalogFuelTypeItem {
  id: number;
  fuel_id: number;
  name: string;
  slug: string;
  can_charge: boolean;
}

export interface CatalogFuelTypePaginationParams extends PaginationParams {
  model_id?: number;
}

export interface CatalogYearItem {
  id: number;
  year: number;
  slug: string;
}

export interface CatalogYearPaginationParams extends PaginationParams {
  model_id?: number;
  body_type_id?: number;
}