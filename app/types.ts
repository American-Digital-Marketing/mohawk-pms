export type EntityId = bigint;
export type UUIDv7 = string;

// export type Components = {
//   "currency": [string];
//   "description": [string];
//   "feature": [string];
//   "file": [string];
//   "image": [string];
//   "merchandised_color": [string];
//   "pattern": [string];
//   "price": [UUIDv7, number];
//   "primary_color": [string];
//   "sku": [string];
//   "style": [string];
// };

export type ComponentTable = ComponentRegistration["component"];

export type ComponentRegistration =
  | CurrencyRegistration
  | DescriptionRegistration
  | FeatureRegistration
  | FileRegistration
  | ImageRegistration
  | MerchandisedColorRegistration
  | PatternRegistration
  | PrimaryColorRegistration
  | PriceRegistration
  | SkuRegistration
  | StyleRegistration;

export type CurrencyRegistration = {
  component: "currency";
  entities: EntityId[];
  codes: string[];
};

export type DescriptionRegistration = {
  component: "description";
  entities: EntityId[];
  contents: string[];
};

export type FeatureRegistration = {
  component: "feature";
  entities: EntityId[];
  contents: string[];
};

export type FileRegistration = {
  component: "file";
  entities: EntityId[];
  sources: string[];
};

export type ImageRegistration = {
  component: "image";
  entities: EntityId[];
  sources: string[];
  sortOrders: number[];
};

export type MerchandisedColorRegistration = {
  component: "merchandised_color";
  entities: EntityId[];
  names: string[];
};

export type PatternRegistration = {
  component: "pattern";
  entities: EntityId[];
  names: string[];
};

export type PrimaryColorRegistration = {
  component: "primary_color";
  entities: EntityId[];
  names: string[];
};

export type PriceRegistration = {
  component: "price";
  entities: EntityId[];
  codes: UUIDv7[];
  values: number[];
};

export type SkuRegistration = {
  component: "sku";
  entities: EntityId[];
  values: string[];
};

export type StyleRegistration = {
  component: "style";
  entities: EntityId[];
  names: string[];
};

// const variantsForProduct: Variant[] = `
// SELECT
// name
// , feature_image.url
// , price.value
// , size.length
// , size.width
// FROM entity e
// JOIN entity_feature_image efi ON efi.entity_id == e.id
// JOIN feature_image on feature_image.id == efi.feature_image_id
// JOIN entity_size es ON es.entity_id == e.id
// JOIN entity_price eprice ON eprice.entity_id == e.id
// JOIN entity_product eproduct on eproduct.entity_id == e.id
// GROUP BY product.id
// `
// const productStuff = `
// SELECT
// feature_image
// , related_products
// , description
// , features
// FROM
//   `;
