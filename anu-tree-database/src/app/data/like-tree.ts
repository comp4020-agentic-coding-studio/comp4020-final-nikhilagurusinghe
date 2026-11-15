"use server";

import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { headers } from "next/headers";
import { treeLikesTable, userTreeLikesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { publishTreeLikes } from "@/lib/like-events";

const db = drizzle(process.env.DB_FILE_NAME!);

export type LikeResult =
  | { likes: number; likedByMe: boolean }
  | { error: "signed-out" };

// Server actions are a public endpoint, so don't trust the argument.
function assertTreeId(treeId: number): void {
  if (!Number.isInteger(treeId) || treeId < 1) {
    throw new Error(`Cannot like tree: ${treeId} is not a valid tree id.`);
  }
}

async function currentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

// Likes a tree for the signed-in user. Each user gets one like per tree, so
// liking a tree they've already liked changes nothing.
export async function likeTree(treeId: number): Promise<LikeResult> {
  assertTreeId(treeId);
  const userId = await currentUserId();
  if (!userId) return { error: "signed-out" };

  const likes = await db.transaction(async (tx) => {
    // The (user, tree) primary key makes a repeat like a no-op: nothing is
    // inserted, so the total isn't bumped either.
    const inserted = await tx
      .insert(userTreeLikesTable)
      .values({ userId, treeId })
      .onConflictDoNothing()
      .returning({ treeId: userTreeLikesTable.treeId });

    if (inserted.length === 0) {
      const [row] = await tx
        .select({ likes: treeLikesTable.likes })
        .from(treeLikesTable)
        .where(eq(treeLikesTable.treeId, treeId));
      return row?.likes ?? 0;
    }

    // A tree has no row in tree_likes_table until its first like, so upsert.
    const [row] = await tx
      .insert(treeLikesTable)
      .values({ treeId, likes: 1 })
      .onConflictDoUpdate({
        target: treeLikesTable.treeId,
        set: { likes: sql`${treeLikesTable.likes} + 1` },
      })
      .returning({ likes: treeLikesTable.likes });
    return row.likes;
  });

  publishTreeLikes(treeId, likes);
  return { likes, likedByMe: true };
}

// Takes back the signed-in user's like. Unliking a tree they haven't liked
// changes nothing.
export async function unlikeTree(treeId: number): Promise<LikeResult> {
  assertTreeId(treeId);
  const userId = await currentUserId();
  if (!userId) return { error: "signed-out" };

  const likes = await db.transaction(async (tx) => {
    const removed = await tx
      .delete(userTreeLikesTable)
      .where(
        and(
          eq(userTreeLikesTable.userId, userId),
          eq(userTreeLikesTable.treeId, treeId),
        ),
      )
      .returning({ treeId: userTreeLikesTable.treeId });

    if (removed.length === 0) {
      const [row] = await tx
        .select({ likes: treeLikesTable.likes })
        .from(treeLikesTable)
        .where(eq(treeLikesTable.treeId, treeId));
      return row?.likes ?? 0;
    }

    // max(..., 0) so the total can never go negative, whatever state the
    // table was in.
    const [row] = await tx
      .update(treeLikesTable)
      .set({ likes: sql`max(${treeLikesTable.likes} - 1, 0)` })
      .where(eq(treeLikesTable.treeId, treeId))
      .returning({ likes: treeLikesTable.likes });
    return row?.likes ?? 0;
  });

  publishTreeLikes(treeId, likes);
  return { likes, likedByMe: false };
}
