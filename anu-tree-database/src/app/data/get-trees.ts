import "server-only";

import { unstable_cache } from "next/cache";
import { drizzle } from "drizzle-orm/libsql";
import { treesTable, relations } from "@/db/schema";
import { ComboBoxOptions } from "../components/filter/combo-box";
import {
  and,
  gte,
  ilike,
  inArray,
  like,
  lte,
  max,
  min,
  or,
  SQL,
  sql,
} from "drizzle-orm";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { SliderValues } from "../components/filter/slider-dropdown";

const db = drizzle(process.env.DB_FILE_NAME!, { relations });

export type Tree = {
  id: number;
  scientificName: string;
  commonName: string | null;
  height: number;
  crownRadius: number | null;
  diameterBreastHeight: number;
  age: string | null;
  significance: string;
  health: string | null;
  structure: string;
  usefulLifeExpectancy: string;
  habitat: boolean;
  classification: string;
  comments: string | null;
  otherObservations: string | null;
  longitude: number;
  latitude: number;
  likes: { treeId: number; likes: number } | null;
};

export function getTreesViaFilter(
  genus?: string[],
  commonName?: string[],
  height?: SliderValues,
  crownRadius?: SliderValues,
  diameterBreastHeight?: SliderValues,
  age?: string[],
  health?: string[],
  structure?: string[],
  classification?: string[],
): Promise<Tree[]> {
  return getTreesViaFilterHelper(
    genus,
    commonName,
    height,
    crownRadius,
    diameterBreastHeight,
    age,
    health,
    structure,
    classification,
  )();
}

function getTreesViaFilterHelper(
  genus?: string[],
  commonName?: string[],
  height?: SliderValues,
  crownRadius?: SliderValues,
  diameterBreastHeight?: SliderValues,
  age?: string[],
  health?: string[],
  structure?: string[],
  classification?: string[],
): () => Promise<Tree[]> {
  return async (): Promise<Tree[]> => {
    const where = {
      ...(genus?.length && {
        OR: genus.map((value) => ({
          scientificName: { like: `%${value}%` },
        })),
      }),
      ...(commonName?.length && { commonName: { in: commonName } }),
      ...(height && {
        height: { gte: height.startValue, lte: height.endValue },
      }),
      ...(crownRadius && {
        crownRadius: { gte: crownRadius.startValue, lte: crownRadius.endValue },
      }),
      ...(diameterBreastHeight && {
        diameterBreastHeight: {
          gte: diameterBreastHeight.startValue,
          lte: diameterBreastHeight.endValue,
        },
      }),
      ...(age?.length && { age: { in: age } }),
      ...(health?.length && { health: { in: health } }),
      ...(structure?.length && { structure: { in: structure } }),
      ...(classification?.length && { classification: { in: classification } }),
    };

    return db.query.treesTable.findMany({
      where,
      with: { likes: true },
    });
  };
}
