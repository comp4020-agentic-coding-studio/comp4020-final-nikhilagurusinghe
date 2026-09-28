import { Popup } from "react-leaflet";
import LinkIcon from "../icons/link";
import Link from "next/link";
import HeartIcon from "../icons/heart";

export type TreePopupProps = {
  name: string;
  scientificName: string;
  height: number;
  crownRadius: number;
  diameter: number;
  age: string;
  health: string;
  structure: string;
  classification: string;
  gpsCoords: number[];
  comments?: string;
  likes: number;
};

export default function TreePopup({
  name,
  scientificName,
  height,
  crownRadius,
  diameter,
  age,
  health,
  structure,
  classification,
  gpsCoords,
  comments,
  likes,
}: TreePopupProps) {
  return (
    <Popup
      className="
    [&_.leaflet-popup-content]:text-white! [&_.leaflet-popup-content]:font-sans!
      [&_.leaflet-popup-content-wrapper]:bg-transparent! [&_.leaflet-popup-content-wrapper]:backdrop-blur-xl! [&_.leaflet-popup-content-wrapper]:border-white/20! [&_.leaflet-popup-content-wrapper]:rounded-2xl! [&_.leaflet-popup-content-wrapper]:border!
    [&_.leaflet-popup-close-button_span]:text-white! [&_.leaflet-popup-close-button_span]:font-serif! [&_.leaflet-popup-close-button_span]:text-3xl!
      [&_.leaflet-popup-close-button]:mt-1! [&_.leaflet-popup-close-button]:mr-2!"
    >
      <section className="flex flex-col px-1 py-2">
        <span className="mb-1">
          <h1 className="text-2xl/6.5 font-bold mb-1 text-(--highlight-colour)">
            {name}
          </h1>
          <h2 className="text-[17px] italic">{scientificName}</h2>
        </span>
        <span className="text-sm">
          {age} · {health} · {structure} · {classification}
        </span>
        <span className="text-sm">
          {height}m height · {diameter}m diameter · {crownRadius}m canopy radius
        </span>
        {comments && <span className="mt-5 text-sm">{comments}</span>}

        <div className="flex flex-row gap-x-1 gap-y-1 w-full flex-wrap mt-5">
          <button
            type="button"
            className="cursor-pointer flex flex-row text-sm font-bold w-fit items-center gap-x-1 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap truncate"
          >
            <HeartIcon
              height={15}
              stroke="#d0d0d0"
              strokeWidth={3}
              fill="none"
            />
            {likes} likes
          </button>

          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${gpsCoords[0]},${gpsCoords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex flex-row text-sm font-bold w-fit items-center gap-x-1 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap">
              <LinkIcon
                height={15}
                stroke="#d0d0d0"
                strokeWidth={3}
                fill="none"
              />
              {gpsCoords[0]}, {gpsCoords[1]}
            </span>
          </Link>

          <Link
            href={`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
              scientificName,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex flex-row text-sm font-bold w-fit items-center gap-x-1 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full whitespace-nowrap">
              <LinkIcon
                height={15}
                stroke="#d0d0d0"
                strokeWidth={3}
                fill="none"
              />
              learn more on Wikipedia
            </span>
          </Link>
        </div>
      </section>
    </Popup>
  );
}
