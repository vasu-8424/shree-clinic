import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Headphones,
  MessageSquareQuote,
  Activity,
  Package,
  Receipt,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Patients (EMR)', to: '/admin/patients', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Hearing Aids', to: '/admin/hearing-aids', icon: Headphones },
  { label: 'Speech Therapy', to: '/admin/speech-therapy', icon: MessageSquareQuote },
  { label: 'Physiotherapy', to: '/admin/physiotherapy', icon: Activity },
  { label: 'Inventory', to: '/admin/inventory', icon: Package },
  { label: 'Billing & GST', to: '/admin/billing', icon: Receipt },
  { label: 'Reports & Export', to: '/admin/reports', icon: FileSpreadsheet },
  { label: 'Audit Log (DPDP)', to: '/admin/audit-log', icon: ShieldAlert },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  return (
    <aside className="w-72 bg-[#070b12] text-slate-100 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800/80 shadow-2xl">
      <div>
        {/* Logo / Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-[#0a0f18]/60">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg shadow-black/40 ring-2 ring-emerald-500/20 transition-transform hover:scale-105">
              <img
                src="/shree-logo-transparent.png"
                alt="Shree Clinic"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black font-mono tracking-wider text-amber-400 uppercase leading-tight">
                SHREE CLINIC
              </span>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                Admin PMS Portal
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-5 border-t border-slate-800/80 bg-[#0a0f18]/60 text-xs text-slate-400 font-medium space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
          <span>System Online</span>
        </div>
        <p className="truncate text-slate-400 text-xs">Freedom Hospitals, Mokila</p>
      </div>
    </aside>
  );
};
