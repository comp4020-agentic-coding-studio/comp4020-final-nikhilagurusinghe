import { Popup } from "react-leaflet";
import LinkIcon from "../icons/link";
import Link from "next/link";

export default function TreePopup() {
  return (
    <Popup
      className="
    [&_.leaflet-popup-content]:text-white! [&_.leaflet-popup-content]:font-sans!
      [&_.leaflet-popup-content-wrapper]:bg-transparent! [&_.leaflet-popup-content-wrapper]:backdrop-blur-xl! [&_.leaflet-popup-content-wrapper]:border-white/20! [&_.leaflet-popup-content-wrapper]:rounded-2xl! [&_.leaflet-popup-content-wrapper]:border!
    [&_.leaflet-popup-close-button_span]:text-white! [&_.leaflet-popup-close-button_span]:font-serif! [&_.leaflet-popup-close-button_span]:text-3xl!
      [&_.leaflet-popup-close-button]:mt-1! [&_.leaflet-popup-close-button]:mr-2!"
    >
      <section className="flex flex-col mx-1">
        <span className="mb-1">
          <h1 className="text-xl font-bold mb-1 text-(--highlight-colour)">
            Tree Species long really long name
          </h1>
          <h2 className="text-[17px] italic">Scientific Name of tree</h2>
        </span>
        <span className="text-sm">
          Mature · 1m height · 3m diameter · 1m canopy radius
        </span>
        <span className="mt-5 text-sm">
          yeaah basically its a big huge tree looks good
        </span>

        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${-35.278576},${149.118371}`}
          className="mt-5"
        >
          <span className="flex flex-row text-sm font-bold w-fit items-center gap-x-1 backdrop-blur-md bg-white/20 py-1 px-3 text-white rounded-full">
            <LinkIcon
              height={15}
              stroke="#d0d0d0"
              strokeWidth={2}
              fill="none"
            />
            -35.278576, 149.118371
          </span>
        </Link>
      </section>
    </Popup>
  );
}
