"use client";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Popup,
  Marker,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";
import TreeMarker from "./tree-marker";
import TreePopup from "./tree-popup";
import { classificationColour } from "./classification-colour";
import LikedTrees from "./liked-trees";
import type { LikedTree } from "@/app/data/get-my-liked-trees";
import { MapProps } from "./map-ssr";
import { useEffect, useRef, useState } from "react";
import { getTreeDetails, type TreeDetails } from "@/app/data/get-tree-details";
import type { TreeMarker as TreeMarkerData } from "@/app/data/get-trees";
import { authClient } from "@/lib/auth-client";

// Close enough to pick out the one dot. 18 is the tile layer's maximum: past
// it Leaflet requests no imagery and the map goes blank.
const LIKED_TREE_ZOOM = 18;

// The liked trees box needs the Leaflet map to fly to a tree, and useMap only
// works inside MapContainer, so it's mounted through this wrapper.
function LikedTreesControl({
  userId,
  onOpenTree,
}: {
  userId: string | null;
  onOpenTree: (tree: TreeMarkerData) => void;
}) {
  const map = useMap();

  function showTree(tree: LikedTree): void {
    map.flyTo([tree.latitude, tree.longitude], LIKED_TREE_ZOOM, {
      duration: 0.8,
    });
    onOpenTree({
      id: tree.id,
      latitude: tree.latitude,
      longitude: tree.longitude,
      classification: tree.classification,
    });
  }

  return <LikedTrees userId={userId} onSelect={showTree} />;
}

