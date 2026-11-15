# ANU tree map

ANU used to publish a database of every tree on its Acton campus. The page
that held it is gone. This app brings it back as a map: 9,152 trees from the
university's 2024 tree survey, each a dot you can tap to read its species,
height, age, health and the surveyor's notes, with filters for classification,
genus, height, crown radius, trunk diameter, age and structure. People who sign
in can like trees, and everyone sees which trees other people like, live.

## Using it

Tap any dot to read that tree. The box in the bottom-left corner lists the most
liked trees. To like trees, open **account**, pick a username and create an
account; your device saves a passkey, so there's no email or password. Tap a
card in the box to fly to that tree.

## What good looks like here

**The data comes first.** The point is the trees, so a good version of this app
shows the survey as it is. Every tree with a location and a trunk measurement is
on the map, and the popup shows the survey's own fields and notes, unedited.
I'd rather show a dead tree honestly than tidy it away. The 17 survey rows that
have no trunk measurement aren't shown yet, and the checks hold that number
where it is.

**It works on a phone on campus.** You'd most likely open this standing next to
a tree on a phone. That means every control has to fit and work at phone width,
and the page has to stay small. The first multi-user version sent every tree's
full record to the browser, 4.3 MB, and crashed the server. Now the map gets
only what it needs to draw each dot, and a popup loads the rest when you tap.

**Other people make it more interesting, quietly.** One like per person per
tree, and you can take it back. The most liked list and the counts update for
everyone within a second, so you can watch what a room full of people finds on
campus. The like is the only social signal, and that's deliberate: it says
"this tree is worth a look" without turning the trees into a feed.

**Accounts cost as little as possible.** A username and a passkey. The app
never asks for an email, so there's nothing to leak and no mail service to pay
for.

## What I chose not to build

Comments, photos and profiles: they move attention from trees to people. Email sign-in and account recovery: losing your passkey means making
a new username, a cost I accepted for collecting no personal data. Editing the
survey data, which would need the university's authority.

## Enforced and judged

Enforced by the checks in `spec/`:

- every tree in the 2024 survey with a trunk measurement is on the map, and no
  others
- the homepage stays under a size budget
- sign-in is passkey only: email sign-up and password sign-in are refused
- the live like streams answer straight away and reject bad requests
- the most liked list holds at most ten trees, highest first, each with at
  least one like
- this README is published in full at `/readme/`

Judged, by me, using the app on my own phone and laptop, and by watching two
browsers side by side while one of them liked trees:

- whether it feels calm rather than social
- whether the design is consistent across the filters, popups and the liked
  trees box
- whether a like appears in other sessions within a second
