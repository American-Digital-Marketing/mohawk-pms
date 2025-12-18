import { parse } from "@std/csv";
import { ClientOptions, Pool } from "jsr:@db/postgres@0.19.5";
import { ComponentSets, ComponentTable, EntityId, EntityValueMap, UUIDv7 } from "./types.ts";
import {
  addComponents,
  addCurrency,
  addDescription,
  addFeature,
  addFile,
  addImage,
  addMerchandisedColor,
  addPattern,
  addPrice,
  addPrimaryColor,
  addStyle,
  registerComponents,
  registerImages,
} from "./components.ts";
import { createEntity } from "./entity.ts";

const N_THREADS = 8;

const CENTS_PER_DOLLAR = 100;

const TABLES = {
  "Rug Copy": "description",
  // Pattern is a semicolon separated list of patterns, initial cap
  "Pattern": "pattern",
  "Feature 1": "feature",
  "Feature 2": "feature",
  "Feature 3": "feature",
  "Feature 4": "feature",
  "Feature 5": "feature",
  "MSRP": "price",
  "Style": "style",
  "Basic Color Group": "primary_color",
  "Color Name": "merchandised_color",
} satisfies Record<string, ComponentTable>;

try {
  const config: ClientOptions = {
    user: Deno.env.get("POSTGRES_USER"),
    database: Deno.env.get("POSTGRES_DB"),
    password: Deno.env.get("POSTGRES_PASSWORD"),
    hostname: "localhost",
    port: 9876,
  };

  const pool = new Pool(config, N_THREADS);

  const filename = "./data/20250929-karastan-products.csv";
  const text = await Deno.readTextFile(filename);
  const rows = parse(text, { skipFirstRow: true });

  const createdCurrencyIds = await addCurrency(pool, ["USD"]);
  const usdCurrencyId = createdCurrencyIds[0];

  // const data: Record<string, string[]> = {};
  // extract rows into separate sets, one per component
  // turn set into list, to enable index based ids
  // add those components, gathering their created uuids
  // register those components with the correct entity ids
  // how do we know which component goes with which entity, once created?
  // use index in component list to identify a component
  // i assume the return value from postgres is in order?
  //
  const devTestingRows = rows.slice(0, 50);
  const [components, entityValueMap]: [ComponentSets, EntityValueMap] =
    await extractComponentsFromRows(
      pool,
      devTestingRows,
      usdCurrencyId,
    );

  const promises: Promise<void>[] = [];

  // consider eliminating the set entirely
  for (
    const [key, valueSet] of Object.entries(components)
  ) {
    const valueList = [...valueSet];
    const componentTable = key as ComponentTable;

    if (
      componentTable !== "price" && componentTable !== "image" && componentTable !== "file" &&
      componentTable !== "currency"
    ) {
      const entityValues = entityValueMap[componentTable];
      promises.push(addAndRegisterComponents(pool, componentTable, entityValues, valueList));
    }
  }

  // const rowEntries = Object.values(rows);
  // const quotient = Math.floor(rowEntries.length / N_THREADS);
  // const remainder = rowEntries.length % N_THREADS;
  //
  // for (let i = 0; i < N_THREADS; i++) {
  //   const hasBonus = i < remainder;
  //
  //   let start = 0;
  //   let end = 0;
  //   if (hasBonus) {
  //     start = (quotient * i) + i;
  //     end = start + quotient + 1;
  //   } else {
  //     start = (quotient * i) + remainder;
  //     end = start + quotient;
  //   }
  //
  //   const rowBatch = rowEntries.slice(start, end);
  //   promises.push(processRows(pool, rowBatch, usdCurrencyId));
  // }
} catch (err) {
  console.error(err);
}

/**
 * A small utility function on records to either append to an existing array at KEY,
 * or instatiate a new array at KEY with one entry VAL.
 */
export function safePush<V>(record: Record<string, V[]>, key: string, val: V) {
  if (!record[key]) {
    record[key] = [val];
  } else {
    record[key].push(val);
  }
}

