# Your prototype

<!-- TEMPLATE: this file is yours, and the deployed app publishes it in full at
     /readme/ --- a visitor reads it before they touch the app, and so does the
     marker. Replace everything in it, this comment included. -->

What this is, in a paragraph: the thing, and what it's for.

## What good looks like here

Say what good means for this app: what you decided, what you read or looked at
while deciding, and what you chose not to build. The rules that decision
produced live in `CLAUDE.md` and the checks that protect it live in `spec/`;
this is the argument they came from, so say which parts of good are enforced and
which are judgement calls.

Images go in `public/` and are linked relatively --- `![alt](public/before.png)`
--- which renders on GitHub and at `/readme/` alike.

Two terminals. Production path, closest to CI:

bun run build && bun run serve:spec   # terminal 1
bun run test                          # terminal 2

Or against the dev server:

bun run dev        # terminal 1, port 3000
bun run test:dev   # terminal 2
