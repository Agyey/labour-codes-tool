import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProvision, getProvisions } from "./provisions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    provision: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    legislation: {
      findFirst: vi.fn(),
    },
    oldMapping: {
      deleteMany: vi.fn(),
    },
    complianceItem: {
      deleteMany: vi.fn(),
    },
    stateData: {
      deleteMany: vi.fn(),
    },
    provisionEdit: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/audit", () => ({
  logActivity: vi.fn(),
}));

describe("provisions server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProvisions", () => {
    it("should return formatted provisions on success", async () => {
      const mockDbProvs = [
        {
          id: "1",
          code: "C1",
          chapter: "CH1",
          section: "S1",
          sub_section: "1",
          title: "Title",
          provision_type: "section",
          summary: "Sum",
          full_text: "Full",
          verified: true,
          pinned: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      (prisma.provision.findMany as any).mockResolvedValue(mockDbProvs);

      const result = await getProvisions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
      expect(prisma.provision.findMany).toHaveBeenCalled();
    });

    it("should return empty array on failure", async () => {
      (prisma.provision.findMany as any).mockRejectedValue(new Error("DB error"));
      const result = await getProvisions();
      expect(result).toEqual([]);
    });
  });

  describe("updateProvision", () => {
    const validProvision: any = {
      id: "1",
      code: "C1",
      ch: "CH1",
      chName: "CH Name",
      sec: "S1",
      sub: "1",
      title: "Title",
      provisionType: "section",
      summary: "Summary",
      fullText: "Full Text",
      impact: "High",
      ruleAuth: "Central Government",
      verified: true,
      pinned: false,
    };

    it("should return error if unauthorized", async () => {
      (getServerSession as any).mockResolvedValue(null);
      const result = await updateProvision("1", validProvision);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should upsert and revalidate on success", async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: "user1" } });
      (prisma.provision.upsert as any).mockResolvedValue({ id: "1" });

      const result = await updateProvision("1", validProvision);

      expect(result.success).toBe(true);
      expect(prisma.provision.upsert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/library");
    });

    it("should return error if validation fails", async () => {
      (getServerSession as any).mockResolvedValue({ user: { id: "user1" } });
      const invalidProvision = { ...validProvision, impact: "InvalidImpact" };
      
      const result = await updateProvision("1", invalidProvision as any);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
