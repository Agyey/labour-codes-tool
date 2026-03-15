import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING KNOWLEDGE BASE ---');

  // 1. Companies (Accounts) Second Amendment Rules, 2025
  const scrape1 = await prisma.rawScrapeData.create({
    data: {
      source_name: "The Gazette of India",
      source_url: "https://egazette.gov.in/WriteReadData/2025/260789.pdf",
      raw_html: "<html>...</html>",
      raw_text: "Companies (Accounts) Second Amendment Rules, 2025 - Amendment to Board's Report requirements regarding sexual harassment and maternity benefit compliance. Gazette ID: CG-DL-E-30052025-260789.",
    }
  });

  await prisma.draftScenario.create({
    data: {
      name: "Update Annual Board Report (Compliance Affirmations)",
      description: "Mandatory update to the Board's Report to include disclosures on POSH complaints and Maternity Benefit Act compliance as per 2025 Rules.",
      category: "Secretarial Compliance",
      trigger_event: "Annual Report Preparation",
      status: "Pending Review",
      raw_scrape_id: scrape1.id,
      tasks: {
        create: [
          { name: "Draft POSH Compliance Affirmation", description: "Include details of cases filed/disposed as per the new reporting format.", stage: "Drafting", priority: "High", due_logic: "Before board approval of FS" },
          { name: "Maternity Benefit Act Audit", description: "Verify compliance with the Act to provide the mandatory affirmation.", stage: "Review", priority: "Medium", due_logic: "Annual" }
        ]
      }
    }
  });

  // 2. Private Company Dematerialization Extension
  const scrape2 = await prisma.rawScrapeData.create({
    data: {
      source_name: "Ministry of Corporate Affairs",
      source_url: "https://mca.gov.in/bin/dms/getdocument?mds=V3...",
      raw_html: "<html>...</html>",
      raw_text: "Notification regarding extension of timeline for mandatory dematerialization of securities by private companies to June 30, 2025. Notification ID: MCA-DEMAT-2025.",
    }
  });

  await prisma.draftScenario.create({
    data: {
      name: "Mandatory Demat Conversion (Private Co)",
      description: "Process for converting physical shares to electronic mode for private companies before the June 2025 deadline.",
      category: "Equity",
      trigger_event: "Regulatory Deadline",
      status: "Pending Review",
      raw_scrape_id: scrape2.id,
      tasks: {
        create: [
          { name: "Appoint RTA (Registrar & Transfer Agent)", description: "Enter into agreement with a SEBI-registered RTA.", stage: "Setup", priority: "High", due_logic: "Before June 30, 2025" },
          { name: "ISIN Activation at NSDL/CDSL", description: "Apply for International Securities Identification Number.", stage: "Filing", priority: "High", due_logic: "Post RTA appointment" }
        ]
      }
    }
  });

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
