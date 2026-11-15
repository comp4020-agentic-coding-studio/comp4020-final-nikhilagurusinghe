import { expect, it } from "bun:test";
import { baseUrl } from "./global-setup";

// Passkey accounts (Better Auth). These check the server half over HTTP; the
// passkey ceremony itself needs a browser and an authenticator, so it isn't
// exercised here.

const REQUEST_TIMEOUT_MS = 30_000;

it(
  "serves the auth API",
  async () => {
    const res = await fetch(new URL("/api/auth/ok", baseUrl));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  },
  REQUEST_TIMEOUT_MS,
);

it(
  "has no session for a signed-out visitor",
  async () => {
    const res = await fetch(new URL("/api/auth/get-session", baseUrl));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  },
  REQUEST_TIMEOUT_MS,
);

it(
  "refuses passkey registration without a valid sign-up token",
  async () => {
    // No session and no signed token: there is no one to register a passkey
    // for, so this must fail rather than hand out registration options.
    const res = await fetch(
      new URL(
        "/api/auth/passkey/generate-register-options?context=forged",
        baseUrl,
      ),
    );
    expect(res.status).toBe(400);
  },
  REQUEST_TIMEOUT_MS,
);

it(
  "shows the account menu on the map page",
  async () => {
    const res = await fetch(new URL("/", baseUrl));
    const html = await res.text();
    expect(html).toContain("account");
    expect(html).toContain("sign in");
  },
  REQUEST_TIMEOUT_MS,
);

it(
  "streams a tree's live like count as server-sent events",
  async () => {
    const controller = new AbortController();
    const res = await fetch(new URL("/api/trees/1/likes/stream", baseUrl), {
      signal: controller.signal,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    // Read until the first data event (the current count), then hang up.
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (!text.includes("data: ")) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    controller.abort();

    const data = text.split("\n").find((line) => line.startsWith("data: "));
    expect(data).toBeDefined();
    const { likes } = JSON.parse(data!.slice("data: ".length));
    expect(Number.isInteger(likes)).toBe(true);
    expect(likes).toBeGreaterThanOrEqual(0);
  },
  REQUEST_TIMEOUT_MS,
);

it(
  "rejects a like stream for a tree id that isn't a number",
  async () => {
    const res = await fetch(
      new URL("/api/trees/not-a-tree/likes/stream", baseUrl),
    );
    expect(res.status).toBe(400);
  },
  REQUEST_TIMEOUT_MS,
);
