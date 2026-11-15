// A browser-side signal that the signed-in user liked or unliked a tree, so the
// liked trees box can update without waiting for a reload. The popup fires it
// after a like/unlike succeeds; the box listens.

const EVENT_NAME = "my-tree-likes-changed";

export function announceMyLikesChanged(): void {
  window.dispatchEvent(new Event(EVENT_NAME));
}

// Returns an unsubscribe function.
export function onMyLikesChanged(listener: () => void): () => void {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
