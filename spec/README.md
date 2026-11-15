# The spec

The [final project brief](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/assessments/final-project/)
and its spec are on the course website, along with the specs for crits 8, 9 and
10, which run in this repo. The brief poses the problem; the spec is the fixed
contract.

## What ships

`invariants.test.ts` checks the two things the course relies on:

- `/` answers with a 200, which is what the deploy and the crit capture read
- `/readme/` publishes `README.md`. Markdown renderers all differ slightly, so
  it checks the README's headings rather than every word: each one has to
  appear, in order, in the HTML the server sends, since no script runs. Render
  it however you like, as long as it's there in full; the marker reads it there.

Both run against the **running** app over HTTP, so they hold whatever it's built
with. In CI that app is the image your `Dockerfile` builds, started with a
throwaway `/data`, and a red run blocks the deploy. Locally, start the app
however you run it and `bun run check` finds it at `APP_URL` (default
`http://localhost:8080`). Keep them; don't delete them.

## My checks

These hold the promises `README.md` makes, and the rules in `CLAUDE.md` that
are marked **(checked)**.

`promises.test.ts`, grouped by the README's sections:

- **The data comes first**: every tree in the 2024 survey CSV with a trunk
  measurement is a marker on the map, and nothing else is. It reads the CSV
  directly, so a broken import or a filter that drops trees fails it.
- **It works on a phone on campus**: the homepage stays under 1.5 MB (it was
  4.3 MB when it crashed the 256 MB server), each marker carries only id,
  latitude, longitude and classification, and the page sets a phone viewport.
- **Accounts cost as little as possible**: email sign-up and password sign-in
  are refused, and there's no magic link endpoint, so passkeys are the only
  way in.
- **Likes are live for everyone**: the multi-tree like stream sends every
  requested tree's current count, and rejects requests with no valid ids.
- **The argument is published**: the README up to "Running it yourself" is
  400 to 600 words, and the copy
  `/readme/` renders (`anu-tree-database/public/README.md`) matches it.

`auth.test.ts` checks the auth endpoints answer, a forged sign-up is refused,
the account menu is server-rendered, the per-tree and most liked streams send
valid data, and a bad tree id gets a 400.

Not checked yet, and judged by hand instead (see the README's "Enforced and
judged"): one like per person per tree, and a like reaching another open
browser within a second. Likes go through Next server actions, which a plain
HTTP test can't call; checking them needs a like API route and a software
passkey in the tests.

Every check runs against the **running** app: `bun run check` (`APP_URL`,
default `http://localhost:8080`), or `bun run check:dev` against the dev
server.
