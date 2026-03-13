import { NextRequest, NextResponse } from "next/server";

// ===================================================================
// MULTI-PASS LEGAL DOCUMENT PARSER v2
// Fixes: deduplication, Act/Rule detection, line-breaks, rule linkage,
// sub-section parsing
// ===================================================================

interface ParsedSubSection {
  marker: string;
  text: string;
}

interface ParsedSection {
  ch: string;
  chName: string;
  sec: string;
  title: string;
  text: string;
  type: 'section' | 'rule';
  parentSection?: string;
  subSections: ParsedSubSection[];
}

interface ParsedData {
  metadata: { title: string; year: string; documentType: 'act' | 'rules' | 'unknown' };
  chapters: { num: string; title: string }[];
  sections: ParsedSection[];
  penalties: string[];
  repealedActs: string[];
  stats: { duplicatesRemoved: number; totalRawMatches: number };
}

// ---- PASS 0: Detect document type ----
function detectDocumentType(text: string): 'act' | 'rules' | 'unknown' {
  const upper = text.substring(0, 3000).toUpperCase();
  // Rules documents typically say "RULES" in the title, e.g. "THE CODE ON WAGES (CENTRAL) RULES, 2020"
  if (upper.match(/\bRULES?\b.*\b(19|20)\d{2}/)) return 'rules';
  // Acts/Codes say "ACT" or "CODE" in their title
  if (upper.match(/\b(ACT|CODE)\b.*\b(19|20)\d{2}/)) return 'act';
  return 'unknown';
}

// ---- PASS 1: Identify TOC/Index region and mark for exclusion ----
function findIndexBoundary(lines: string[]): number {
  // The index section ends when we encounter the first real "CHAPTER" header in the body
  // Common patterns: "ARRANGEMENT OF SECTIONS", "TABLE OF CONTENTS", "CONTENTS"
  let inIndex = false;
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase().trim();

    // Detect start of index
    if (!inIndex && (
      line.includes('ARRANGEMENT OF SECTIONS') ||
      line.includes('ARRANGEMENT OF CLAUSES') ||
      line.includes('TABLE OF CONTENTS') ||
      line === 'CONTENTS'
    )) {
      inIndex = true;
      continue;
    }

    // Once in index, detect end of index when we hit actual body 
    // (first CHAPTER header with body text following)
    if (inIndex && line.match(/^CHAPTER\s+[IVXLCDM0-9]+/i)) {
      // Check if next few lines contain actual section text (not just titles)
      const nextLines = lines.slice(i + 1, i + 5).join(' ');
      if (nextLines.length > 100) {
        // This looks like the body starts here
        bodyStart = i;
        break;
      }
    }
  }

  return bodyStart;
}

// ---- PASS 2: Extract chapters ----
function extractChapters(lines: string[], startFrom: number): { num: string; title: string; lineIdx: number }[] {
  const chapters: { num: string; title: string; lineIdx: number }[] = [];
  
  for (let i = startFrom; i < lines.length; i++) {
    const line = lines[i].trim();
    const chapterMatch = line.match(/^CHAPTER\s+([A-Z0-9IVXLCDM]+)\s*$/i);
    if (chapterMatch) {
      // Next non-empty line is usually the chapter title
      let title = "";
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        if (lines[j].trim().length > 0 && !lines[j].trim().match(/^\d+\./)) {
          title = lines[j].trim();
          break;
        }
      }
      chapters.push({ num: chapterMatch[1], title, lineIdx: i });
    }
  }

  return chapters;
}

