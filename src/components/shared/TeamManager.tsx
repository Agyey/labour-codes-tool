"use client";

import { Trash2, Loader2, Mail } from "lucide-react";
import { updateMemberRole, removeMember } from "@/app/actions/organizations";
import { useState } from "react";
import toast from "react-hot-toast";
import { InviteMemberModal } from "./InviteMemberModal";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface TeamManagerProps {
  members: Member[];
  orgId: string;
  maxUsers: number;
}

export function TeamManager({ members, orgId, maxUsers }: TeamManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busyUser, setBusyUser] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setBusyUser(userId);
    try {
      const res = await updateMemberRole(userId, orgId, newRole);
      if (res.error) toast.error(res.error);
      else toast.success("Role updated");
    } catch (err) {
      toast.error("Failed to update role");
    } finally {
      setBusyUser(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setBusyUser(userId);
    try {
      const res = await removeMember(userId, orgId);
      if (res.error) toast.error(res.error);
      else toast.success("Member removed");
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setBusyUser(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-premium-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Users ({members.length}/{maxUsers})</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Invite colleagues to collaborate in your dedicated workspace.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none whitespace-nowrap"
        >
          <Mail className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-slate-100 dark:border-zinc-800 rounded-[24px] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50">
                {m.user.name?.split(' ').map(n => n[0]).join('') || m.user.email?.[0].toUpperCase()}
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white text-sm">{m.user.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.user.email}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 dark:border-zinc-800 sm:border-0 justify-between sm:justify-start">
              <div className="relative">
                {busyUser === m.user.id ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                  </div>
                ) : (
                  <select 
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.user.id, e.target.value)}
                    className="bg-slate-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-700"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Guest">Guest</option>
                  </select>
                )}
              </div>
              <button 
                onClick={() => handleRemove(m.user.id)}
                className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all" 
                title="Revoke Access"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[32px]">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No members found</p>
          </div>
        )}
      </div>

      <InviteMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orgId={orgId} 
      />
    </div>
  );
}
