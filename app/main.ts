import { parse } from "@std/csv";
import { ClientOptions, Pool } from "jsr:@db/postgres@0.19.5";
import {
  ComponentRegistration,
  ComponentTable,
  CurrencyRegistration,
  DescriptionRegistration,
  FeatureRegistration,
  FileRegistration,
  ImageRegistration,
  MerchandisedColorRegistration,
  PatternRegistration,
  PriceRegistration,
  PrimaryColorRegistration,
  SkuRegistration,
  StyleRegistration,
} from "./types.ts";
import { addComponents, addCurrency, registerComponentsByValue } from "./components.ts";
import { createEntity } from "./entity.ts";

const N_THREADS = 8;
const CENTS_PER_DOLLAR = 100;

const TABLES = {
  "Inventory Sku Number": "sku",
  "Rug Copy": "description",
  "Pattern": "pattern", // Pattern is a semicolon separated list of patterns, initial cap
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

  {
    using client = await pool.connect();
    await addCurrency(client, ["USD"]);
  }

  // const data: Record<string, string[]> = {};
  // extract rows into separate sets, one per component
  // turn set into list, to enable index based ids
  // add those components, gathering their created uuids
  // register those components with the correct entity ids
  // how do we know which component goes with which entity, once created?
  // use index in component list to identify a component
  // i assume the return value from postgres is in order?
  //
  const componentRegistrations = await extractComponentsFromRows(
    pool,
    rows,
  );

  const promises: Promise<void>[] = [];
  for (let i = 0; i < componentRegistrations.length; i++) {
    const registration = componentRegistrations[i];
    promises.push(addAndRegisterComponents(pool, registration));
  }
  await Promise.all(promises);
  console.log(`Successfully added ${rows.length} product${rows.length > 1 ? "s" : ""}.`);
} catch (err) {
  console.error(err);
}

async function extractComponentsFromRows(
  pool: Pool,
  rows: Record<string, string>[],
): Promise<ComponentRegistration[]> {
  const currencyRegistration: CurrencyRegistration = {
    component: "currency",
    entities: [],
    codes: [],
  };
  const descriptionRegistration: DescriptionRegistration = {
    component: "description",
    entities: [],
    contents: [],
  };
  const featureRegistration: FeatureRegistration = {
    component: "feature",
    entities: [],
    contents: [],
  };
  const fileRegistration: FileRegistration = {
    component: "file",
    entities: [],
    sources: [],
  };
  const imageRegistration: ImageRegistration = {
    component: "image",
    entities: [],
    sources: [],
    sortOrders: [],
  };
  const merchandisedColorRegistration: MerchandisedColorRegistration = {
    component: "merchandised_color",
    entities: [],
    names: [],
  };
  const patternRegistration: PatternRegistration = {
    component: "pattern",
    entities: [],
    names: [],
  };
  const primaryColorRegistration: PrimaryColorRegistration = {
    component: "primary_color",
    entities: [],
    names: [],
  };
  const priceRegistration: PriceRegistration = {
    component: "price",
    entities: [],
    codes: [],
    values: [],
  };
  const skuRegistration: SkuRegistration = {
    component: "sku",
    entities: [],
    values: [],
  };
  const styleRegistration: StyleRegistration = {
    component: "style",
    entities: [],
    names: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // create entity
    using client = await pool.connect();
    const entityId = await createEntity(client);

    for (const [key, value] of Object.entries(row)) {
      const internalTableName = TABLES[key as keyof typeof TABLES];
      const trimmedValue = value.trim();

      // this if clause handles skipping unwanted columns
      if (internalTableName !== undefined) {
        switch (internalTableName) {
          case "sku": {
            skuRegistration.entities.push(entityId);
            skuRegistration.values.push(trimmedValue);
            break;
          }
          case "description": {
            descriptionRegistration.entities.push(entityId);
            descriptionRegistration.contents.push(trimmedValue);
            break;
          }
          case "feature": {
            featureRegistration.entities.push(entityId);
            featureRegistration.contents.push(trimmedValue);
            break;
          }
          case "merchandised_color": {
            merchandisedColorRegistration.entities.push(entityId);
            merchandisedColorRegistration.names.push(trimmedValue);
            break;
          }
          case "primary_color": {
            primaryColorRegistration.entities.push(entityId);
            primaryColorRegistration.names.push(trimmedValue);
            break;
          }
          case "style": {
            styleRegistration.entities.push(entityId);
            styleRegistration.names.push(trimmedValue);
            break;
          }
          case "pattern": {
            const patternValues = trimmedValue.split(";");
            for (let i = 0; i < patternValues.length; i++) {
              const val = patternValues[i];
              patternRegistration.entities.push(entityId);
              patternRegistration.names.push(val);
            }
            break;
          }
          case "price": {
            const cents = Number(trimmedValue) * CENTS_PER_DOLLAR;
            priceRegistration.entities.push(entityId);
            priceRegistration.values.push(cents);
            priceRegistration.codes.push("USD");
            break;
          }
          default: {
            internalTableName satisfies never;
            break;
          }
        }
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
          // don't push this entity, since there is no relationship
          fileRegistration.sources.push(trimmedValue);

          if (isImage) {
            imageRegistration.entities.push(entityId);
            imageRegistration.sources.push(trimmedValue);
            imageRegistration.sortOrders.push(0);
          }
        }
      }
    }
  }

  return [
    styleRegistration,
    skuRegistration,
    priceRegistration,
    primaryColorRegistration,
    patternRegistration,
    merchandisedColorRegistration,
    imageRegistration,
    fileRegistration,
    featureRegistration,
    featureRegistration,
    currencyRegistration,
  ];
}

async function addAndRegisterComponents(
  pool: Pool,
  componentRegistration: ComponentRegistration,
) {
  using client = await pool.connect();
  await addComponents(client, componentRegistration);
  await registerComponentsByValue(client, componentRegistration);
}
