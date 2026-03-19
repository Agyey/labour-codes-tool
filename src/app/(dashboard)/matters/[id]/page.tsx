import { getMatterDetails } from "@/app/actions/matters";
import MatterDashboardView from "./MatterDashboardView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatterDealRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matter = await getMatterDetails(id);

  if (!matter) {
    return notFound();
  }

  return <MatterDashboardView matter={matter} />;
}
