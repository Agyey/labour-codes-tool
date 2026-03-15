"use server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function createRawScrape(data: {
  sourceName: string;
  sourceUrl: string;
  rawHtml: string;
  rawText: string;
  metadata?: any;
}) {
  try {
    const scrape = await prisma.rawScrapeData.create({
      data: {
        source_name: data.sourceName,
        source_url: data.sourceUrl,
        raw_html: data.rawHtml,
        raw_text: data.rawText,
      },
    });
    return { success: true, scrape };
  } catch (error) {
    logger.error("Failed to create raw scrape", error);
    return { success: false, error: "Database error" };
  }
}

export async function getDraftScenarios() {
  try {
    const drafts = await prisma.draftScenario.findMany({
      include: {
        tasks: true,
        raw_scrape: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    return drafts;
  } catch (error) {
    logger.error("Failed to fetch drafts", error);
    return [];
  }
}

export async function createDraftScenario(data: {
  name: string;
  description: string;
  category: string;
  triggerEvent: string;
  sourceId: string;
  tasks: { name: string; description: string; stage: string; priority: string; due_logic: string }[];
}) {
  try {
    const draft = await prisma.draftScenario.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        trigger_event: data.triggerEvent,
        raw_scrape_id: data.sourceId,
        status: 'Pending Review',
        tasks: {
          create: data.tasks
        }
      }
    });
    return { success: true, draft };
  } catch (error) {
    logger.error("Failed to create draft scenario", error);
    return { success: false, error: "Database error" };
  }
}

export async function approveDraftScenario(id: string) {
  try {
    const draft = await prisma.draftScenario.update({
      where: { id },
      data: { status: 'Approved' }
    });
    return { success: true, draft };
  } catch (error) {
    logger.error("Failed to approve draft", error);
    return { success: false, error: "Database error" };
  }
}

export async function rejectDraftScenario(id: string) {
  try {
    const draft = await prisma.draftScenario.update({
      where: { id },
      data: { status: 'Rejected' }
    });
    return { success: true, draft };
  } catch (error) {
    logger.error("Failed to reject draft", error);
    return { success: false, error: "Database error" };
  }
}
