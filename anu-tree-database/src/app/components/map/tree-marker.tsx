import { LatLngTuple } from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactNode, useState } from "react";

type MapMarkerProps = {
  colour: string;
  position: LatLngTuple;
  initialZoom: number;
  children?: ReactNode;
};

// https://github.com/ishaan6395/react-leaflet-enhanced-marker/issues/32#issuecomment-1071376415
// https://stackoverflow.com/questions/59734211/how-can-i-get-the-current-leaflet-map-zoom-level
export default function TreeMarker({
  colour,
  position,
  initialZoom,
  children,
}: MapMarkerProps) {
  const MARKER_DEFAULT_SIZE = 12;

  const [mapZoom, setMapZoom] = useState<number>(initialZoom);

  const map: L.Map = useMapEvents({
    zoomstart: () => {
      setMapZoom(map.getZoom());
    },
  });

  const width: number = MARKER_DEFAULT_SIZE * (mapZoom / initialZoom);

  return (
    <Marker
      position={position}
      icon={L.divIcon({
        html: renderToStaticMarkup(
          <div
            className="rounded-full aspect-square h-7 border-2 border-white"
            style={{ background: colour, height: width, width: width }}
          ></div>,
        ),
        className: "tree-marker",
        iconSize: [width, width],
        iconAnchor: [width / 2, width],
        popupAnchor: [0, -width / 2],
      })}
    >
      {children}
    </Marker>
  );
}
