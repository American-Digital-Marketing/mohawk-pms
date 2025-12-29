import { Client } from "jsr:@db/postgres@0.19.5";
import { ComponentRegistration, ComponentTable, EntityId, UUIDv7 } from "./types.ts";

// maybe these can just be renamed to get[component] since they should get or add the provided component
export async function addCurrency(client: Client, codes: string[]): Promise<UUIDv7[]> {
  const distinctCodes = [...[...new Set(codes)]];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO currency (code)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (code) DO UPDATE
    SET code = EXCLUDED.code
    RETURNING id;
  `,
    [distinctCodes],
  );

  const currencyIds = queryResult.rows.map((row) => row[0]);

  // console.log(`created currencyId ${currencyId}.`);
  return currencyIds;
}

export async function addSku(client: Client, skus: string[]): Promise<UUIDv7[]> {
  const distinctSkus = [...new Set(skus)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO sku (sku)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (sku) DO UPDATE
    SET sku = EXCLUDED.sku
    RETURNING id;
  `,
    [distinctSkus],
  );

  const skuIds = queryResult.rows.map((row) => row[0]);
  return skuIds;
}

export async function addDescription(client: Client, contents: string[]): Promise<UUIDv7[]> {
  const distinctContents = [...new Set(contents)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO description (contents)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (contents) DO UPDATE
    SET contents = EXCLUDED.contents
    RETURNING id;
  `,
    [distinctContents],
  );

  const descriptionIds = queryResult.rows.map((row) => row[0]);
  return descriptionIds;
}

export async function addFeature(client: Client, contents: string[]): Promise<UUIDv7[]> {
  const distinctContents = [...new Set(contents)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO feature (contents)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (contents) DO UPDATE
    SET contents = EXCLUDED.contents
    RETURNING id;
  `,
    [distinctContents],
  );

  const featureIds = queryResult.rows.map((row) => row[0]);
  return featureIds;
}

export async function addFile(client: Client, sources: string[]): Promise<UUIDv7[]> {
  const distinctSources = [...new Set(sources)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO file (source)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (source) DO UPDATE
    SET source = EXCLUDED.source
    RETURNING id;
  `,
    [distinctSources],
  );

  const fileIds = queryResult.rows.map((row) => row[0]);
  return fileIds;
}

export async function addImage(client: Client, sources: string[]): Promise<UUIDv7[]> {
  const distinctSources = [...new Set(sources)];
  // the no-op update is required to always return the uuid of the image
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO image (file_id)
    SELECT file.id
    FROM UNNEST($1::text[]) as t(source)
    JOIN file ON file.source = t.source
    ON CONFLICT (file_id) DO UPDATE
    SET file_id = EXCLUDED.file_id
    RETURNING id;
  `,
    [distinctSources],
  );

  const imageIds = queryResult.rows.map((row) => row[0]);
  return imageIds;
}

