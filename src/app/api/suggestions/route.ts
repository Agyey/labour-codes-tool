import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action"); // "approve" or "reject"
    const frameworkId = searchParams.get("frameworkId") || "";

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action (approve/reject)" }, { status: 400 });
    }

    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";
    let url = `${BACKEND_URL}/api/suggestions/${id}/${action}`;
    
    if (action === "approve" && frameworkId) {
       url += `?framework_id=${frameworkId}`;
    }

    console.log(`Patching suggestion: ${url}`);
    
    const backendRes = await fetch(url, {
      method: "PATCH",
    });

    const json = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ error: json.detail || "Failed to update suggestion" }, { status: backendRes.status });
    }

    return NextResponse.json({ success: true, ...json });
  } catch (error) {
    console.error("Suggestion Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
