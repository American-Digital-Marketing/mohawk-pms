import { Client } from "jsr:@db/postgres@0.19.5";
import { EntityId } from "./types.ts";

export async function createEntity(client: Client): Promise<EntityId> {
  const queryResult = await client.queryArray<[EntityId]>(
    "INSERT INTO entity\n" +
      "DEFAULT VALUES\n" +
      "RETURNING id;",
  );

  const entityId = queryResult.rows[0][0];

  console.log(`created entityId ${entityId}.`);
  return entityId;
}
