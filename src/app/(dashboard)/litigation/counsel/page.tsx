import { getCounsels } from "@/app/actions/litigation";
import { CounselClient } from "@/components/litigation/CounselClient";

export const dynamic = "force-dynamic";

export default async function CounselRepositoryPage() {
  const counsels = await getCounsels();

  return <CounselClient initialCounsels={counsels} />;
}
