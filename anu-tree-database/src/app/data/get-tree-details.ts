"use server";

import { drizzle } from "drizzle-orm/libsql";
import { relations } from "@/db/schema";
import type { Tree } from "./get-trees";

const db = drizzle(process.env.DB_FILE_NAME!, { relations });

// Everything the popup shows for one tree, fetched when its dot is clicked.
// Returns null if there's no tree with that id.
export async function getTreeDetails(treeId: number): Promise<Tree | null> {
  // Server actions are a public endpoint, so don't trust the argument.
  if (!Number.isInteger(treeId) || treeId < 1) {
    throw new Error(`Cannot load tree: ${treeId} is not a valid tree id.`);
  }

  const tree = await db.query.treesTable.findFirst({
    where: { id: treeId },
    with: { likes: true },
  });

  return tree ?? null;
}
