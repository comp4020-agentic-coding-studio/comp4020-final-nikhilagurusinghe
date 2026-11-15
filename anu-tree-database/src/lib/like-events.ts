import "server-only";

// In-memory pub/sub for live like counts: like-tree.ts publishes a tree's new
// total, and every open SSE stream for that tree (api/trees/[id]/likes/stream)
// forwards it to its browser.
//
// In memory is enough because the app runs as a single Fly machine (fly.toml
// keeps it to one). With more than one machine, a like on one wouldn't reach
// streams on another, and this would need a shared channel such as Redis.

type Listener = (likes: number) => void;
type AnyTreeListener = (treeId: number, likes: number) => void;

// Kept on globalThis so the server-action bundle and the route-handler bundle
// share one hub (and so dev hot reloads don't orphan subscribers).
const globalForLikes = globalThis as typeof globalThis & {
  __treeLikeListeners?: Map<number, Set<Listener>>;
  __anyTreeLikeListeners?: Set<AnyTreeListener>;
};
if (!globalForLikes.__treeLikeListeners) {
  globalForLikes.__treeLikeListeners = new Map();
}
if (!globalForLikes.__anyTreeLikeListeners) {
  globalForLikes.__anyTreeLikeListeners = new Set();
}
const listeners: Map<
  number,
  Set<Listener>
> = globalForLikes.__treeLikeListeners;
const anyTreeListeners: Set<AnyTreeListener> =
  globalForLikes.__anyTreeLikeListeners;

// Hears every like/unlike on every tree (the most liked trees list uses this
// to know when to recompute). Returns an unsubscribe function.
export function subscribeToAllTreeLikes(listener: AnyTreeListener): () => void {
  anyTreeListeners.add(listener);
  return () => {
    anyTreeListeners.delete(listener);
  };
}

// Returns an unsubscribe function.
export function subscribeToTreeLikes(
  treeId: number,
  listener: Listener,
): () => void {
  let set = listeners.get(treeId);
  if (!set) {
    set = new Set();
    listeners.set(treeId, set);
  }
  set.add(listener);

  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(treeId);
  };
}

export function publishTreeLikes(treeId: number, likes: number): void {
  for (const listener of listeners.get(treeId) ?? []) {
    listener(likes);
  }
  for (const listener of anyTreeListeners) {
    listener(treeId, likes);
  }
}
