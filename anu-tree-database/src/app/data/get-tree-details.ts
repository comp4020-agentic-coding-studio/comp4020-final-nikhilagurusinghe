"use server";

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { headers } from "next/headers";
import { relations, userTreeLikesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { Tree } from "./get-trees";

const db = drizzle(process.env.DB_FILE_NAME!, { relations });

export type TreeDetails = Tree & {
  // Whether the signed-in user has liked this tree; false when signed out.
  likedByMe: boolean;
  signedIn: boolean;
};

// Everything the popup shows for one tree, fetched when its dot is clicked.
// Returns null if there's no tree with that id.
export async function getTreeDetails(
  treeId: number,
): Promise<TreeDetails | null> {
  // Server actions are a public endpoint, so don't trust the argument.
  if (!Number.isInteger(treeId) || treeId < 1) {
    throw new Error(`Cannot load tree: ${treeId} is not a valid tree id.`);
  }

  const [tree, session] = await Promise.all([
    db.query.treesTable.findFirst({
      where: { id: treeId },
      with: { likes: true },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!tree) return null;

  const userId = session?.user.id;
  const [myLike] = userId
    ? await db
        .select({ treeId: userTreeLikesTable.treeId })
        .from(userTreeLikesTable)
        .where(
          and(
            eq(userTreeLikesTable.userId, userId),
            eq(userTreeLikesTable.treeId, treeId),
          ),
        )
        .limit(1)
    : [];

  return { ...tree, likedByMe: Boolean(myLike), signedIn: Boolean(userId) };
}
