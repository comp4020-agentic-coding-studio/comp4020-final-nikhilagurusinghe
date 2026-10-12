"use client";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Popup,
  Marker,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";
import TreeMarker from "./tree-marker";
import TreePopup from "./tree-popup";
import { MapProps } from "./map-ssr";
import { useState } from "react";
import { Tree } from "@/app/data/get-trees";

export default function Map({ visibleTrees }: MapProps) {
  const DEFAULT_POSITION: LatLngTuple = [-35.278576, 149.118371];
  const DEFAULT_ZOOM: number = 16;
  const MIN_ZOOM: number = 15;

  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

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
        let colour: string = "#125938";

        if (
          tree.classification === "Eucalyptus" ||
          tree.classification === "Remnant Eucalyptus" ||
          tree.classification === "Other Eucalyptus"
        ) {
          colour = "#ff5050";
        } else if (tree.classification === "Deciduous") {
          colour = "#109b58";
        } else if (tree.classification === "Evergreen") {
          colour = "#82b649";
        } else if (tree.classification === "Conifer") {
          colour = "#0097a7";
        }

        return (
          <CircleMarker
            key={tree.id}
            radius={3.5}
            center={[tree.latitude, tree.longitude]}
            pathOptions={{
              color: "white",
              weight: 1,
              fillColor: colour,
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => setSelectedTree(tree) }}
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
          eventHandlers={{ remove: () => setSelectedTree(null) }}
        >
          <TreePopup
            key={selectedTree.id}
            id={selectedTree.id}
            name={selectedTree.commonName}
            scientificName={selectedTree.scientificName}
            height={selectedTree.height}
            crownRadius={selectedTree.crownRadius}
            diameter={selectedTree.diameterBreastHeight}
            age={selectedTree.age}
            health={selectedTree.health}
            structure={selectedTree.structure}
            classification={selectedTree.classification}
            gpsCoords={[selectedTree.latitude, selectedTree.longitude]}
            comments={selectedTree.comments}
            likes={selectedTree.likes?.likes ?? null}
          />
        </Popup>
      )}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
