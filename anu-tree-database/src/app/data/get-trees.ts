import "server-only";

import { drizzle } from "drizzle-orm/libsql";
import { relations } from "@/db/schema";
import { TreeFilters } from "./tree-filter-params";

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

export function getTreesViaFilter(filters: TreeFilters = {}): Promise<Tree[]> {
  return getTreesViaFilterHelper(filters)();
}

function getTreesViaFilterHelper(filters: TreeFilters): () => Promise<Tree[]> {
  return async (): Promise<Tree[]> => {
    const {
      genus,
      commonName,
      height,
      crownRadius,
      diameterBreastHeight,
      age,
      health,
      structure,
      classification,
    } = filters;

    const where = {
      ...(genus?.length && {
        OR: genus.map((value) => ({
          scientificName: { like: `${value}%` },
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
