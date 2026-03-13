import { NextRequest, NextResponse } from "next/server";

// Enhanced heuristic parser for Indian Legal Statutes
const extractLegalStructure = (text: string) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const extracted = {
    metadata: {
      title: "",
      year: "",
    },
    chapters: [] as any[],
    sections: [] as any[],
    penalties: [] as string[],
    repealedActs: [] as string[],
  };

  let currentChapter = "";
  let currentChapterName = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Detect Repealed Acts (Usually near the end of the text "Repeals and Savings")
    if ((line.toLowerCase().includes("repeal") && line.toLowerCase().includes("savings")) || line.toLowerCase().startsWith("the following acts are hereby repealed")) {
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].toLowerCase().includes("act, 19") || lines[j].toLowerCase().includes("act, 20")) {
           extracted.repealedActs.push(lines[j]);
        }
      }
    }

    // 2. Detect Penalties (Keywords: "punishable with", "fine which may extend to")
    if (line.toLowerCase().includes("punishable with") || line.toLowerCase().includes("fine which may extend to") || line.toLowerCase().includes("imprisonment for a term")) {
      extracted.penalties.push(line);
    }

    // 3. Detect Chapters (e.g., "CHAPTER IV", "CHAPTER 4")
    const chapterMatch = line.match(/^CHAPTER\s+([A-Z0-9]+)/i);
    if (chapterMatch) {
      currentChapter = chapterMatch[1];
      currentChapterName = lines[i + 1] || ""; // Usually the very next line is the Chapter Title
      
      extracted.chapters.push({
        num: currentChapter,
        title: currentChapterName
      });
      continue;
    }

    // 4. Detect Sections (e.g., "42.", "42. (1)", "Section 42")
    // Looking for a number at the start of a line followed by a period or space, and then text.
    const sectionMatch = line.match(/^(\d+[A-Z]?)\.\s*(.*)/);
    if (sectionMatch) {
      const secNum = sectionMatch[1];
      const secTitle = sectionMatch[2]; // Might be the title or the start of the text

      // Aggregate full text until next section or chapter
      let fullText = "";
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^(\d+[A-Z]?)\.\s+/) && !lines[j].match(/^CHAPTER\s+/i)) {
        fullText += lines[j] + "\n";
        j++;
      }

      extracted.sections.push({
        ch: currentChapter,
        chName: currentChapterName,
        sec: secNum,
        title: secTitle.length > 50 ? secTitle.substring(0, 50) + "..." : secTitle, // Heuristic title
        text: secTitle + "\n" + fullText.trim(),
      });
    }
  }

  // Deduplicate repealed acts and penalties
  extracted.repealedActs = [...new Set(extracted.repealedActs)];
  extracted.penalties = [...new Set(extracted.penalties)];

  return extracted;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Safely require pdf-parse-fork dynamically to avoid Next.js edge runtime issues parsing CommonJS modules
    let pdfParseFn;
    try {
      pdfParseFn = require("pdf-parse-fork");
      // Handle potential default export unwrapping
      if (pdfParseFn && pdfParseFn.default) {
        pdfParseFn = pdfParseFn.default;
      }
    } catch (reqErr: any) {
      console.error("Failed to require pdf-parse-fork:", reqErr);
      return NextResponse.json({ error: "Failed to load PDF parsing library: " + reqErr.message }, { status: 500 });
    }

    // Parse PDF text using pdf-parse
    const pdfData = await pdfParseFn(buffer);
    const rawText = pdfData.text;

    // Run custom Legal Heuristics to structure the flat text
    const structuredData = extractLegalStructure(rawText);

    return NextResponse.json({ 
      success: true, 
      pages: pdfData.numpages,
      data: structuredData 
    });

  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ 
      error: "Failed to parse PDF document: " + (error.message || String(error)),
      stack: error.stack
    }, { status: 500 });
  }
}
