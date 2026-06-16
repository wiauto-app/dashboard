export interface ProvinceCatalogItem {
  id: string;
  name: string;
  slug: string;
  cod_prov: string;
  cod_ccaa: string;
  image_url: string | null;
}

export interface CommunityCatalogItem {
  id: string;
  name: string | null;
  slug: string;
  cod_ccaa: string;
  noml_ccaa: string | null;
  image_url: string | null;
}

export interface MunicipalityCatalogItem {
  id: string;
  name: string | null;
  slug: string;
  ineCode: string | null;
  nuts1: string | null;
  nuts2: string | null;
  nuts3: string | null;
  image_url: string | null;
}