// ---- PASS 3: Extract sections/rules with smart text aggregation ----
function extractSections(
  lines: string[],
  startFrom: number,
  chapters: { num: string; title: string; lineIdx: number }[],
  docType: 'act' | 'rules' | 'unknown'
): { sections: ParsedSection[]; duplicatesRemoved: number; totalRawMatches: number } {
  
  const isRulesDoc = docType === 'rules';
  
  // Pattern for sections: "42. Title text" or "42A. Title text"
  // Pattern for rules: "3. Short title" or "Rule 3."
  const sectionRegex = isRulesDoc
    ? /^(?:Rule\s+)?(\d+[A-Z]?)\.[\s-]*(.*)$/i
    : /^(\d+[A-Z]?)\.[\s-]*(.*)$/;
  
  const rawSections: ParsedSection[] = [];
  let currentChapter = "";
  let currentChapterName = "";
  let chapterIdx = 0;

  for (let i = startFrom; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Update current chapter context
    if (chapterIdx < chapters.length && i >= chapters[chapterIdx].lineIdx) {
      currentChapter = chapters[chapterIdx].num;
      currentChapterName = chapters[chapterIdx].title;
      chapterIdx++;
      if (chapterIdx < chapters.length) {
        // Skip to next chapter check
      }
    }

    const match = line.match(sectionRegex);
    if (match) {
      const secNum = match[1];
      const restOfLine = match[2] || "";

      // Smart title extraction: title is the text before the em-dash or period-separated body
      let title = restOfLine;
      let bodyStart = restOfLine;
      
      // Common pattern: "42. Short title and commencement.—(1) This Act..."
      const emDashIdx = restOfLine.indexOf('—');
      const dashIdx = restOfLine.indexOf('.—');
      if (emDashIdx > 0 && emDashIdx < 120) {
        title = restOfLine.substring(0, emDashIdx).trim();
        bodyStart = restOfLine.substring(emDashIdx + 1).trim();
      } else if (dashIdx > 0 && dashIdx < 120) {
        title = restOfLine.substring(0, dashIdx).trim();
        bodyStart = restOfLine.substring(dashIdx + 2).trim();
      } else if (title.length > 120) {
        // No clear title boundary — just truncate
        title = restOfLine.substring(0, 80) + "...";
      }

      // Detect "See section X" for rules
      let parentSection: string | undefined;
      if (isRulesDoc) {
        const seeMatch = restOfLine.match(/\(?\s*[Ss]ee\s+[Ss]ections?\s+(\d+[A-Z]?(?:\s*(?:and|,|&)\s*\d+[A-Z]?)*)\s*\)?/);
        if (seeMatch) {
          parentSection = seeMatch[1].trim();
        }
      }

      // SMART TEXT AGGREGATION (fixes Bug #3)
      // Join lines with spaces, but preserve paragraph breaks and sub-section markers
      const textParts: string[] = [bodyStart];
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        
        // Stop at next section/chapter
        if (nextLine.match(sectionRegex) || nextLine.match(/^CHAPTER\s+[A-Z0-9IVXLCDM]+$/i)) {
          break;
        }
        
        if (!nextLine) {
          // Empty line = paragraph break
          textParts.push('\n');
        } else if (nextLine.match(/^\([\divxlcdma-z]+\)/i) || nextLine.match(/^Proviso/i) || nextLine.match(/^Explanation/i)) {
          // Sub-section marker — start on new line
          textParts.push('\n' + nextLine);
        } else {
          // Continuation — join with space (fixes double line-break bug)
          textParts.push(' ' + nextLine);
        }
        j++;
      }

      const fullText = textParts.join('').trim();

      rawSections.push({
        ch: currentChapter,
        chName: currentChapterName,
        sec: secNum,
        title: title.replace(/\.$/, '').trim(),
        text: fullText,
        type: isRulesDoc ? 'rule' : 'section',
        parentSection,
        subSections: [], // Filled in Pass 4
      });
    }
  }

  // DEDUPLICATION (fixes Bug #1)
  // If the same section number appears multiple times, keep the one with longer text
  const totalRawMatches = rawSections.length;
  const sectionMap = new Map<string, ParsedSection>();
  
  for (const sec of rawSections) {
    const key = `${sec.ch}-${sec.sec}`;
    const existing = sectionMap.get(key);
    if (!existing || sec.text.length > existing.text.length) {
      sectionMap.set(key, sec);
    }
  }

  const deduped = Array.from(sectionMap.values());
  const duplicatesRemoved = totalRawMatches - deduped.length;

  return { sections: deduped, duplicatesRemoved, totalRawMatches };
}

