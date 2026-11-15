import { defineRelations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { authRelations } from "./auth-schema";

// Better Auth's tables (user, session, account, verification, passkey) live in
// their own file because the CLI generates them; re-exported here so drizzle-kit
// and the app see one schema.
export * from "./auth-schema";

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

const treeRelations = defineRelations({ treesTable, treeLikesTable }, (r) => ({
  treesTable: {
    likes: r.one.treeLikesTable({
      from: r.treesTable.id,
      to: r.treeLikesTable.treeId,
    }),
  },
}));

// defineRelationsPart entries have to be spread after the full defineRelations
// ones, per the Better Auth Drizzle adapter docs.
export const relations = { ...treeRelations, ...authRelations };
