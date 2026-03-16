/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const frameworkId = formData.get("framework_id")?.toString() || "default";

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    // Forward the file directly to the Python Backend Engine
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";
    const backendUrl = `${BACKEND_URL}/api/documents/upload?framework_id=${frameworkId}`;
    console.log("Forwarding to Python Backend:", backendUrl);
    
    // We increase timeout or await it here since it's synchronous
    const response = await fetch(backendUrl, {
      method: "POST",
      body: backendFormData,
      // @ts-ignore
      duplex: "half"
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("Backend Error:", json);
      return NextResponse.json({ error: json.detail || "Backend failed" }, { status: response.status });
    }

    // Since the python backend directly auto-populates the knowledge base
    // and compliance tracker, we just return the success message.
    return NextResponse.json({ 
      success: true, 
      message: json.message,
      data: json.data 
    });

  } catch (error: any) {
    console.error("PDF Parsing Proxy Error:", error);
    return NextResponse.json({ 
      error: "Failed to parse PDF document: " + (error.message || String(error)),
    }, { status: 500 });
  }
}
