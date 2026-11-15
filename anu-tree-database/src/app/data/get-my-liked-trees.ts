"use server";

import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { headers } from "next/headers";
import { treeLikesTable, treesTable, userTreeLikesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const db = drizzle(process.env.DB_FILE_NAME!);

export type LikedTree = {
  id: number;
  commonName: string | null;
  scientificName: string;
  classification: string;
  latitude: number;
  longitude: number;
  likes: number;
};

// The signed-in user's liked trees, most recently liked first, for the liked
// trees box. Empty when signed out.
export async function getMyLikedTrees(): Promise<LikedTree[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user.id;
  if (!userId) return [];

  const rows = await db
    .select({
      id: treesTable.id,
      commonName: treesTable.commonName,
      scientificName: treesTable.scientificName,
      classification: treesTable.classification,
      latitude: treesTable.latitude,
      longitude: treesTable.longitude,
      likes: treeLikesTable.likes,
    })
    .from(userTreeLikesTable)
    .innerJoin(treesTable, eq(treesTable.id, userTreeLikesTable.treeId))
    .leftJoin(treeLikesTable, eq(treeLikesTable.treeId, treesTable.id))
    .where(eq(userTreeLikesTable.userId, userId))
    .orderBy(desc(userTreeLikesTable.createdAt));

  return rows.map((row) => ({ ...row, likes: row.likes ?? 0 }));
}
