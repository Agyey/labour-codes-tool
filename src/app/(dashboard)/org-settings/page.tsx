import { Building2 } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrganizationData, getOrgMembers } from "@/app/actions/organizations";
import { OrgSettingsClient } from "@/components/shared/OrgSettingsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrganizationSettings() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.orgId) {
    return (
      <div className="p-8 text-center space-y-4">
        <Building2 className="w-16 h-16 text-slate-200 mx-auto" />
        <h1 className="text-2xl font-black">No Organization Linked</h1>
        <p className="text-slate-500">You must be part of an organization to access these settings.</p>
      </div>
    );
  }

  const [org, members] = await Promise.all([
    getOrganizationData(session.user.orgId),
    getOrgMembers(session.user.orgId)
  ]);

  if (!org) {
    return redirect('/dashboard');
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-500" />
            Organization Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage users, billing, and firm-wide security configurations for {org.name}.
          </p>
        </div>
      </div>

      <OrgSettingsClient 
        initialMembers={members} 
        orgId={org.id}
        orgName={org.name}
        planTier={org.plan}
      />
    </div>
  );
}
