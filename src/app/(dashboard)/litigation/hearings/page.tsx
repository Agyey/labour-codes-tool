import { getHearings } from "@/app/actions/litigation";
import { HearingClient } from "@/components/litigation/HearingClient";

export const dynamic = "force-dynamic";

export default async function HearingBoardPage() {
  const hearings = await getHearings();

  return <HearingClient initialHearings={hearings} />;
}
