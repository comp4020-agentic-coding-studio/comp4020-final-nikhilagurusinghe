import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { treeLikesTable } from "@/db/schema";
import { subscribeToTreeLikes } from "@/lib/like-events";

const db = drizzle(process.env.DB_FILE_NAME!);

// Fly's proxy drops connections that go quiet, so send an SSE comment line
// this often to keep an idle stream open.
const KEEP_ALIVE_MS = 25_000;

// A live like count for one tree, as Server-Sent Events. The browser's
// EventSource opens this while the tree's popup is open: it gets the current
// count straight away, then every change as it happens, and reconnects by
// itself if the connection drops.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const treeId = Number((await params).id);
  if (!Number.isInteger(treeId) || treeId < 1) {
    return new Response("Not a valid tree id.", { status: 400 });
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
      const sendLikes = (likes: number): void =>
        send(`data: ${JSON.stringify({ likes })}\n\n`);

      // Subscribe before reading the current count, so a like that lands in
      // between still reaches this browser.
      const unsubscribe = subscribeToTreeLikes(treeId, sendLikes);
      const keepAlive = setInterval(
        () => send(": keep-alive\n\n"),
        KEEP_ALIVE_MS,
      );

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };
      request.signal.addEventListener("abort", cleanup);

      // Ask the browser to wait 3s before reconnecting after a drop.
      send("retry: 3000\n\n");

      const [row] = await db
        .select({ likes: treeLikesTable.likes })
        .from(treeLikesTable)
        .where(eq(treeLikesTable.treeId, treeId));
      sendLikes(row?.likes ?? 0);
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
      // Tells proxies not to buffer the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
