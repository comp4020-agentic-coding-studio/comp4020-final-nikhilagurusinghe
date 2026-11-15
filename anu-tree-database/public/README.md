# ANU tree map

ANU used to have a publicly accessible database of every tree on campus, but
the page that held it doesn't exist anymore. This app brings it back as a map
of the 9,152 trees from the university's 2024 tree survey. You can tap any
tree to read about it, filter the trees, and if you sign in, like them and see
what everyone else is liking in real time.

## Using it

Tap any dot to read about that tree, or tap a card in the bottom-left box to
fly to one of the most liked trees. To like trees, open **account** and create
an account with a username. Your device saves a passkey, so there's no email or
password.

## What good looks like here

Firstly, I think the most important thing is that the data comes first. The
whole point is the trees, so a good version of this app shows the survey as it
is. Every tree with a location and a trunk measurement is on the map, and the
popup shows the survey's own notes without me editing them, even if a tree is
dead. Although, 17 survey rows with no trunk measurement aren't shown yet, and
the checks make sure that number doesn't get worse.

In terms of where people use it, you'd most likely open this on your phone
standing next to a tree. This means every control has to work at phone width
and the page has to stay small. The first multi-user version sent 4.3 MB of
tree data and crashed the server, so now the map only gets what it needs to
draw each dot.

I also think other people should make it more interesting, but quietly. You
get one like per tree and can take it back, and the like counts and most liked
list update for everyone within a second, so you can kind of watch what a room
full of people is finding on campus. The like is the only social feature,
which was deliberate, as it says "this tree is worth a look" without turning
the trees into a feed.

Lastly, accounts should cost as little as possible. All you need is a username
and a passkey, so there's no email to leak and no mail service to pay for.

## What I chose not to build

I chose not to build comments, photos or profiles, as I think they move the
attention away from the trees and onto people. I also left out email sign-in
and account recovery, so losing your passkey means making a new username, but
I think that's worth it for not collecting personal data. Editing the survey
data was left out too, as that should really need the university's authority.

## Enforced and judged

In terms of what's enforced, the checks in `spec/` make sure that:

- every survey tree with a trunk measurement is on the map, and no others
- the homepage stays under a size budget
- signing in only works with a passkey
- the live like streams answer straight away and reject bad requests
- the most liked list holds at most ten trees, highest first
- this README is published in full at `/readme/`

The rest is judged by me, using the app on my phone and laptop and watching
two browsers side by side while one of them likes trees:

- whether it feels calm rather than social
- whether the design is consistent throughout
- whether a like shows up in the other sessions within a second

## Running it yourself

The app is Next.js 16 in `anu-tree-database/`, run with Bun 1.3.14 (Node 24 is
used for the production server). The trees come in a SQLite database that's
already in the repo, so there's nothing to import.

### On your own machine

```sh
cd anu-tree-database
bun install
```

Make `anu-tree-database/.env.local`:

```sh
# a copy of the seed, so local likes don't end up in the committed database
DB_FILE_NAME=file:./.data/dev.sqlite
BETTER_AUTH_SECRET=   # any long random string: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
```

Then copy the seed and start the dev server:

```sh
mkdir -p .data && cp src/db/treedb.sqlite .data/dev.sqlite
bun run dev
```

It's at <http://localhost:3000>. Migrations run on start, so the accounts and
likes tables are created the first time. Passkeys are tied to the domain in
`BETTER_AUTH_URL`, so open it at `localhost`, not `127.0.0.1`.

Other scripts, run from `anu-tree-database/`:

- `bun run build` then `bun run start` runs the production build
- `bun run typecheck` and `bun run lint`
- `bun run check:dev` runs the checks in `spec/` against the dev server, and
  `bun run check` runs them against a production server at port 8080
  (`bun run build && bun run serve:spec` in another terminal)
- `bun run check:evidence` checks `PROCESS.md` and the reflections

### On Fly.io

The `Dockerfile` and `fly.toml` in the repo root are set up for one 256 MB
machine with a 1 GB volume at `/data`. On first boot the entrypoint copies the
seed database onto the volume; after that it's left alone, so likes and
accounts survive restarts and redeploys. From the repo root:

```sh
fly apps create <app-name>
fly secrets set -a <app-name> \
  BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  BETTER_AUTH_URL=https://<app-name>.fly.dev
fly deploy --remote-only --ha=false -a <app-name>
```

`fly deploy` creates the volume from `fly.toml` on the first run. Keep it to
one machine (`--ha=false`): the live like updates are passed around in memory,
so a second machine wouldn't hear the first one's likes. In this repo, CI runs
the checks and then that same deploy on every push to `main`.

### Anywhere else

Anything that runs a Docker image and keeps a folder between restarts will
work:

```sh
docker build -t anu-tree-map .
docker run -p 4321:4321 -v tree-data:/data \
  -e DB_FILE_NAME=file:/data/app.db \
  -e BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  -e BETTER_AUTH_URL=http://localhost:4321 \
  anu-tree-map
```

Set `BETTER_AUTH_URL` to the address people will actually use, with HTTPS
anywhere that isn't localhost (browsers only allow passkeys on secure
origins), and keep `BETTER_AUTH_SECRET` the same between deploys or everyone
gets signed out. Serverless hosts that don't keep files between requests
won't work as-is, because the database is a SQLite file on disk. Run one
instance only, for the same reason as on Fly.
