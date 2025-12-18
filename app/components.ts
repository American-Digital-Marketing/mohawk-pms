import { Pool } from "jsr:@db/postgres@0.19.5";
import { ComponentTable, EntityId, UUIDv7 } from "./types.ts";

// maybe these can just be renamed to get[component] since they should get or add the provided component
export async function addCurrency(pool: Pool, codes: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO currency (code)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (code) DO UPDATE
    SET code = EXCLUDED.code
    RETURNING id;
  `,
    [codes],
  );

  const currencyIds = queryResult.rows.map((row) => row[0]);

  // console.log(`created currencyId ${currencyId}.`);
  return currencyIds;
}

export async function addSku(pool: Pool, skus: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO sku (sku)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (sku) DO UPDATE
    SET sku = EXCLUDED.sku
    RETURNING id;
  `,
    [skus],
  );

  const skuIds = queryResult.rows.map((row) => row[0]);
  return skuIds;
}

export async function addDescription(pool: Pool, contents: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO description (contents)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (contents) DO UPDATE
    SET contents = EXCLUDED.contents
    RETURNING id;
  `,
    [contents],
  );

  const descriptionIds = queryResult.rows.map((row) => row[0]);
  return descriptionIds;
}

export async function addFeature(pool: Pool, contents: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO feature (contents)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (contents) DO UPDATE
    SET contents = EXCLUDED.contents
    RETURNING id;
  `,
    [contents],
  );

  const featureIds = queryResult.rows.map((row) => row[0]);
  return featureIds;
}

export async function addFile(pool: Pool, sources: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO file (source)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (source) DO UPDATE
    SET source = EXCLUDED.source
    RETURNING id;
  `,
    [sources],
  );

  const fileIds = queryResult.rows.map((row) => row[0]);
  return fileIds;
}

export async function addImage(pool: Pool, file_ids: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO image (file_id)
    SELECT * FROM UNNEST($1::uuid[])
    ON CONFLICT (file_id) DO UPDATE
    SET file_id = EXCLUDED.file_id
    RETURNING id;
  `,
    [file_ids],
  );

  const imageIds = queryResult.rows.map((row) => row[0]);
  return imageIds;
}

export async function addMerchandisedColor(pool: Pool, names: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO merchandised_color (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [names],
  );

  const merchandisedColorIds = queryResult.rows.map((row) => row[0]);
  return merchandisedColorIds;
}

export async function addPattern(pool: Pool, names: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO pattern (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [names],
  );

  const patternIds = queryResult.rows.map((row) => row[0]);
  return patternIds;
}

// NOTE: value is in cents, or equivalent non-decimal smallest value possible
// this MUST be associated with an entity
export async function addPrice(
  pool: Pool,
  entity_id: bigint,
  currency_id: UUIDv7,
  value: number,
): Promise<UUIDv7> {
  // console.log({ entity_id, currency_id, value });
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    "INSERT INTO price (entity_id, currency_id, value)\n" +
      "VALUES ($1, $2, $3)\n" +
      "ON CONFLICT (entity_id, currency_id) DO UPDATE\n" +
      "SET value = EXCLUDED.value\n" +
      ", currency_id = EXCLUDED.currency_id\n" +
      "RETURNING id;",
    [entity_id, currency_id, value],
  );

  const priceId = queryResult.rows[0][0];

  // console.log(`created priceId ${priceId}.`);
  return priceId;
}

export async function addPrimaryColor(pool: Pool, names: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO primary_color (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [names],
  );

  const insertedIds = queryResult.rows.map((row) => row[0]);
  return insertedIds;
}

export async function addStyle(pool: Pool, names: string[]): Promise<UUIDv7[]> {
  using client = await pool.connect();
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO style (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [names],
  );

  const styleId = queryResult.rows.map((row) => row[0]);

  return styleId;
}

export async function addComponents(
  pool: Pool,
  componentType: ComponentTable,
  componentValues: string[],
): Promise<UUIDv7[]> {
  let uuids: UUIDv7[] = [];

  switch (componentType) {
    case "currency": {
      uuids = await addCurrency(pool, componentValues);
      break;
    }
    case "description": {
      uuids = await addDescription(pool, componentValues);
      break;
    }
    case "feature": {
      uuids = await addFeature(pool, componentValues);
      break;
    }
    case "file": {
      uuids = await addFile(pool, componentValues);
      break;
    }
    case "image": {
      uuids = await addImage(pool, componentValues);
      break;
    }
    case "merchandised_color": {
      uuids = await addMerchandisedColor(pool, componentValues);
      break;
    }
    case "pattern": {
      uuids = await addPattern(pool, componentValues);
      break;
    }
    case "price": {
      throw new Error("Price must be registered directly with an entity");
    }
    case "primary_color": {
      uuids = await addPrimaryColor(pool, componentValues);
      break;
    }
    case "style": {
      uuids = await addStyle(pool, componentValues);
      break;
    }
    default:
      componentType satisfies never;
      break;
  }

  // db guard? probably won't ever happen
  if (uuids.length !== componentValues.length) {
    throw new Error("UUIDs length not equal to componentValues length");
  }

  return uuids;
}

export async function registerComponents(
  pool: Pool,
  componentType: ComponentTable,
  componentRegistration: [EntityId, UUIDv7][],
) {
  using client = await pool.connect();

  const junctionTable = "entity_" + componentType;
  const column = componentType + "_id";

  const entityIds: EntityId[] = [];
  const componentIds: UUIDv7[] = [];
  for (let i = 0; i < componentRegistration.length; i++) {
    const [entityId, componentId] = componentRegistration[i];
    entityIds.push(entityId);
    componentIds.push(componentId);
  }

  await client.queryArray(
    `
      INSERT INTO ${junctionTable} (entity_id, ${column})
      SELECT * FROM UNNEST($1::bigint[], $2::uuid[])
      ON CONFLICT (entity_id, ${column}) DO NOTHING
    `,
    [entityIds, componentIds],
  );
}

export async function registerImages(
  pool: Pool,
  images: [EntityId, UUIDv7, bigint][],
) {
  using client = await pool.connect();

  const junctionTable = "entity_image";
  const column = "image_id";

  await client.queryArray<[UUIDv7]>(
    `
      INSERT INTO ${junctionTable} (entity_id, ${column}, sort_order)
      VALUES ($1, $2, $3)
      ON CONFLICT (entity_id, ${column}) DO NOTHING
    `,
    images,
  );
}
