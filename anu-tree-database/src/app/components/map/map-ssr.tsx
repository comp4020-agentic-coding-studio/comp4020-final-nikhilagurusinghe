"use client";

import { Tree } from "@/app/data/get-trees";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export type MapProps = { visibleTrees: Tree[] };

// https://www.tomisin.dev/blog/displaying-a-leaflet-map-in-nextjs
export default function MapSSR({ visibleTrees }: MapProps) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/components/map/map"), {
        loading: () => (
          <div className="flex flex-col w-full h-full items-center justify-center text-2xl">
            Map is loading...
          </div>
        ),
        ssr: false,
      }),
    [],
  );

  return (
    <div className="z-0 h-full w-full">
      <Map visibleTrees={visibleTrees} />
    </div>
  );
}
