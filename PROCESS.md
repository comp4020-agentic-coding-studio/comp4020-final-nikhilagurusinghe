# Process overview

## What I built

ANU used to have a publicly accessible database of every tree on campus. Its
[landing page](https://services.anu.edu.au/campus-environment/sustainability-environment/landscape-conservation/trees-at-anu)
is still up, but as you can see the
[tree database](https://services.anu.edu.au/campus-environment/sustainability-environment/gardens-grounds/tree-database)
it links to doesn't exist anymore. I emailed ANU grounds and got their 2024
survey of every tree at ANU as a KML file, and built a map arund it. It has
9,152 trees you can filter and open, passkey accounts, one like per person per
tree, and a live list of the most liked trees. `README.md` makes the case for
what good means here.

## From the brief to the harness

Firstly, the first half was a map with nobody else in it. I
chose Next.js ([`82f19aa`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/82f19aa)),
added Leaflet for the map ([`4f0a790`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/4f0a790)),
and then spent most of a week on the filters, a combo box
([`859693f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/859693f))
and a range slider
([`fb1937c`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/fb1937c)).
After that I converted the KML to a CSV with a Python script
([`ee44062`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/ee44062)),
loaded it into SQLite through Drizzle, and moved the filter state into the URL
so a filtered map can be shared
([`687c79a`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/687c79a)).

In terms of deploying it, I moved the course CI over to Bun
([`1577470`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/1577470)),
wrote a Dockerfile and an entrypoint that only seeds the Fly volume when it's
empty ([`156bb7f`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/156bb7f)),
and published the README at `/readme`
([`01b06bd`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/01b06bd)).
The first bit of shared state was an anonymous like button
([`32006f5`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/32006f5)).
It persisted, but other people only saw the new count after reloading, and
anyone could like a tree as many times as they wanted.

The second half is where it became multi-user and real-time. Passkey accounts
came first ([`4aad619`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/4aad619)),
then likes that are tied to a person with live counts
([`b2fd1d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/b2fd1d1)),
and then the box of liked and most liked trees
([`4f7ebf9`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/4f7ebf9),
[`58a83de`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/58a83de)).

## Why this stack

I chose Next.js because it gave me the server and the user interface in one
app, and it's server-rendered so the map already has its trees on the first
load. However, Next 16 has changed enough that agents and older tutorials tend
to get it wrong, which is why `CLAUDE.md` points the agent at  docs that
come with it.

For the database I used SQLite through Drizzle, stored on the Fly volume. I
think one file on one machine is plenty for a campus's worth of trees and
likes, and it survives restarts and redeploys. Drizzle was the ORM in the
course template, and learning it took up most of my backend time. In hindsight
something lighter would have done, but in saying that its migrations now run
when the server starts and change the live database safely. The trade-off with SQLite is that it's one machine, so the
app can't scale out.

For accounts I used Better Auth with passkeys only. I originally wanted emailed
magic links, but they need a mail service, and every free one I found either
costs money past a limit or needs a verified domain. Pass-keys don't need a
third party at all, and the app never has to hold an email or a password.
Although, the cost is that there's no account recovery, and I had to build the
sign-up flow around a username, as passkeys don't come with one.

For the live updates I used server-sent events. Likes only ever go one way,
from the server to whoever's watching, which is exactly what SSE does, over
plain HTTP with reconnecting built in. Polling would
have been simpler but either slow or wasteful, and WebSockets would have added
a second protocol for messages that never go the other way. The events go
through a hub in memory, which ties the app to one machine, but that's the same
limit SQLite already set.

## How I worked with the agent

I wrote the first half by hand on purpose, as I wanted to learn how to build
user interfaces myself, and the commit history from September kind of shows
that. For the multi-user half (15 November) I used Claude Code.

The way I worked with it is now written down in `CLAUDE.md`. It plans first
with an ASCII mockup for anything visible and waits for me to confirm, it never
commits, it only deploys when I approve it, and it follows the existing glass
design rather than coming up with its own. For example, I had it redraw the liked trees box three times as
mockups (without the count, not collapsible, and with a scroll bar instead of
arrows) before any code was written. It checked its own work by driving real
browsers with a virtual passkey at desktop and phone widths, as well as running
the production image in Docker capped at 256 MB like the Fly machine.

## Corrections that went into the harness

I think the biggest correction was the out-of-memory crash. The first
multi-user deploy sent every tree's full record to the browser, which made a
4.3 MB page, and the 256 MB machine kept running out of memory. I rolled it
back, then cut the map's data down to the four fields it actually draws, which
brought it down to 1 MB. That's now a rule in `CLAUDE.md` as well as two checks
in `spec/promises.test.ts`, a size budget and one making sure the markers only
carry those four fields.

There were also a few smaller ones. After signing in, an open popup still
thought you were signed out until you reloaded the page, so the fix reloads the
tree when the user changes
([`b2fd1d1`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/b2fd1d1)).
Clicking a liked tree zoomed past the map tiles' maximum and showed a blank
grey map, so now  capped it's at 18
([`4f7ebf9`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/4f7ebf9)).
The box also grew and shrank when switching tabs, so the tabs jumped out from
under the mouse and quick clicks missed. It now has a fixed height
([`58a83de`](https://github.com/comp4020-agentic-coding-studio/comp4020-final-nikhilagurusinghe/commit/58a83de)),
and `CLAUDE.md` says that boxes pinned to the edge keep a fixed size.

Lastly, writing the data check showed that 17 survey trees were missing, as the
schema requires a trunk diameter and those rows don't have one. The check now
holds that number where it is and the README is upfront about it.

## What I'd do differently

All in all, I think the main thing I'd change is writing the checks earlier.
The most important pormises, which are one like per person and a like reaching
everyone within a second, are still judged by hand, because likes go through
server actions that a plain HTTP test can't call. A like API route would have
made them testable. I'd also bring in the 17 missing trees by making the trunk
diameter optional.
