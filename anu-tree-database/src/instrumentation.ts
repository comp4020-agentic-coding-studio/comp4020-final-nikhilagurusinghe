// Next calls register() once when a server instance boots, before it handles
// any request, so this is where the database gets migrated.
export async function register(): Promise<void> {
  // Only the Node server can open the SQLite file; skip the edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { migrateDatabase } = await import("./db/migrate");
  await migrateDatabase();
}
