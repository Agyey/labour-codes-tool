import { getMatterDetails } from "@/app/actions/matters";
import MatterDashboardView from "./MatterDashboardView";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatterDealRoomPage({ params }: { params: { id: string } }) {
  const matter = await getMatterDetails(params.id);

  if (!matter) {
    return notFound();
  }

  return <MatterDashboardView matter={matter} />;
}
