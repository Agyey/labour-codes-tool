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

  // Fetch all active legislations with their frameworks
  const legislations = await prisma.legislation.findMany({
    where: { is_repealed: false },
    include: { framework: true },
    orderBy: { year: "desc" },
  });

  return <LibraryClient legislations={legislations} />;
}
