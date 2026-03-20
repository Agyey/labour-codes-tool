import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HumanReviewEditor from "@/components/editor/HumanReviewEditor";

export const metadata = {
  title: "Editor Dashboard | Legal Intelligence",
};

interface EditorPageProps {
  params: { id: string };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  return <HumanReviewEditor documentId={params.id} />;
}
