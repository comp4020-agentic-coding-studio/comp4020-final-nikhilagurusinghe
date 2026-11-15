# Rules for agents working on the ANU tree map

These come from `README.md`, which argues what good means for this app. If a
change would break one of these, stop and ask rather than work around it. The
checks in `spec/` enforce the ones marked **(checked)**.

## Working with me

- Plan before building anything bigger than a bug fix. Keep the plan short,
  step by step, and draw an ASCII mockup for anything visible. Wait for me to
  confirm it.
- Never commit or push. I do that myself.
- Deploy to Fly only when I say so, each time. Pushing to `main` also deploys
  through CI, so anything uncommitted can be overwritten by my next push.
- Never print secrets. The Fly token lives in `.env`; read only that value,
  inline, when deploying.
- Stop and ask when you need a decision from me, instead of guessing.

## The data

- Show the 2024 survey as it is. Don't edit, round or hide survey values,
  and don't drop trees because they're dead or have odd values.
- Every tree in `tree-databases/ANU tree database 2024.csv` with a trunk
  measurement (DBH) is on the map, and no others. **(checked)**
- `src/db/treedb.sqlite` is the seed. The entrypoint copies it onto the Fly
  volume only when there's no database there, so schema changes must go
  through drizzle-kit migrations in `anu-tree-database/drizzle/`, which run at
  start-up. Never replace the database on the volume.

## Phones and memory

- Every control works at phone width (390px) as well as desktop (1280px).
  Check both with screenshots before saying a UI change is done.
- The homepage sends only what the map needs to draw each dot (id, latitude,
  longitude, classification). Everything else loads when a tree is opened.
  The homepage HTML stays under 1.5 MB. **(checked)**
- The app runs on one 256 MB Fly machine. Test anything that changes what the
  server holds in memory in Docker with `--memory=256m` before deploying.

## Likes and people

- A person is an account: a username plus a passkey. No email, no password, no
  magic links. Email sign-up and password sign-in must stay refused.
  **(checked)**
- One like per person per tree, and they can take it back. The total is
  changed in the same transaction as the person's like row.
- Likes, counts and the most liked list update live for everyone through
  server-sent events. The event hub is in memory, which only works because
  there's one machine; don't add machines without replacing it. **(checked:
  the streams answer and reject bad requests)**
- The most liked list is at most ten trees, highest first, each with at least
  one like. **(checked)**
- No comments, photos, profiles or feeds. The like is the only social signal.

## Design

- Follow the existing design language and never invent a new one: frosted glass
  over the map (`backdrop-blur`, `border-white/20`, `bg-white/20` chips),
  `rounded-full` pills and `rounded-2xl` panels, white text, the
  `--highlight-colour` green for names and selected states, and lowercase
  labels.
- Reuse what's there (`classificationColour`, the icon components, Headless UI)
  before adding anything new.
- Boxes pinned to an edge of the map keep a fixed size, so their controls don't
  move under the pointer.
- Stop clicks and scrolls on overlays from reaching the map
  (`L.DomEvent.disableClickPropagation` / `disableScrollPropagation`).

## Before saying it's done

- `bun run typecheck` and `bunx biome check` on the files you changed.
- `bun run check` against a running app (`bun run check:dev` against the dev
  server), and `bun run check:evidence`.
- For UI changes, drive it in a real browser at both widths, signed in and
  signed out.
- This is Next.js 16: read `anu-tree-database/AGENTS.md` and the docs in
  `node_modules/next/dist/docs/` before using a Next API.
- Hot reload doesn't work on `/mnt/c` under WSL; restart the dev server after
  editing.
