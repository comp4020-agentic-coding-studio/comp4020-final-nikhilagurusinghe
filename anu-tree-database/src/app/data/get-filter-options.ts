import "server-only";

import { unstable_cache } from "next/cache";
import { drizzle } from "drizzle-orm/libsql";
import { treesTable } from "@/db/schema";
import { ComboBoxOptions } from "../components/filter/combo-box";
import { max, min } from "drizzle-orm";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

const CACHE_REVALIDATE_SECONDS: number = 3600;
const db = drizzle(process.env.DB_FILE_NAME!);

export const getGeneraOptions = unstable_cache(
  async (): Promise<ComboBoxOptions> => {
    const allScientificNames = await db
      .selectDistinct({ scientificName: treesTable.scientificName })
      .from(treesTable);

    return Array.from(
      new Set(
        allScientificNames.map(
          ({ scientificName }) => scientificName.split(" ")[0],
        ),
      ),
    ).map((val) => ({ value: val }));
  },
  undefined,
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

export const getAgeOptions = unstable_cache(
  async (): Promise<ComboBoxOptions> => {
    const distinctAges = await db
      .selectDistinct({ age: treesTable.age })
      .from(treesTable);

    return distinctAges.map(({ age }) => ({ value: age ?? "" }));
  },
  undefined,
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

export const getClassificationOptions = unstable_cache(
  async (): Promise<ComboBoxOptions> => {
    const distinctAges = await db
      .selectDistinct({ classification: treesTable.classification })
      .from(treesTable);

    return distinctAges.map(({ classification }) => ({
      value: classification,
    }));
  },
  undefined,
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

export const getStructureOptions = unstable_cache(
  async (): Promise<ComboBoxOptions> => {
    const distinctAges = await db
      .selectDistinct({ structure: treesTable.structure })
      .from(treesTable);

    return distinctAges.map(({ structure }) => ({ value: structure }));
  },
  undefined,
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
  },
);

function getMaxMin(databaseColumn: SQLiteColumn): () => Promise<{
  max: number;
  min: number;
}> {
  return async (): Promise<{ max: number; min: number }> => {
    const maxMinHeight = await db
      .select({ max: max(databaseColumn), min: min(databaseColumn) })
      .from(treesTable);

    return {
      max: (maxMinHeight[0].max as number) ?? 0,
      min: (maxMinHeight[0].min as number) ?? 0,
    };
  };
}

export const getMaxMinHeight = unstable_cache(
  getMaxMin(treesTable.height),
  undefined,
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

export const getMaxMinCrownRadius = unstable_cache(
  getMaxMin(treesTable.crownRadius),
  undefined,
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

export const getMaxMinDBH = unstable_cache(
  getMaxMin(treesTable.diameterBreastHeight),
  undefined,
  { revalidate: CACHE_REVALIDATE_SECONDS },
);
