/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const BACKEND_URL = process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? "http://backend-engine.railway.internal:8080" : "http://127.0.0.1:8001");

export async function GET(req: NextRequest) {
  const docId = req.nextUrl.searchParams.get("id");
  if (!docId) {
    return new Response(JSON.stringify({ error: "Missing document id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(
      `${BACKEND_URL}/api/documents/${docId}/analyze/stream`,
      {
        method: "GET",
        headers: { Accept: "text/event-stream" },
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream the SSE response through
    return new Response(upstream.body as any, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    logger.error("SSE proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Stream failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
