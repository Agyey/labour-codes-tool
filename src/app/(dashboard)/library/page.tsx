import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LibraryClient from "@/components/library/LibraryClient";

export const metadata = {
  title: "Knowledge Library | Legal Intelligence",
  description: "Browse the structured legislative database.",
};

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch all active legal documents
  const documents = await prisma.legalDocument.findMany({
    orderBy: { year: "desc" },
  });

  return <LibraryClient legislations={documents} />;
}
