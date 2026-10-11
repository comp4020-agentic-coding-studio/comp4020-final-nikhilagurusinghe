// The spec checks a RUNNING app over HTTP, so it holds whatever the app is
// built with. CI builds the Dockerfile, starts the image and points APP_URL
// at it, so what passes there is what deploys. Locally, start your app however
// you run it, then `bun run check`; APP_URL says where it's listening. It waits
// up to a minute, since some stacks take a while to boot or migrate.
//
// Under vitest this was a globalSetup that handed the URL to tests through
// project.provide("baseUrl"). bun:test has no inject(), so the wait happens
// once at module load and tests import `baseUrl` directly: ES modules evaluate
// exactly once per run, and the top-level await below settles before any
// importing test file starts, which gives the same once-per-run guarantee.

const DEFAULT_URL = "http://localhost:8080";
const MAX_ATTEMPTS = 300;
const INTERVAL_MS = 200;

async function waitForApp(): Promise<string> {
  const url = process.env.APP_URL ?? DEFAULT_URL;

  for (let attempt = 0; ; attempt++) {
    try {
      await fetch(url);
      return url;
    } catch {
      // not up yet
    }
    if (attempt >= MAX_ATTEMPTS) {
      throw new Error(
        `nothing is answering at ${url}: start your app first, or set APP_URL to where it's listening`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

export const baseUrl: string = await waitForApp();
