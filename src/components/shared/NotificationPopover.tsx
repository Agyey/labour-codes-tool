"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertCircle, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: Date;
}

export function NotificationPopover({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await getNotifications(userId);
    setNotifications(res as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    await markAllAsRead(userId);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'WARNING': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm group"
      >
        <Bell className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-950 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Notifications</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Firm-wide Alerts</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">Loading alerts...</div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-bold text-slate-400">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors relative group ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className={`text-xs font-black truncate pr-4 ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            href={n.link} 
                            onClick={() => { handleMarkRead(n.id); setIsOpen(false); }}
                            className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:gap-2 transition-all"
                          >
                            View Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                      {!n.read && (
                        <button 
                          onClick={() => handleMarkRead(n.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
