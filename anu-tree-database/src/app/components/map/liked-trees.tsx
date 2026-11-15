"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import L from "leaflet";
import { type RefObject, useEffect, useRef, useState } from "react";
import { getMyLikedTrees, type LikedTree } from "@/app/data/get-my-liked-trees";
import HeartIcon from "../icons/heart";
import { classificationColour } from "./classification-colour";
import { onMyLikesChanged } from "./my-likes-changed";

type LikedTreesProps = {
  // The signed-in user's id, or null when signed out.
  userId: string | null;
  onSelect: (tree: LikedTree) => void;
};

// The box's tabs, in the order they're shown: the user's own liked trees, and
// the platform's most liked trees.
const TABS = ["liked", "top"] as const;
type TreeTab = (typeof TABS)[number];

// The last tab a signed-in user picked is remembered in this browser between
// visits.
const TAB_STORAGE_KEY = "anu-tree-database:tree-box-tab";

function readSavedTab(): TreeTab | null {
  try {
    const saved = localStorage.getItem(TAB_STORAGE_KEY);
    return saved === "liked" || saved === "top" ? saved : null;
  } catch {
    // Storage can be blocked (private windows, blocked site data).
    return null;
  }
}

function saveTab(tab: TreeTab): void {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
  } catch {
    // Not remembered this time; the box still works.
  }
}

const TAB_CLASS =
  "cursor-pointer h-8 px-3 rounded-full font-medium text-nowrap focus:outline-none data-hover:bg-white/10 data-selected:bg-white/20 data-selected:backdrop-blur-sm data-focus:ring-1 data-focus:ring-white/60 transition-colors";
// Every panel is the height of a row of the tallest cards (two-line names),
// so the box never changes size: it's pinned to the bottom of the screen, and
// growing or shrinking would move the tabs out from under the pointer.
const PANEL_CLASS =
  "h-27 flex flex-col rounded-xl focus:outline-none data-focus:ring-1 data-focus:ring-white/60";
const MESSAGE_CLASS = "my-auto text-center text-sm";

// A box in the bottom-left corner of the map with two tabs of tree cards,
// "liked trees" and "most liked", each a horizontally scrolling row. Clicking
// a card flies the map to that tree and opens its popup.
export default function LikedTrees(props: LikedTreesProps) {
  // Start afresh, lists and tab, whenever someone signs in or out.
  return <TreeBox key={props.userId ?? "signed-out"} {...props} />;
}

