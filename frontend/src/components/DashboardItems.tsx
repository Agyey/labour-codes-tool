import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export const NavItem = React.memo(({ icon, label, active = false }: NavItemProps) => {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all ${
      active ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
});

NavItem.displayName = 'NavItem';

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

export const StatCard = React.memo(({ label, value, trend, icon }: StatCardProps) => {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
          {icon}
        </div>
        <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

interface ActItemProps {
  title: string;
  tag: string;
  date: string;
}

export const ActItem = React.memo(({ title, tag, date }: ActItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-black/60 transition-colors cursor-pointer group">
      <div>
        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
        tag === 'Active' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 
        tag === 'Draft' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' : 
        'text-blue-400 border-blue-500/20 bg-blue-500/5'
      }`}>
        {tag}
      </span>
    </div>
  );
});

ActItem.displayName = 'ActItem';
