import Filters from "./components/filter/filters";

export default function Home() {
  return (
    <main className="relative flex flex-1 w-full h-full flex-row justify-center font-sans bg-gray-500">
      <Filters />
      <div className="flex w-full h-full items-center justify-center">map</div>
    </main>
  );
}
