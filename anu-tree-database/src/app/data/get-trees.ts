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

// Just enough to draw a tree's dot on the map. The page renders every visible
// tree into its HTML, so sending all of Tree for ~9,000 trees made a 4MB page
// that ran the 256MB Fly machine out of memory. Everything else is fetched for
// one tree at a time when its popup opens (see get-tree-details.ts).
export type TreeMarker = Pick<
  Tree,
  "id" | "latitude" | "longitude" | "classification"
>;

export function getTreesViaFilter(
  filters: TreeFilters = {},
): Promise<TreeMarker[]> {
  return getTreesViaFilterHelper(filters)();
}

function getTreesViaFilterHelper(
  filters: TreeFilters,
): () => Promise<TreeMarker[]> {
  return async (): Promise<TreeMarker[]> => {
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
      columns: {
        id: true,
        latitude: true,
        longitude: true,
        classification: true,
      },
    });
  };
}
