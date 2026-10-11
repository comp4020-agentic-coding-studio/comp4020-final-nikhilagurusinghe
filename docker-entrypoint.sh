#!/bin/sh
# Seeds the Fly volume on first boot.
#
# The volume mounted at /data starts empty, while the committed database ships
# inside the image. Copy it across only when the volume has no usable database
# yet, so redeploys keep whatever likes users have added rather than resetting
# them.
#
# "Usable" means more than just present: this volume outlived an earlier Astro
# deploy that wrote its own /data/app.db, so a bare -f test would happily keep
# a database with none of our tables in it. Anything without trees_table gets
# moved aside rather than deleted, then replaced with the seed.

set -eu

SEED_PATH="/app/seed/treedb.sqlite"

# DB_FILE_NAME is a libsql URL ("file:/data/app.db"); strip the scheme to get a
# path the shell can test.
DB_PATH="${DB_FILE_NAME#file:}"

if [ -z "$DB_PATH" ]; then
  echo "entrypoint: DB_FILE_NAME is unset, cannot locate the database" >&2
  exit 1
fi

seed_database() {
  mkdir -p "$(dirname "$DB_PATH")"
  # Copy to a temporary name first so an interrupted boot can't leave a
  # half-written database that the next boot would treat as already seeded.
  cp "$SEED_PATH" "$DB_PATH.seeding"
  mv "$DB_PATH.seeding" "$DB_PATH"
  echo "entrypoint: seeded $DB_PATH"
}

if [ ! -f "$DB_PATH" ]; then
  echo "entrypoint: no database at $DB_PATH, seeding from $SEED_PATH"
  seed_database
elif ! sqlite3 "$DB_PATH" \
  "select 1 from sqlite_master where type='table' and name='trees_table';" \
  2>/dev/null | grep -q 1; then
  STALE_PATH="$DB_PATH.pre-nextjs.$(date +%Y%m%d%H%M%S)"
  echo "entrypoint: $DB_PATH has no trees_table, so it predates this app;" \
    "moving it to $STALE_PATH and seeding fresh"
  mv "$DB_PATH" "$STALE_PATH"
  # WAL sidecars belong to the database we just moved aside, not the seed.
  rm -f "$DB_PATH-wal" "$DB_PATH-shm"
  seed_database
else
  echo "entrypoint: database already present at $DB_PATH, leaving it alone"
fi

exec "$@"
