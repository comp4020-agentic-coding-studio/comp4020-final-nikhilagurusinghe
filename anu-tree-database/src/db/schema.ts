import { defineRelations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { authRelations, user } from "./auth-schema";

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

// Which user liked which tree. The composite primary key is what limits each
// user to one like per tree. tree_likes_table.likes stays the running total
// (it also holds the likes from before accounts existed); like-tree.ts keeps
// the two in step inside one transaction.
export const userTreeLikesTable = sqliteTable(
  "user_tree_likes",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    treeId: integer()
      .notNull()
      .references(() => treesTable.id, { onDelete: "cascade" }),
    createdAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.treeId] }),
    // For per-tree lookups; the primary key already covers per-user ones,
    // which is what personal like lists will use.
    index("user_tree_likes_tree_id_idx").on(table.treeId),
  ],
);

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
