"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { getMyLikedTrees, type LikedTree } from "@/app/data/get-my-liked-trees";
import HeartIcon from "../icons/heart";
import { classificationColour } from "./classification-colour";
import { onMyLikesChanged } from "./my-likes-changed";

type LikedTreesProps = {
  // The signed-in user's id, or null when signed out. Signed in, the box shows
  // their liked trees; signed out, the platform's most liked trees.
  userId: string | null;
  onSelect: (tree: LikedTree) => void;
};

// A horizontally scrolling row of tree cards in the bottom-left corner of the
// map: the signed-in user's liked trees, or for signed-out visitors the most
// liked trees on the platform. Clicking a card flies the map to that tree and
// opens its popup.
export default function LikedTrees({ userId, onSelect }: LikedTreesProps) {
  const [trees, setTrees] = useState<LikedTree[]>([]);
  const boxRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const signedIn = userId !== null;

  // Signed out: the most liked trees, as a live list. The stream sends the
  // whole list on connect and again whenever anyone's like changes it.
  useEffect(() => {
    if (signedIn) return;

    setTrees([]);
    const source = new EventSource("/api/trees/top-liked/stream");
    source.onmessage = (event) => {
      const { trees: top } = JSON.parse(event.data) as { trees: LikedTree[] };
      setTrees(top);
    };
    return () => source.close();
  }, [signedIn]);

  // Signed in: load (and reload) their liked trees, and again whenever they
  // like or unlike a tree in a popup.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const load = (): void => {
      getMyLikedTrees()
        .then((liked) => {
          if (!cancelled) setTrees(liked);
        })
        .catch(() => {
          // Keep showing what we had; the next change or reload retries.
        });
    };

    load();
    const unsubscribe = onMyLikesChanged(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId]);

  // Live like counts for every card over one SSE connection, reopened when the
  // set of trees changes.
  const treeIdsKey = trees.map((tree) => tree.id).join(",");

  // A new like lands at the front of the row, but the browser keeps the old
  // scroll position, which would leave the new card out of view. Scroll back
  // to the start whenever a different tree becomes the newest.
  const newestTreeId = trees[0]?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the newest card changes
  useEffect(() => {
    listRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [newestTreeId]);
  useEffect(() => {
    // Signed out, the top list stream already carries the counts.
    if (!signedIn || !treeIdsKey) return;

    const source = new EventSource(`/api/trees/likes/stream?ids=${treeIdsKey}`);
    source.onmessage = (event) => {
      const { treeId, likes } = JSON.parse(event.data) as {
        treeId: number;
        likes: number;
      };
      setTrees((current) =>
        current.map((tree) =>
          tree.id === treeId && tree.likes !== likes
            ? { ...tree, likes }
            : tree,
        ),
      );
    };
    return () => source.close();
  }, [signedIn, treeIdsKey]);

  // The box sits over the map, so stop clicks, drags and wheel/trackpad
  // scrolls on it from also panning or zooming the map underneath.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.disableScrollPropagation(box);
  }, []);

  return (
    <section
      ref={boxRef}
      aria-label={signedIn ? "Your liked trees" : "Most liked trees"}
      className="absolute z-1000 left-4 bottom-4 right-24 sm:right-auto sm:w-120 max-w-[calc(100vw-7rem)] flex flex-col gap-y-2 p-3 text-white font-sans border border-white/20 rounded-2xl backdrop-blur-xl cursor-default"
    >
      <h2 className="ml-1 font-medium">
        {signedIn ? "liked trees" : "most liked trees"}
      </h2>

      {trees.length === 0 ? (
        <p className="ml-1 text-sm">
          {signedIn
            ? "like a tree to see it here"
            : "no liked trees yet, sign in to like one"}
        </p>
      ) : (
        <ul
          ref={listRef}
          className="flex flex-row gap-x-2 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.4)_rgb(255_255_255/0.1)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/40"
        >
          {trees.map((tree) => (
            <li key={tree.id} className="snap-start shrink-0">
              <button
                type="button"
                onClick={() => onSelect(tree)}
                aria-label={`Show ${tree.commonName ?? tree.scientificName} on the map`}
                className="group cursor-pointer w-40 h-full flex flex-row gap-x-2 text-left rounded-2xl bg-white/20 backdrop-blur-md p-2.5 hover:bg-white/30 transition-colors"
              >
                <span
                  aria-hidden={true}
                  className="shrink-0 mt-1 size-2.5 rounded-full border border-white"
                  style={{
                    background: classificationColour(tree.classification),
                  }}
                />
                <span className="flex flex-col min-w-0 gap-y-0.5">
                  <span className="font-bold leading-tight text-(--highlight-colour) line-clamp-2">
                    {tree.commonName ?? tree.scientificName}
                  </span>
                  <span className="text-sm italic truncate">
                    {tree.scientificName}
                  </span>
                  <span className="mt-1.5 flex flex-row items-center gap-x-1.5 text-sm font-bold">
                    <HeartIcon
                      height={13}
                      stroke="red"
                      strokeWidth={3}
                      fill="red"
                      className="group-hover:scale-120 transition-all"
                    />
                    {tree.likes} likes
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