// ---- PASS 4: Extract sub-sections from each section's text ----
function extractSubSections(text: string): ParsedSubSection[] {
  const subSections: ParsedSubSection[] = [];

  // Pattern: (1), (2)(a), (a), (i), (ii), Proviso, Explanation
  const subSecRegex = /(?:^|\n)\s*(\([0-9ivxlcdma-z]+\)(?:\([a-z]+\))?|Proviso[:\s—]|Explanation[:\s—])\s*/gi;
  
  let lastMatch: { marker: string; index: number } | null = null;
  let match: RegExpExecArray | null;

  while ((match = subSecRegex.exec(text)) !== null) {
    if (lastMatch) {
      // Close previous sub-section
      const subText = text.substring(lastMatch.index + lastMatch.marker.length, match.index).trim();
      if (subText.length > 5) {
        subSections.push({ marker: lastMatch.marker.trim(), text: subText });
      }
    }
    lastMatch = { marker: match[1], index: match.index };
  }

  // Close final sub-section
  if (lastMatch) {
    const subText = text.substring(lastMatch.index + lastMatch.marker.length).trim();
    if (subText.length > 5) {
      subSections.push({ marker: lastMatch.marker.trim(), text: subText });
    }
  }

  return subSections;
}

// ---- PASS 5: Extract penalties and repealed acts ----
function extractPenaltiesAndRepeals(lines: string[], startFrom: number) {
  const penalties: string[] = [];
  const repealedActs: string[] = [];

  for (let i = startFrom; i < lines.length; i++) {
    const line = lines[i].trim();

    // Penalties
    if (line.toLowerCase().includes("punishable with") || 
        line.toLowerCase().includes("fine which may extend to") || 
        line.toLowerCase().includes("imprisonment for a term")) {
      penalties.push(line);
    }

    // Repealed Acts
    if ((line.toLowerCase().includes("repeal") && line.toLowerCase().includes("savings")) ||
        line.toLowerCase().startsWith("the following acts are hereby repealed")) {
      for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
        if (lines[j].toLowerCase().includes("act, 19") || lines[j].toLowerCase().includes("act, 20")) {
          repealedActs.push(lines[j].trim());
        }
      }
    }
  }

  return {
    penalties: [...new Set(penalties)],
    repealedActs: [...new Set(repealedActs)],
  };
}

// ---- MAIN: Multi-pass pipeline ----
const extractLegalStructure = (text: string): ParsedData => {
  const lines = text.split('\n').map(l => l.trim());
  
  // Pass 0: Detect document type
  const documentType = detectDocumentType(text);

  // Pass 1: Find where the index/TOC ends
  const bodyStart = findIndexBoundary(lines);

  // Pass 2: Extract chapters (from body start)
  const chapters = extractChapters(lines, bodyStart);

  // Pass 3: Extract sections with deduplication + smart text joining
  const { sections, duplicatesRemoved, totalRawMatches } = extractSections(
    lines, bodyStart, chapters, documentType
  );

  // Pass 4: Extract sub-sections for each section
  for (const sec of sections) {
    sec.subSections = extractSubSections(sec.text);
  }

  // Pass 5: Penalties and repeals
  const { penalties, repealedActs } = extractPenaltiesAndRepeals(lines, bodyStart);

  // Metadata extraction
  let title = "";
  let year = "";
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const titleMatch = lines[i].match(/THE\s+(.+?(?:ACT|CODE|RULES)),?\s*((?:19|20)\d{2})/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      year = titleMatch[2];
      break;
    }
  }

  return {
    metadata: { title, year, documentType },
    chapters: chapters.map(c => ({ num: c.num, title: c.title })),
    sections,
    penalties,
    repealedActs,
    stats: { duplicatesRemoved, totalRawMatches },
  };
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

    // Safely require pdf-parse-fork dynamically
    let pdfParseFn;
    try {
      pdfParseFn = require("pdf-parse-fork");
      if (pdfParseFn && pdfParseFn.default) {
        pdfParseFn = pdfParseFn.default;
      }
    } catch (reqErr: any) {
      console.error("Failed to require pdf-parse-fork:", reqErr);
      return NextResponse.json({ error: "Failed to load PDF parsing library: " + reqErr.message }, { status: 500 });
    }

    // Parse PDF text
    const pdfData = await pdfParseFn(buffer);
    const rawText = pdfData.text;

    // Run multi-pass legal heuristics
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
