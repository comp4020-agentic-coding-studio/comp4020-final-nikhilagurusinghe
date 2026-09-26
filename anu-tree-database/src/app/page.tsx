import Image from "next/image";
import Filters from "./components/filters";

export default function Home() {
  return (
    <div className="flex flex-col p-(--home-page-padding) w-full h-full items-center justify-center font-sans">
      <main className="flex flex-1 w-full h-full flex-row items-center gap-x-(--home-page-component-gap)">
        <div className="relative h-full bg-blue-200 flex-2/3 rounded-(--home-page-component-cornering)">
          <Filters />
          <div className="flex w-full h-full items-center justify-center">
            map
          </div>
        </div>
        <div className="h-full bg-blue-200 flex-1/3 rounded-(--home-page-component-cornering)">
          info panel
        </div>
      </main>
    </div>
  );
}
