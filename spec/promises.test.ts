import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { baseUrl } from "./global-setup";

// The promises README.md makes that a test can hold, checked against the
// RUNNING app (spec/global-setup.ts finds it). The rules they come from are in
// CLAUDE.md. Live likes between two signed-in browsers are judged by hand for
// now; see README.md, "Enforced and judged".

const REQUEST_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// The homepage, fetched once and shared by the checks that read it.

let homepageHtml: Promise<string> | null = null;
function homepage(): Promise<string> {
  homepageHtml ??= fetch(new URL("/", baseUrl)).then((res) => {
    if (!res.ok) throw new Error(`/ answered ${res.status}`);
    return res.text();
  });
  return homepageHtml;
}

// The map's markers arrive inside the server-rendered page as React Server
// Component data, with their quotes escaped. Unescape them, then pick out
// each marker object.
function markerPayload(html: string): string {
  return html.replaceAll('\\"', '"');
}

// ---------------------------------------------------------------------------
// The survey, read straight from the CSV the database was built from.

const SURVEY_CSV = "tree-databases/ANU tree database 2024.csv";

// A small CSV reader: the survey's comments hold commas and quotes, so fields
// can be quoted, with "" for a literal quote.
function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// The ids of the survey trees the map should show: every row with a trunk
// measurement (DBH). The 17 rows without one aren't in the database yet, and
// README.md says so.
function surveyTreeIds(): Set<number> {
  const [header, ...rows] = parseCsv(
    readFileSync(SURVEY_CSV, "utf8").replace(/^﻿/, ""),
  );
  const idColumn = header.indexOf("Tree ID");
  const dbhColumn = header.indexOf("DBH");
  const ids = new Set<number>();
  for (const row of rows) {
    if (row.length < header.length || !row[dbhColumn]?.trim()) continue;
    ids.add(Math.trunc(Number(row[idColumn])));
  }
  return ids;
}

// ---------------------------------------------------------------------------

describe("the data comes first", () => {
  it(
    "shows every survey tree with a trunk measurement on the map, and no others",
    async () => {
      const expected = surveyTreeIds();
      // Sanity check that the CSV was read, not just parsed into nothing.
      expect(expected.size).toBeGreaterThan(9000);

      const shown = new Set(
        [
          ...markerPayload(await homepage()).matchAll(
            /\{"id":(\d+),"latitude":/g,
          ),
        ].map((match) => Number(match[1])),
      );

      const missing = [...expected].filter((id) => !shown.has(id));
      const extra = [...shown].filter((id) => !expected.has(id));
      expect({
        missing: missing.slice(0, 20),
        extra: extra.slice(0, 20),
      }).toEqual({
        missing: [],
        extra: [],
      });
      expect(shown.size).toBe(expected.size);
    },
    REQUEST_TIMEOUT_MS,
  );
});

describe("it works on a phone on campus", () => {
  // The first multi-user version sent every tree's full record and the page
  // reached 4.3 MB, which ran the 256 MB server out of memory. Slimmed, it's
  // about 1 MB. The budget leaves room to grow, not to slide back.
  const HOMEPAGE_BUDGET_BYTES = 1.5 * 1024 * 1024;

  it(
    "keeps the homepage under 1.5 MB",
    async () => {
      const bytes = new TextEncoder().encode(await homepage()).byteLength;
      expect(bytes).toBeLessThan(HOMEPAGE_BUDGET_BYTES);
    },
    REQUEST_TIMEOUT_MS,
  );

  it(
    "sends the map only what it needs to draw each dot",
    async () => {
      const payload = markerPayload(await homepage());
      const markers = payload.match(/\{"id":\d+,"latitude":/g) ?? [];
      // Exactly these four fields, in this order, for every marker. A popup
      // loads the rest of a tree when it's opened.
      const slim =
        payload.match(
          /\{"id":\d+,"latitude":-?[\d.e-]+,"longitude":-?[\d.e-]+,"classification":"[^"]*"\}/g,
        ) ?? [];
      expect(markers.length).toBeGreaterThan(0);
      expect(slim.length).toBe(markers.length);
    },
    REQUEST_TIMEOUT_MS,
  );

  it(
    "sets a viewport for phones",
    async () => {
      expect(await homepage()).toMatch(
        /<meta name="viewport" content="width=device-width, initial-scale=1"/,
      );
    },
    REQUEST_TIMEOUT_MS,
  );
});

describe("accounts cost as little as possible", () => {
  const post = (path: string, body: object): Promise<Response> =>
    fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: new URL(baseUrl).origin,
      },
      body: JSON.stringify(body),
    });

  it(
    "refuses email sign-up",
    async () => {
      const res = await post("/api/auth/sign-up/email", {
        email: "someone@example.com",
        password: "a-long-enough-password",
        name: "someone",
      });
      expect(res.ok).toBe(false);
      expect((await res.json()).code).toBe("EMAIL_PASSWORD_SIGN_UP_DISABLED");
    },
    REQUEST_TIMEOUT_MS,
  );

  it(
    "refuses password sign-in",
    async () => {
      const res = await post("/api/auth/sign-in/email", {
        email: "someone@example.com",
        password: "a-long-enough-password",
      });
      expect(res.ok).toBe(false);
      expect((await res.json()).code).toBe("EMAIL_PASSWORD_DISABLED");
    },
    REQUEST_TIMEOUT_MS,
  );

  it(
    "has no magic link sign-in",
    async () => {
      const res = await post("/api/auth/sign-in/magic-link", {
        email: "someone@example.com",
      });
      expect(res.status).toBe(404);
    },
    REQUEST_TIMEOUT_MS,
  );
});

