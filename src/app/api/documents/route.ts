/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = req.nextUrl.searchParams.get("action") || "upload";

    if (action === "upload") {
      const res = await fetch(`${BACKEND_URL}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Document API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const action = req.nextUrl.searchParams.get("action");

    if (id && action === "analyze") {
      const res = await fetch(`${BACKEND_URL}/api/documents/${id}/analyze`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }

    if (id) {
      const res = await fetch(`${BACKEND_URL}/api/documents/${id}`);
      const data = await res.json();
      if (!res.ok) return NextResponse.json(data, { status: res.status });
      return NextResponse.json(data);
    }

    // List all documents
    const res = await fetch(`${BACKEND_URL}/api/documents`);
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Document API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const suggestionId = req.nextUrl.searchParams.get("suggestionId");
    const action = req.nextUrl.searchParams.get("action"); // approve | reject
    const frameworkId = req.nextUrl.searchParams.get("frameworkId") || "";

    if (!suggestionId || !action) {
      return NextResponse.json({ error: "Missing suggestionId or action" }, { status: 400 });
    }

    const url = action === "approve"
      ? `${BACKEND_URL}/api/suggestions/${suggestionId}/approve?framework_id=${frameworkId}`
      : `${BACKEND_URL}/api/suggestions/${suggestionId}/reject`;

    const res = await fetch(url, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Suggestion API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