export async function addMerchandisedColor(client: Client, names: string[]): Promise<UUIDv7[]> {
  const distinctNames = [...new Set(names)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO merchandised_color (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [distinctNames],
  );

  const merchandisedColorIds = queryResult.rows.map((row) => row[0]);
  return merchandisedColorIds;
}

export async function addPattern(client: Client, names: string[]): Promise<UUIDv7[]> {
  const distinctNames = [...new Set(names)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO pattern (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [distinctNames],
  );

  const patternIds = queryResult.rows.map((row) => row[0]);
  return patternIds;
}

// NOTE: value is in cents, or equivalent non-decimal smallest value possible
// this MUST be associated with an entity
export async function addPrice(
  client: Client,
  currencyCodes: string[],
  values: number[],
): Promise<UUIDv7[]> {
  if (currencyCodes.length !== values.length) {
    throw new Error("Error adding price component: currency codes and values length did not match");
  }

  // all of this crap can be eliminated if we never use the return value
  const codeSet = new Set<string>();
  const valueSet = new Set<number>();
  const distinctCurrencyCodes: string[] = [];
  const distinctValues: number[] = [];
  for (let i = 0; i < currencyCodes.length; i++) {
    const code = currencyCodes[i];
    const value = values[i];

    if (codeSet.has(code) && valueSet.has(value)) {
      // seen this combo before
      continue;
    } else {
      distinctCurrencyCodes.push(code);
      distinctValues.push(value);
      codeSet.add(code);
      valueSet.add(value);
    }
  }

  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO price (currency_id, value)
    SELECT 
      currency.id
      , t.value
    FROM UNNEST(
      $1::text[]
      , $2::integer[]
    ) AS t(currency_code, value)
    JOIN currency ON currency.code = t.currency_code
    ON CONFLICT (currency_id, value) DO UPDATE
    SET value = EXCLUDED.value
    , currency_id = EXCLUDED.currency_id
    RETURNING id;`,
    [distinctCurrencyCodes, distinctValues],
  );

  const priceId = queryResult.rows.map((row) => row[0]);

  return priceId;
}

export async function addPrimaryColor(client: Client, names: string[]): Promise<UUIDv7[]> {
  const distinctNames = [...new Set(names)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO primary_color (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [distinctNames],
  );

  const insertedIds = queryResult.rows.map((row) => row[0]);
  return insertedIds;
}

export async function addStyle(client: Client, names: string[]): Promise<UUIDv7[]> {
  const distinctNames = [...new Set(names)];
  const queryResult = await client.queryArray<[UUIDv7]>(
    `
    INSERT INTO style (name)
    SELECT * FROM UNNEST($1::text[])
    ON CONFLICT (name) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id;
  `,
    [distinctNames],
  );

  const styleId = queryResult.rows.map((row) => row[0]);

  return styleId;
}

export async function addComponents(
  client: Client,
  input: ComponentRegistration,
): Promise<UUIDv7[]> {
  let uuids: UUIDv7[] = [];

  let expectedLength = 0;
  switch (input.component) {
    case "currency": {
      expectedLength = input.codes.length;
      uuids = await addCurrency(client, input.codes);
      break;
    }
    case "description": {
      expectedLength = input.contents.length;
      uuids = await addDescription(client, input.contents);
      break;
    }
    case "feature": {
      expectedLength = input.contents.length;
      uuids = await addFeature(client, input.contents);
      break;
    }
    case "file": {
      expectedLength = input.sources.length;
      uuids = await addFile(client, input.sources);
      break;
    }
    case "image": {
      expectedLength = input.sources.length;
      uuids = await addImage(client, input.sources);
      break;
    }
    case "merchandised_color": {
      expectedLength = input.names.length;
      uuids = await addMerchandisedColor(client, input.names);
      break;
    }
    case "pattern": {
      expectedLength = input.names.length;
      uuids = await addPattern(client, input.names);
      break;
    }
    case "price": {
      expectedLength = input.entities.length;
      uuids = await addPrice(client, input.codes, input.values);
      break;
    }
    case "primary_color": {
      expectedLength = input.names.length;
      uuids = await addPrimaryColor(client, input.names);
      break;
    }
    case "sku": {
      expectedLength = input.values.length;
      uuids = await addStyle(client, input.values);
      break;
    }
    case "style": {
      expectedLength = input.names.length;
      uuids = await addStyle(client, input.names);
      break;
    }
    default:
      input satisfies never;
      break;
  }

  // db guard? probably won't ever happen
  // this was wrong after i made sets for a weird on conflict bug
  // if (uuids.length !== expectedLength) {
  //   throw new Error(
  //     `While adding component '${input.component}': UUIDs length not equal to componentValues length`,
  //   );
  // }

  return uuids;
}

export async function registerComponentsByValue(
  client: Client,
  input: ComponentRegistration,
) {
  switch (input.component) {
    case "currency": {
      // // we don't currently want to do this ever
      // await client.queryArray(
      //   `
      //   INSERT INTO entity_currency (entity_id, currency_id)
      //   SELECT
      //     t.entity_id
      //     , currency.id
      //   FROM UNNEST(
      //     $1::bigint[]
      //     , $2::text[]
      //   ) AS t(entity_id, currency_code)
      //   JOIN currency ON currency.code = t.currency_code
      //   ON CONFLICT (entity_id, currency_id) DO NOTHING
      // `,
      //   [input.entities, input.codes],
      // );
      break;
    }
    case "description": {
      await client.queryArray(
        `
        INSERT INTO entity_description (entity_id, description_id)
        SELECT 
          t.entity_id
          , description.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, contents)
        JOIN description ON description.contents = t.contents
        ON CONFLICT (entity_id, description_id) DO NOTHING
      `,
        [input.entities, input.contents],
      );
      break;
    }
    case "feature": {
      await client.queryArray(
        `
        INSERT INTO entity_feature (entity_id, feature_id)
        SELECT 
          t.entity_id
          , feature.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, contents)
        JOIN feature ON feature.contents = t.contents
        ON CONFLICT (entity_id, feature_id) DO NOTHING
      `,
        [input.entities, input.contents],
      );
      break;
    }
    case "file": {
      // // currently entities have no direct relationship to files
      // await client.queryArray(
      //   `
      //   INSERT INTO entity_file (entity_id, file_id)
      //   SELECT
      //     t.entity_id
      //     , file.id
      //   FROM UNNEST(
      //     $1::bigint[]
      //     , $2::text[]
      //   ) AS t(entity_id, source)
      //   JOIN file ON file.source = t.source
      //   ON CONFLICT (entity_id, file_id) DO NOTHING
      // `,
      //   [input.entities, input.sources],
      // );
      break;
    }
    case "image": {
      await client.queryArray(
        `
        INSERT INTO entity_image (entity_id, image_id, sort_order)
        SELECT 
          t.entity_id
          , image.id
          , t.sort_order
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
          , $3::integer[]
        ) AS t(entity_id, source, sort_order)
        JOIN file ON file.source = t.source
        JOIN image ON image.file_id = file.id
        ON CONFLICT (entity_id, image_id) DO NOTHING
      `,
        [input.entities, input.sources, input.sortOrders],
      );
      break;
    }
    case "merchandised_color": {
      await client.queryArray(
        `
        INSERT INTO entity_merchandised_color (entity_id, merchandised_color_id)
        SELECT 
          t.entity_id
          , merchandised_color.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, name)
        JOIN merchandised_color ON merchandised_color.name = t.name
        ON CONFLICT (entity_id, merchandised_color_id) DO NOTHING
      `,
        [input.entities, input.names],
      );
      break;
    }
    case "pattern": {
      await client.queryArray(
        `
        INSERT INTO entity_pattern (entity_id, pattern_id)
        SELECT 
          t.entity_id
          , pattern.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, name)
        JOIN pattern ON pattern.name = t.name
        ON CONFLICT (entity_id, pattern_id) DO NOTHING
      `,
        [input.entities, input.names],
      );
      break;
    }
    case "price": {
      await client.queryArray(
        `
        INSERT INTO entity_price (entity_id, price_id)
        SELECT 
          t.entity_id
          , price.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
          , $3::integer[]
        ) AS t(entity_id, currency_code, value)
        JOIN currency ON currency.code = t.currency_code
        JOIN price ON price.value = t.value AND price.currency_id = currency.id
        ON CONFLICT (entity_id, price_id) DO NOTHING
      `,
        [input.entities, input.codes, input.values],
      );
      break;
    }
    case "primary_color": {
      await client.queryArray(
        `
        INSERT INTO entity_primary_color (entity_id, primary_color_id)
        SELECT 
          t.entity_id
          , primary_color.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, name)
        JOIN primary_color ON primary_color.name = t.name
        ON CONFLICT (entity_id, primary_color_id) DO NOTHING
      `,
        [input.entities, input.names],
      );
      break;
    }
    case "sku": {
      await client.queryArray(
        `
        INSERT INTO entity_sku (entity_id, sku_id)
        SELECT 
          t.entity_id
          , sku.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, sku)
        JOIN sku ON sku.value = t.sku
        ON CONFLICT (entity_id, sku_id) DO NOTHING
      `,
        [input.entities, input.values],
      );
      break;
    }
    case "style": {
      await client.queryArray(
        `
        INSERT INTO entity_style (entity_id, style_id)
        SELECT 
          t.entity_id
          , style.id
        FROM UNNEST(
          $1::bigint[]
          , $2::text[]
        ) AS t(entity_id, name)
        JOIN style ON style.name = t.name
        ON CONFLICT (entity_id, style_id) DO NOTHING
      `,
        [input.entities, input.names],
      );
      break;
    }
    default: {
      input satisfies never;
      break;
    }
  }
}

export async function registerComponents(
  client: Client,
  componentType: ComponentTable,
  componentRegistration: [EntityId, UUIDv7][],
) {
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
  client: Client,
  images: [EntityId, UUIDv7, bigint][],
) {
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
