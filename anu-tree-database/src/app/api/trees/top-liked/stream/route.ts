import {
  getTopLikedTrees,
  subscribeToTopLikedTrees,
} from "@/lib/top-liked-trees";

const KEEP_ALIVE_MS = 25_000;

// The platform's most liked trees as Server-Sent Events, for the box that
// signed-out visitors see. Each message is `{ trees: [...] }`, the whole list:
// sent once on connect and again whenever a like changes it.
export async function GET(request: Request): Promise<Response> {
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
      const sendTrees = (trees: unknown): void =>
        send(`data: ${JSON.stringify({ trees })}\n\n`);

      // Subscribe before the first read, so a like in between isn't missed.
      const unsubscribe = subscribeToTopLikedTrees(sendTrees);
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

      send("retry: 3000\n\n");
      sendTrees(await getTopLikedTrees());
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
