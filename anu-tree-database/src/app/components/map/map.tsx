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

export default function Map() {
  const DEFAULT_POSITION: LatLngTuple = [-35.278576, 149.118371];
  const DEFAULT_ZOOM: number = 16;
  const MIN_ZOOM: number = 15;

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
      <TreeMarker
        colour="#125938"
        position={DEFAULT_POSITION}
        initialZoom={DEFAULT_ZOOM}
      >
        <TreePopup
          name={"test tree"}
          scientificName={"scientifica name"}
          height={2}
          crownRadius={20}
          diameter={1}
          age="Fair"
          health="Good"
          structure="Tree"
          classification="Evergreen"
          gpsCoords={[DEFAULT_POSITION[0], DEFAULT_POSITION[1]]}
          comments="Big tree"
          likes={2}
        />
      </TreeMarker>
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
}
