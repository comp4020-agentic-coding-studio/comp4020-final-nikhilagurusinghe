import path from "node:path";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

// Brings whichever database DB_FILE_NAME points at up to the current schema:
// the local dev copy, the Fly volume, or CI's throwaway /data.
//
// The trees and likes tables predate migrations (they were pushed, so the
// first folder in drizzle/ has a snapshot but no migration.sql, and drizzle's
// migrator skips folders without one). That means only migrations from the
// auth tables onward ever run here, and the existing tables are never touched.
export async function migrateDatabase(): Promise<void> {
  const db = drizzle(process.env.DB_FILE_NAME!);

  // In the Docker image the server runs from /app with drizzle/ copied
  // alongside it; in dev, cwd is the project folder. Both resolve the same way.
  const migrationsFolder = path.join(process.cwd(), "drizzle");

  await migrate(db, { migrationsFolder });
}
