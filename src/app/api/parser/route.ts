/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const frameworkId = formData.get("framework_id")?.toString() || "default";

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";

    // 1. Upload the file to the Backend Engine
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const uploadUrl = `${BACKEND_URL}/api/documents/upload?framework_id=${frameworkId}`;
    console.log("Forwarding to Python Backend for Upload:", uploadUrl);
    
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: backendFormData,
      // @ts-ignore
      duplex: "half"
    });

    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
      return NextResponse.json({ error: uploadJson.detail || "Backend upload failed" }, { status: uploadRes.status });
    }

    const documentId = uploadJson.id;

    // 2. Trigger Document Analysis
    console.log(`Triggering analysis for document ${documentId}...`);
    const analyzeUrl = `${BACKEND_URL}/api/documents/${documentId}/analyze`;
    const analyzeRes = await fetch(analyzeUrl, { method: "POST" });
    const analyzeJson = await analyzeRes.json();

    if (!analyzeRes.ok) {
        return NextResponse.json({ error: analyzeJson.detail || "Analysis failed" }, { status: analyzeRes.status });
    }

    // Return immediately to allow UI to poll
    return NextResponse.json({ 
      success: true, 
      message: "Analysis started in background!",
      documentId: documentId,
      status: "analyzing"
    });

  } catch (error: any) {
    console.error("PDF Parsing Proxy Error:", error);
    return NextResponse.json({ 
      error: "Failed to parse PDF document: " + (error.message || String(error)),
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "No document ID provided" }, { status: 400 });

    const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8001";
    const docUrl = `${BACKEND_URL}/api/documents/${id}`;
    const docRes = await fetch(docUrl);
    const docJson = await docRes.json();

    if (!docRes.ok) {
        return NextResponse.json({ error: "Failed to fetch document status" }, { status: docRes.status });
    }

    return NextResponse.json(docJson);
  } catch (error: any) {
    return NextResponse.json({ error: "Polling Error: " + error.message }, { status: 500 });
  }
}