describe("likes are live for everyone", () => {
  it(
    "streams the like counts of several trees at once",
    async () => {
      const controller = new AbortController();
      const res = await fetch(
        new URL("/api/trees/likes/stream?ids=245,249", baseUrl),
        { signal: controller.signal },
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      // Read until both trees' current counts have arrived, then hang up.
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while ((text.match(/^data: .*$/gm) ?? []).length < 2) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
      controller.abort();

      const events = (text.match(/^data: .*$/gm) ?? []).map(
        (line) =>
          JSON.parse(line.slice("data: ".length)) as {
            treeId: number;
            likes: number;
          },
      );
      expect(events.map((event) => event.treeId).sort()).toEqual([245, 249]);
      for (const event of events) {
        expect(Number.isInteger(event.likes)).toBe(true);
        expect(event.likes).toBeGreaterThanOrEqual(0);
      }
    },
    REQUEST_TIMEOUT_MS,
  );

  it(
    "rejects a multi-tree like stream with no valid tree ids",
    async () => {
      for (const query of ["", "?ids=", "?ids=abc,-1,0"]) {
        const res = await fetch(
          new URL(`/api/trees/likes/stream${query}`, baseUrl),
        );
        expect(res.status).toBe(400);
      }
    },
    REQUEST_TIMEOUT_MS,
  );
});

describe("the argument is published", () => {
  // The brief asks for 400-600 words on what good means here. The setup and
  // deploy instructions under "Running it yourself" are reference, not
  // argument, so the count stops there.
  it("keeps the README's argument between 400 and 600 words", () => {
    const readme = readFileSync("README.md", "utf8");
    const instructions = readme.search(/^## Running it yourself/m);
    const argument =
      instructions === -1 ? readme : readme.slice(0, instructions);
    const words = argument.split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(400);
    expect(words.length).toBeLessThanOrEqual(600);
  });

  it("publishes the same README at /readme/ that's in the repo root", () => {
    // /readme/ renders anu-tree-database/public/README.md, so the two copies
    // must match or the site publishes a stale argument.
    const normalise = (s: string): string => s.replace(/\r\n/g, "\n").trim();
    expect(
      normalise(readFileSync("anu-tree-database/public/README.md", "utf8")),
    ).toBe(normalise(readFileSync("README.md", "utf8")));
  });
});
