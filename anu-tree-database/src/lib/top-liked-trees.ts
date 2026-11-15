import "server-only";

import { asc, desc, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type { LikedTree } from "@/app/data/get-my-liked-trees";
import { treeLikesTable, treesTable } from "@/db/schema";
import { subscribeToAllTreeLikes } from "./like-events";

const db = drizzle(process.env.DB_FILE_NAME!);

// How many trees the most liked list shows.
export const TOP_LIKED_LIMIT = 10;

// Wait this long after a like before recomputing, so a burst of likes costs
// one query rather than one each.
const REFRESH_DELAY_MS = 150;

// The platform's most liked trees, highest first (ties: lowest tree id first,
// so the order is stable). Trees whose likes have dropped back to 0 are left
// out.
export async function getTopLikedTrees(): Promise<LikedTree[]> {
  return db
    .select({
      id: treesTable.id,
      commonName: treesTable.commonName,
      scientificName: treesTable.scientificName,
      classification: treesTable.classification,
      latitude: treesTable.latitude,
      longitude: treesTable.longitude,
      likes: treeLikesTable.likes,
    })
    .from(treeLikesTable)
    .innerJoin(treesTable, eq(treesTable.id, treeLikesTable.treeId))
    .where(gt(treeLikesTable.likes, 0))
    .orderBy(desc(treeLikesTable.likes), asc(treesTable.id))
    .limit(TOP_LIKED_LIMIT);
}

// Live updates of the list for every open "most liked" stream. One recompute
// per burst of likes is shared by all of them, so a like costs one query
// however many signed-out visitors are watching.
type TopListener = (trees: LikedTree[]) => void;

const topListeners = new Set<TopListener>();
let unsubscribeFromLikes: (() => void) | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRefresh(): void {
  if (refreshTimer) return;
  refreshTimer = setTimeout(async () => {
    refreshTimer = null;
    try {
      const trees = await getTopLikedTrees();
      for (const listener of topListeners) listener(trees);
    } catch {
      // Keep the last list; the next like tries again.
    }
  }, REFRESH_DELAY_MS);
}

// Returns an unsubscribe function.
export function subscribeToTopLikedTrees(listener: TopListener): () => void {
  topListeners.add(listener);
  if (!unsubscribeFromLikes) {
    unsubscribeFromLikes = subscribeToAllTreeLikes(scheduleRefresh);
  }

  return () => {
    topListeners.delete(listener);
    if (topListeners.size === 0 && unsubscribeFromLikes) {
      unsubscribeFromLikes();
      unsubscribeFromLikes = null;
    }
  };
}
