"use server";

import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import { treeLikesTable } from "@/db/schema";

const db = drizzle(process.env.DB_FILE_NAME!);

// Adds one like to a tree and returns its new total
export async function likeTree(treeId: number): Promise<number> {
  // Server actions are a public endpoint, so don't trust the argument.
  if (!Number.isInteger(treeId) || treeId < 1) {
    throw new Error(`Cannot like tree: ${treeId} is not a valid tree id.`);
  }

  // A tree has no row in tree_likes_table until its first like, so this upserts rather than updates.
  const [likedTree] = await db
    .insert(treeLikesTable)
    .values({ treeId, likes: 1 })
    .onConflictDoUpdate({
      target: treeLikesTable.treeId,
      set: { likes: sql`${treeLikesTable.likes} + 1` },
    })
    .returning({ likes: treeLikesTable.likes });

  return likedTree.likes;
}
