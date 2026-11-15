import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { treeLikesTable } from "@/db/schema";
import { subscribeToTreeLikes } from "@/lib/like-events";

const db = drizzle(process.env.DB_FILE_NAME!);

const KEEP_ALIVE_MS = 25_000;
// Plenty for one person's liked trees, and keeps a single request bounded.
const MAX_TREES = 200;

// Live like counts for several trees over one Server-Sent Events connection,
// for the liked trees box: `?ids=1,2,3`. Each message is `{ treeId, likes }`.
// One connection for all the cards rather than one per card, so a user with
// lots of liked trees doesn't open lots of connections.
export async function GET(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const treeIds = [
    ...new Set(
      raw
        .split(",")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ].slice(0, MAX_TREES);
  if (treeIds.length === 0) {
    return new Response("Give at least one tree id in ?ids=.", { status: 400 });
  }

  const encoder = new TextEncoder();
  let cleanup = (): void => {};

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (chunk: string): void => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const sendLikes = (treeId: number, likes: number): void =>
        send(`data: ${JSON.stringify({ treeId, likes })}\n\n`);

      // Subscribe before reading the current counts, so nothing is missed.
      const unsubscribes = treeIds.map((treeId) =>
        subscribeToTreeLikes(treeId, (likes) => sendLikes(treeId, likes)),
      );
      const keepAlive = setInterval(
        () => send(": keep-alive\n\n"),
        KEEP_ALIVE_MS,
      );

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        for (const unsubscribe of unsubscribes) unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      request.signal.addEventListener("abort", cleanup);

      send("retry: 3000\n\n");

      const rows = await db
        .select({ treeId: treeLikesTable.treeId, likes: treeLikesTable.likes })
        .from(treeLikesTable)
        .where(inArray(treeLikesTable.treeId, treeIds));
      const counts = new Map(rows.map((row) => [row.treeId, row.likes]));
      for (const treeId of treeIds) sendLikes(treeId, counts.get(treeId) ?? 0);
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
