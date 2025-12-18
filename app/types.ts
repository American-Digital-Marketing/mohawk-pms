export type ComponentTable =
  | "currency"
  | "description"
  | "feature"
  | "file"
  | "image"
  | "merchandised_color"
  | "pattern"
  | "price"
  | "primary_color"
  | "style";

export type ComponentSets = Record<ComponentTable, Set<string>>;

export type EntityValueMap = Record<ComponentTable, [EntityId, string][]>;

export type EntityId = bigint;
export type UUIDv7 = string;
