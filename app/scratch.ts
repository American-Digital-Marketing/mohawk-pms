import { Pool } from "jsr:@db/postgres@0.19.5";
import { createEntity } from "./entity.ts";
import { ComponentTable, EntityId, UUIDv7 } from "./types.ts";
import {
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

const CENTS_PER_DOLLAR = 100;

export function distributeWork<T>(array: T[], nThreads: number): T[][] {
  const result: T[][] = [];
  const quotient = Math.floor(array.length / nThreads);
  const remainder = array.length % nThreads;

  for (let i = 0; i < nThreads; i++) {
    let start = 0;
    let end = 0;

    const hasBonus = i < remainder;
    if (hasBonus) {
      start = (quotient * i) + i;
      end = start + quotient + 1;
    } else {
      start = (quotient * i) + remainder;
      end = start + quotient;
    }

    const batch = array.slice(start, end);
    result.push(batch);
  }
  return result;
}

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
} satisfies Record<string, Component>;

export async function processRows(
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
      let createdComponents: [EntityId, UUIDv7][] = [];
      if (internalTableName !== undefined) {
        switch (internalTableName) {
          case "description": {
            createdComponents = await addDescription(pool, trimmedValue);
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
