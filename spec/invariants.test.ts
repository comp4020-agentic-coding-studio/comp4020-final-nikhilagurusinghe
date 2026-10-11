import { readFileSync } from "node:fs";
import { expect, it } from "bun:test";
import { baseUrl } from "./global-setup";

// The two things the course relies on, checked against the RUNNING app
// (spec/global-setup.ts finds it): it answers at /, and /readme/ publishes
// README.md. Every other check in spec/ is yours.

// bun:test allows 5s per test by default, which a cold machine or a large
// server-rendered page can exceed even though the app is healthy —
// global-setup.ts only waits for the first byte, not for a warm one.
const REQUEST_TIMEOUT_MS = 30_000;

it(
  "answers at /",
  async () => {
    const res = await fetch(new URL("/", baseUrl));
    expect(res.status).toBe(200);
  },
  REQUEST_TIMEOUT_MS,
);

// Script and style bodies are markup, not page text. spec/README.md asks for
// the headings to be in the HTML the server sends "since no script runs", so a
// readme that exists only inside an inlined framework payload must not count as
// published — which is why these are dropped before any text is collected.
const NON_TEXT_ELEMENTS = /<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

// HTMLRewriter yields text exactly as it appears in the source, so entities
// arrive undecoded and normalise() would read "&amp;" as the letters "amp".
// The five XML basics plus numeric references cover what a server emits for
// text; anything beyond ASCII ships as UTF-8 rather than as a named entity.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(source: string): string {
  return source.replace(
    /&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi,
    (match: string, body: string): string => {
      if (!body.startsWith("#")) {
        return NAMED_ENTITIES[body.toLowerCase()] ?? match;
      }
      const codePoint =
        body[1]?.toLowerCase() === "x"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    },
  );
}

// Bun's HTMLRewriter replaces jsdom here: it parses the served HTML without a
// dependency, so spec/ needs nothing installed at the repo root.
async function text(html: string): Promise<string> {
  let collected = "";
  await new HTMLRewriter()
    .on("*", {
      text(chunk): void {
        collected += chunk.text;
      },
    })
    .transform(new Response(html.replace(NON_TEXT_ELEMENTS, " ")))
    .text();
  return decodeEntities(collected);
}

// Link targets and inline HTML never show up as text once rendered, so they're
// dropped from both sides (the placeholder's verbatim copy still carries them).
// Then letters and digits only: renderers disagree about punctuation (smart
// quotes, dashes, entities) and whitespace, and none of that is content.
const normalise = (s: string): string =>
  s
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

// ATX headings (`## Like this`) outside fenced code.
function headings(md: string): string[] {
  const found: string[] = [];
  let fenced = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^ {0,3}(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^ {0,3}#{1,6}\s+(.*?)(\s+#+)?\s*$/);
    if (heading) found.push(heading[1]);
  }
  return found;
}

it(
  "publishes README.md at /readme/",
  async () => {
    const expected = headings(readFileSync("README.md", "utf8"));
    // vitest took a message as expect()'s second argument; bun:test doesn't,
    // so the diagnostics these checks carried are thrown directly instead.
    if (expected.length === 0) {
      throw new Error("README.md has no headings to check /readme/ against");
    }

    const res = await fetch(new URL("/readme/", baseUrl));
    expect(res.status).toBe(200);
    const served = normalise(await text(await res.text()));

    let from = 0;
    for (const heading of expected) {
      const at = served.indexOf(normalise(heading), from);
      if (at === -1) {
        throw new Error(
          `/readme/ is missing the README heading "${heading}" (or has it out of order)`,
        );
      }
      from = at + normalise(heading).length;
    }
  },
  REQUEST_TIMEOUT_MS,
);
