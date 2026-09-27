"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

// https://www.tomisin.dev/blog/displaying-a-leaflet-map-in-nextjs
export default function MapSSR() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/components/map/map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  return (
    <div className="z-0 h-full w-full">
      <Map />
    </div>
  );
}
