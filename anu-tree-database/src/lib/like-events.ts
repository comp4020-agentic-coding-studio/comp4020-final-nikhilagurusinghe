import "server-only";

// In-memory pub/sub for live like counts: like-tree.ts publishes a tree's new
// total, and every open SSE stream for that tree (api/trees/[id]/likes/stream)
// forwards it to its browser.
//
// In memory is enough because the app runs as a single Fly machine (fly.toml
// keeps it to one). With more than one machine, a like on one wouldn't reach
// streams on another, and this would need a shared channel such as Redis.

type Listener = (likes: number) => void;

// Kept on globalThis so the server-action bundle and the route-handler bundle
// share one hub (and so dev hot reloads don't orphan subscribers).
const globalForLikes = globalThis as typeof globalThis & {
  __treeLikeListeners?: Map<number, Set<Listener>>;
};
if (!globalForLikes.__treeLikeListeners) {
  globalForLikes.__treeLikeListeners = new Map();
}
const listeners: Map<
  number,
  Set<Listener>
> = globalForLikes.__treeLikeListeners;

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
}
