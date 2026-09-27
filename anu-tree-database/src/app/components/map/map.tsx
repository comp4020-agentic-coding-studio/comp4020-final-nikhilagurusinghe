import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

export default function Map() {
  const position: LatLngTuple = [-35.278576, 149.118371];
  const zoom: number = 16;

  return (
    <MapContainer
      className="h-full w-full"
      center={position}
      zoom={zoom}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
          <div>
            hello
          </div>
        </Popup>
      </Marker>
      <ZoomControl position="bottomright" />
     
    </MapContainer>
  );
}
