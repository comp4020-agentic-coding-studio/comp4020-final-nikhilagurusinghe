import Filters from "./components/filter/filters";
import MapSSR from "./components/map/map-ssr";
import {
  getAgeOptions,
  getClassificationOptions,
  getGeneraOptions,
  getMaxMinCrownRadius,
  getMaxMinDBH,
  getMaxMinHeight,
  getStructureOptions,
} from "@/app/data/get-filter-options";
import { getTreesViaFilter } from "./data/get-trees";
import { parseTreeFilters, SearchParams } from "./data/tree-filter-params";

type HomeProps = { searchParams: Promise<SearchParams> };

export default async function Home({ searchParams }: HomeProps) {
  const filters = parseTreeFilters(await searchParams);

  return (
    <div className="relative flex flex-1 w-full h-full flex-row justify-center font-sans bg-white">
      <Filters
        generaOptions={await getGeneraOptions()}
        classificationOptions={await getClassificationOptions()}
        heightMinMax={await getMaxMinHeight()}
        crownRadMinMax={await getMaxMinCrownRadius()}
        diameterMinMax={await getMaxMinDBH()}
        structureOptions={await getStructureOptions()}
        ageOptions={await getAgeOptions()}
      />
      <div className="flex w-full h-full items-center justify-center">
        <MapSSR visibleTrees={await getTreesViaFilter(filters)} />
      </div>
    </div>
  );
}
