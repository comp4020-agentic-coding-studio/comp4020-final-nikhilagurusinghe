import { defineRelations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const treesTable = sqliteTable("trees_table", {
  id: integer().primaryKey({ autoIncrement: true }),
  scientificName: text().notNull(),
  commonName: text(),
  height: real().notNull(),
  crownRadius: real(),
  diameterBreastHeight: real().notNull(),
  age: text(),
  significance: text().notNull(),
  health: text(),
  structure: text().notNull(),
  usefulLifeExpectancy: text().notNull(),
  habitat: integer({ mode: "boolean" }).notNull(),
  classification: text().notNull(),
  comments: text(),
  otherObservations: text(),
  longitude: real().notNull(),
  latitude: real().notNull(),
});

export const treeLikesTable = sqliteTable("tree_likes_table", {
  treeId: integer()
    .primaryKey()
    .references(() => treesTable.id, { onDelete: "cascade" }),
  likes: integer().notNull().default(0),
});

export const relations = defineRelations(
  { treesTable, treeLikesTable },
  (r) => ({
    treesTable: {
      likes: r.one.treeLikesTable({
        from: r.treesTable.id,
        to: r.treeLikesTable.treeId,
      }),
    },
  }),
);