function TreeBox({ userId, onSelect }: LikedTreesProps) {
  const signedIn = userId !== null;

  // Signed in, the box opens on the last tab picked (their liked trees the
  // first time). Signed out it opens on most liked, since a visitor has no
  // likes of their own to show.
  const [tab, setTab] = useState<TreeTab>(() =>
    signedIn ? (readSavedTab() ?? "liked") : "top",
  );
  // null until the list first arrives.
  const [myTrees, setMyTrees] = useState<LikedTree[] | null>(null);
  const [topTrees, setTopTrees] = useState<LikedTree[] | null>(null);

  const boxRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Only the open tab's list is kept live; the other refreshes when it's
  // opened again.

  // Most liked: the stream sends the whole list on connect and again whenever
  // anyone's like changes it.
  useEffect(() => {
    if (tab !== "top") return;

    const source = new EventSource("/api/trees/top-liked/stream");
    source.onmessage = (event) => {
      const { trees } = JSON.parse(event.data) as { trees: LikedTree[] };
      setTopTrees(trees);
    };
    return () => source.close();
  }, [tab]);

  // Liked trees: load the user's likes, and again whenever they like or unlike
  // a tree in a popup.
  useEffect(() => {
    if (tab !== "liked" || !signedIn) return;

    let cancelled = false;
    const load = (): void => {
      getMyLikedTrees()
        .then((liked) => {
          if (!cancelled) setMyTrees(liked);
        })
        .catch(() => {
          // Keep showing what we had (or stop showing "loading…" if this was
          // the first load); the next change or reload retries.
          if (!cancelled) setMyTrees((current) => current ?? []);
        });
    };

    load();
    const unsubscribe = onMyLikesChanged(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [tab, signedIn]);

  // Liked trees: live counts for every card over one SSE connection, reopened
  // when the set of trees changes. (The most liked stream carries its own.)
  const myTreeIdsKey = (myTrees ?? []).map((tree) => tree.id).join(",");
  useEffect(() => {
    if (tab !== "liked" || !myTreeIdsKey) return;

    const source = new EventSource(
      `/api/trees/likes/stream?ids=${myTreeIdsKey}`,
    );
    source.onmessage = (event) => {
      const { treeId, likes } = JSON.parse(event.data) as {
        treeId: number;
        likes: number;
      };
      setMyTrees((current) =>
        current
          ? current.map((tree) =>
              tree.id === treeId && tree.likes !== likes
                ? { ...tree, likes }
                : tree,
            )
          : current,
      );
    };
    return () => source.close();
  }, [tab, myTreeIdsKey]);

  // A card that lands at the front of the row (a new like, or a tree climbing
  // to the top) would otherwise be out of view if the row is scrolled, so
  // scroll back to the start whenever a different tree is first.
  const shownTrees = tab === "liked" ? myTrees : topTrees;
  const firstTreeId = shownTrees?.[0]?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the first card changes
  useEffect(() => {
    listRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [firstTreeId]);

  // The box sits over the map, so stop clicks, drags and wheel/trackpad
  // scrolls on it from also panning or zooming the map underneath.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.disableScrollPropagation(box);
  }, []);

  function changeTab(index: number): void {
    const next = TABS[index];
    setTab(next);
    // Only a signed-in pick is remembered: visitors always start on most liked,
    // and their clicks shouldn't change where the box opens once signed in.
    if (signedIn) saveTab(next);
  }

  return (
    <section
      ref={boxRef}
      aria-label="Liked trees"
      className="absolute z-1000 left-4 bottom-4 right-24 sm:right-auto sm:w-120 max-w-[calc(100vw-7rem)] p-3 text-white font-sans border border-white/20 rounded-2xl backdrop-blur-xl cursor-default"
    >
      <TabGroup
        selectedIndex={TABS.indexOf(tab)}
        onChange={changeTab}
        className="flex flex-col gap-y-2"
      >
        <TabList aria-label="Which trees to show" className="flex flex-row">
          <Tab className={TAB_CLASS}>liked trees</Tab>
          <Tab className={TAB_CLASS}>most liked</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className={PANEL_CLASS}>
            {signedIn ? (
              <TreeCards
                trees={myTrees}
                emptyMessage="like a tree to see it here"
                listRef={listRef}
                onSelect={onSelect}
              />
            ) : (
              <p className={MESSAGE_CLASS}>sign in to like trees</p>
            )}
          </TabPanel>
          <TabPanel className={PANEL_CLASS}>
            <TreeCards
              trees={topTrees}
              emptyMessage={
                signedIn
                  ? "no liked trees yet"
                  : "no liked trees yet, sign in to like one"
              }
              listRef={listRef}
              onSelect={onSelect}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  );
}

type TreeCardsProps = {
  trees: LikedTree[] | null;
  emptyMessage: string;
  listRef: RefObject<HTMLUListElement | null>;
  onSelect: (tree: LikedTree) => void;
};

// One tab's row of tree cards.
function TreeCards({ trees, emptyMessage, listRef, onSelect }: TreeCardsProps) {
  if (trees === null) return <p className={MESSAGE_CLASS}>loading…</p>;
  if (trees.length === 0) {
    return <p className={MESSAGE_CLASS}>{emptyMessage}</p>;
  }

  return (
    <ul
      ref={listRef}
      className="h-full flex flex-row gap-x-2 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.4)_rgb(255_255_255/0.1)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/40"
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
            <span className="flex flex-col min-w-0 h-full gap-y-0.5">
              <span className="font-bold leading-tight text-(--highlight-colour) line-clamp-2">
                {tree.commonName ?? tree.scientificName}
              </span>
              <span className="text-sm italic truncate">
                {tree.scientificName}
              </span>
              <span className="mt-auto pt-1.5 flex flex-row items-center gap-x-1.5 text-sm font-bold">
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
  );
}