async function extractComponentsFromRows(
  pool: Pool,
  rows: Record<string, string>[],
  defaultCurrencyUuid: string,
): Promise<[ComponentSets, EntityValueMap]> {
  const components: Record<ComponentTable, Set<string>> = {
    currency: new Set<string>(),
    description: new Set<string>(),
    feature: new Set<string>(),
    file: new Set<string>(),
    image: new Set<string>(),
    merchandised_color: new Set<string>(),
    pattern: new Set<string>(),
    price: new Set<string>(),
    primary_color: new Set<string>(),
    style: new Set<string>(),
  };

  const entityValues: Record<ComponentTable, [EntityId, string][]> = {
    currency: [],
    description: [],
    feature: [],
    file: [],
    image: [],
    merchandised_color: [],
    pattern: [],
    price: [],
    primary_color: [],
    style: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // create entity
    const entityId = await createEntity(pool);

    for (const [key, value] of Object.entries(row)) {
      const internalTableName = TABLES[key as keyof typeof TABLES];
      const trimmedValue = value.trim();

      // this if clause handles skipping unwanted columns
      if (internalTableName !== undefined) {
        switch (internalTableName) {
          case "description":
          case "feature":
          case "merchandised_color":
          case "primary_color":
          case "style": {
            entityValues[internalTableName].push([entityId, trimmedValue]);
            components[internalTableName].add(trimmedValue);
            break;
          }
          case "pattern": {
            const patternValues = trimmedValue.split(";");
            for (let i = 0; i < patternValues.length; i++) {
              const val = patternValues[i];
              components[internalTableName].add(val);
              entityValues[internalTableName].push([entityId, val]);
            }
            break;
          }
          case "price": {
            const cents = Number(trimmedValue) * CENTS_PER_DOLLAR;
            // the price is automatically registered with an entity, it cannot exist without one
            await addPrice(pool, entityId, defaultCurrencyUuid, cents);
            break;
          }
          default: {
            internalTableName satisfies never;
            break;
          }
        }
      } else {
        // NOTE: skipping this for initial pass. I think the image/file table
        // separation is more trouble than it's worth, but we'll see

        // // file handling
        // // can be image, mp4, whatever
        // const lowerKey = key.toLowerCase();
        // let isFile = false;
        // if (lowerKey.includes("url")) {
        //   isFile = true;
        // }
        //
        // // image handling
        // let isImage = false;
        // if (lowerKey.includes("image")) {
        //   isImage = true;
        // }
        //
        // if (isFile) {
        //   const fileId = await addFile(pool, trimmedValue);
        //
        //   if (isImage) {
        //     const imageIds = await addImage(pool, fileId);
        //     const components: [bigint, string, bigint][] = imageIds.map((id) => [entityId, id, 0n]);
        //     await registerImages(pool, components);
        //   }
        // }
      }
    }
  }

  return [components, entityValues];
}

async function processRows(
  pool: Pool,
  rows: Record<string, string>[],
  usdCurrencyId: string,
): Promise<void> {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // create entity
    const entityId = await createEntity(pool);

    for (const [key, value] of Object.entries(row)) {
      const internalTableName = TABLES[key as keyof typeof TABLES];
      const trimmedValue = [value.trim()];

      // 0 is invalid
      let createdComponents: string[];
      if (internalTableName !== undefined) {
        switch (internalTableName) {
          case "description": {
            createdComponents = await addDescription(pool, trimmedValue);
            createdComponents = descriptionIds;
            break;
          }
          case "feature": {
            createdComponents = await addFeature(pool, trimmedValue);
            break;
          }
          case "merchandised_color": {
            createdComponents = await addMerchandisedColor(pool, trimmedValue);
            break;
          }
          case "pattern": {
            const patterns = trimmedValue.flatMap((v) => v.split(";"));
            createdComponents = await addPattern(pool, patterns);
            break;
          }
          case "price": {
            // price
            const cents = Number(trimmedValue) * CENTS_PER_DOLLAR;
            await addPrice(pool, entityId, usdCurrencyId, cents);
            // the price is automatically registered with an entity, it cannot exist without one
            // so the below code is not needed:
            // createdComponents.push(priceId);
            break;
          }
          case "primary_color": {
            createdComponents = await addPrimaryColor(pool, trimmedValue);
            break;
          }
          case "style": {
            createdComponents = await addStyle(pool, trimmedValue);
            break;
          }
          default: {
            internalTableName satisfies never;
            break;
          }
        }

        // register the created component for this entity
        await registerComponents(pool, internalTableName, entityId, createdComponents);
      } else {
        // file handling
        // can be image, mp4, whatever
        const lowerKey = key.toLowerCase();
        let isFile = false;
        if (lowerKey.includes("url")) {
          isFile = true;
        }

        // image handling
        let isImage = false;
        if (lowerKey.includes("image")) {
          isImage = true;
        }

        if (isFile) {
          const fileId = await addFile(pool, trimmedValue);

          if (isImage) {
            const imageIds = await addImage(pool, fileId);
            const components: [bigint, string, bigint][] = imageIds.map((id) => [entityId, id, 0n]);
            await registerImages(pool, components);
          }
        }

        // safePush(data, key, trimmedValue);
      }
    }
    // insert into db
    // create new entity
    // get value, trim and lowercase
    // extract [component] values into sets
    // sort alpha
    // insert into [component] table
    // e.g.:
    //
    // INSERT INTO author_book (author_id, book_id)
    // SELECT $1, b.id
    // FROM books b
    // WHERE b.title = $2;
    // (If no rows match, nothing is inserted.)
  }
}

async function addAndRegisterComponents(
  pool: Pool,
  componentTable: ComponentTable,
  entityValues: [EntityId, string][],
  valueList: string[],
) {
  const createdComponents = await addComponents(pool, componentTable, valueList);

  // correlate the created UUIDs with the values
  const valueUuidMap: Record<string, UUIDv7> = {};
  for (let i = 0; i < createdComponents.length; i++) {
    // these are correlated by array position
    const val = valueList[i];
    const uuid = createdComponents[i];
    valueUuidMap[val] = uuid;
  }

  const componentRegistration: [EntityId, UUIDv7][] = [];
  for (let i = 0; i < entityValues.length; i++) {
    const [entityId, componentValue] = entityValues[i];
    const uuidForValue = valueUuidMap[componentValue];

    componentRegistration.push([entityId, uuidForValue]);
  }

  await registerComponents(pool, componentTable, componentRegistration);
}