export default function Map({ visibleTrees }: MapProps) {
  const DEFAULT_POSITION: LatLngTuple = [-35.278576, 149.118371];
  const DEFAULT_ZOOM: number = 16;
  const MIN_ZOOM: number = 15;

  // The page only sends each tree's position and classification; the rest is
  // loaded when its dot is clicked, so the popup opens straight away at the dot
  // and fills in once the details arrive.
  const [selectedTree, setSelectedTree] = useState<TreeMarkerData | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<TreeDetails | null>(
    null,
  );
  const [detailsFailed, setDetailsFailed] = useState<boolean>(false);
  // Which tree the latest click asked for, so a slow response for a tree the
  // user has since clicked away from is ignored.
  const requestedTreeId = useRef<number | null>(null);

  // Who's signed in, shared with the account menu. An open popup's "signed in"
  // and "liked by me" come from when it was loaded, so when this changes (sign
  // in, sign up, sign out) the open tree is reloaded for the new user.
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const userId: string | null = session?.user.id ?? null;
  const selectedTreeRef = useRef<TreeMarkerData | null>(null);
  const loadedForUser = useRef<string | null | undefined>(undefined);

  function loadDetails(tree: TreeMarkerData): void {
    loadedForUser.current = userId;
    getTreeDetails(tree.id)
      .then((details) => {
        if (requestedTreeId.current !== tree.id) return;
        if (details) setSelectedDetails(details);
        else setDetailsFailed(true);
      })
      .catch(() => {
        if (requestedTreeId.current === tree.id) setDetailsFailed(true);
      });
  }

  function selectTree(tree: TreeMarkerData): void {
    requestedTreeId.current = tree.id;
    selectedTreeRef.current = tree;
    setSelectedTree(tree);
    setSelectedDetails(null);
    setDetailsFailed(false);
    loadDetails(tree);
  }

  // Reload the open tree when the signed-in user changes. The popup is keyed
  // on the user too, so it starts fresh with the new like state.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on user change only
  useEffect(() => {
    if (sessionPending) return;
    const tree = selectedTreeRef.current;
    if (!tree || loadedForUser.current === userId) return;
    loadDetails(tree);
  }, [userId, sessionPending]);

  return (
    <MapContainer
      className="h-full w-full 
      [&_.leaflet-control-zoom-in]:font-sans! [&_.leaflet-control-zoom-in]:backdrop-blur-sm! [&_.leaflet-control-zoom-in]:border-x! [&_.leaflet-control-zoom-in]:border-t! [&_.leaflet-control-zoom-in]:border-white/20! [&_.leaflet-control-zoom-in]:bg-transparent! [&_.leaflet-control-zoom-in]:text-white! [&_.leaflet-control-zoom-in]:font-normal! [&_.leaflet-control-zoom-in]:text-3xl! [&_.leaflet-control-zoom-in]:rounded-t-full! [&_.leaflet-control-zoom-in]:w-15! [&_.leaflet-control-zoom-in]:h-17! [&_.leaflet-control-zoom-in]:flex! [&_.leaflet-control-zoom-in]:items-center! [&_.leaflet-control-zoom-in]:justify-center! [&_.leaflet-control-zoom-in_span]:active:scale-120! [&_.leaflet-control-zoom-in_span]:hover:scale-120!
      [&_.leaflet-control-zoom-out]:font-sans! [&_.leaflet-control-zoom-out]:backdrop-blur-sm! [&_.leaflet-control-zoom-out]:border-x! [&_.leaflet-control-zoom-out]:border-b! [&_.leaflet-control-zoom-out]:border-white/20! [&_.leaflet-control-zoom-out]:bg-transparent! [&_.leaflet-control-zoom-out]:text-white! [&_.leaflet-control-zoom-out]:font-normal! [&_.leaflet-control-zoom-out]:text-3xl! [&_.leaflet-control-zoom-out]:rounded-b-full! [&_.leaflet-control-zoom-out]:w-15! [&_.leaflet-control-zoom-out]:h-17! [&_.leaflet-control-zoom-out]:flex! [&_.leaflet-control-zoom-out]:items-center! [&_.leaflet-control-zoom-out]:justify-center! [&_.leaflet-control-zoom-out_span]:active:scale-120! [&_.leaflet-control-zoom-out_span]:hover:scale-120!
      [&_.leaflet-popup-tip-container]:hidden!
      [&_.leaflet-popup-close-button_span]:text-black!
      [&_.leaflet-control-zoom]:border-none!"
      center={DEFAULT_POSITION}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      attributionControl={false}
      minZoom={MIN_ZOOM}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {visibleTrees.map((tree) => {
        return (
          <CircleMarker
            key={tree.id}
            radius={3.5}
            center={[tree.latitude, tree.longitude]}
            pathOptions={{
              color: "white",
              weight: 1,
              fillColor: classificationColour(tree.classification),
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => selectTree(tree) }}
          ></CircleMarker>
        );
      })}

      {selectedTree && (
        <Popup
          position={[selectedTree.latitude, selectedTree.longitude]}
          className="
    [&_.leaflet-popup-content]:text-white! [&_.leaflet-popup-content]:font-sans!
      [&_.leaflet-popup-content-wrapper]:bg-transparent! [&_.leaflet-popup-content-wrapper]:backdrop-blur-xl! [&_.leaflet-popup-content-wrapper]:border-white/20! [&_.leaflet-popup-content-wrapper]:rounded-2xl! [&_.leaflet-popup-content-wrapper]:border!
    [&_.leaflet-popup-close-button_span]:text-white! [&_.leaflet-popup-close-button_span]:font-serif! [&_.leaflet-popup-close-button_span]:text-3xl!
      [&_.leaflet-popup-close-button]:mt-1! [&_.leaflet-popup-close-button]:mr-2.5!"
          eventHandlers={{
            remove: () => {
              requestedTreeId.current = null;
              selectedTreeRef.current = null;
              setSelectedTree(null);
              setSelectedDetails(null);
            },
          }}
        >
          {selectedDetails ? (
            <TreePopup
              key={`${selectedDetails.id}:${userId ?? "signed-out"}`}
              id={selectedDetails.id}
              name={selectedDetails.commonName}
              scientificName={selectedDetails.scientificName}
              height={selectedDetails.height}
              crownRadius={selectedDetails.crownRadius}
              diameter={selectedDetails.diameterBreastHeight}
              age={selectedDetails.age}
              health={selectedDetails.health}
              structure={selectedDetails.structure}
              classification={selectedDetails.classification}
              gpsCoords={[selectedDetails.latitude, selectedDetails.longitude]}
              comments={selectedDetails.comments}
              likes={selectedDetails.likes?.likes ?? null}
              likedByMe={selectedDetails.likedByMe}
              signedIn={selectedDetails.signedIn}
            />
          ) : (
            <main className="flex flex-col px-1 py-2 pr-6">
              <span className="text-sm">
                {detailsFailed
                  ? "couldn't load this tree, try clicking it again"
                  : "loading…"}
              </span>
            </main>
          )}
        </Popup>
      )}
      {!sessionPending && (
        <LikedTreesControl userId={userId} onOpenTree={selectTree} />
      )}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
