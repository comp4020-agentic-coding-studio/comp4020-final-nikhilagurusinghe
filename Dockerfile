# syntax = docker/dockerfile:1

# The image Fly builds and runs. The app lives in anu-tree-database/ and uses
# bun to install, so the build stage installs and builds there, then the runtime
# stage keeps only Next's standalone server output.

ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Next.js"

WORKDIR /app

# bun for the install and build; node stays for the runtime stage, since the
# standalone server is a plain node entrypoint.
ARG BUN_VERSION=1.3.14
RUN npm install -g bun@$BUN_VERSION

# --- build stage: install, build, emit .next/standalone --------------------
FROM base AS build

# toolchain for native modules (libsql), in case no prebuilt binary matches
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

COPY anu-tree-database/package.json anu-tree-database/bun.lock ./
RUN bun install --frozen-lockfile

COPY anu-tree-database/ ./

ENV NEXT_TELEMETRY_DISABLED=1
# The build imports modules that open the database at module load, so point it
# at the copy inside the image. At runtime this is the volume instead.
ENV DB_FILE_NAME="file:/app/src/db/treedb.sqlite"
RUN bun run build

# --- runtime stage: the standalone server and the seed database ------------
FROM base

ENV NODE_ENV=production

# the entrypoint uses sqlite3 to tell a seeded volume from a stale one
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y sqlite3 && \
    rm -rf /var/lib/apt/lists/*

# standalone bundles its own minimal node_modules and a server.js entrypoint
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# The committed database, copied onto the volume on first boot by the
# entrypoint. Kept outside /data so the volume mount can't shadow it.
COPY --from=build /app/src/db/treedb.sqlite /app/seed/treedb.sqlite

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Next's standalone server reads HOSTNAME and PORT
ENV HOSTNAME=0.0.0.0
ENV PORT=4321
EXPOSE 4321

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
