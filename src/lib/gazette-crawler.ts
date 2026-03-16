/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @name GazetteCrawlerPrototype
 * @description Logic for parsing the e-Gazette (egazette.gov.in) result table.
 * This prototype demonstrates how we extract row data and prepare it for the LLM.
 */

interface GazetteEntry {
  id: string; // Gazette ID
  subject: string;
  publishDate: string;
  partSection: string;
  downloadUrl: string;
}

export async function parseGazetteTable(htmlSnapshot: string): Promise<GazetteEntry[]> {
  // In a real environment, this would use a library like 'cheerio' 
  // to parse the HTML returned from egazette.gov.in.
  
  // Mocking the extraction from the screenshot verified earlier:
  const mockRows = [
    {
      id: "CG-DL-E-01022025-260689",
      subject: "Appointment of part time member in the insolvency and bankruptcy board of India",
      publishDate: "2025-02-01",
      partSection: "Part I-Section 2",
      downloadUrl: "https://egazette.gov.in/WriteReadData/2025/260689.pdf"
    },
    {
      id: "CG-DL-E-08012025-260012",
      subject: "Appointment of Judicial and Technical Member in NCLT",
      publishDate: "2025-01-08",
      partSection: "Part II-Section 3-Sub-Section (ii)",
      downloadUrl: "https://egazette.gov.in/WriteReadData/2025/260012.pdf"
    }
  ];

  console.log(`[CRAWLER] Extracted ${mockRows.length} entries from e-Gazette.`);
  return mockRows;
}

/**
 * Maps a Gazette Entry to our internal RawScrapeData model.
 */
export function mapToRawScrapeData(entry: GazetteEntry) {
  return {
    source: "e-Gazette India",
    sourceUrl: entry.downloadUrl,
    rawContent: entry.subject,
    metadata: {
      gazetteId: entry.id,
      publishDate: entry.publishDate,
      partSection: entry.partSection,
      ministry: "Corporate Affairs"
    }
  };
}
