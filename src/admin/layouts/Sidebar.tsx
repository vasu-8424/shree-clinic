import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Headphones,
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
  { label: 'Inventory', to: '/admin/inventory', icon: Package },
  { label: 'Billing & GST', to: '/admin/billing', icon: Receipt },
  { label: 'Reports & Export', to: '/admin/reports', icon: FileSpreadsheet },
  { label: 'Audit Log (DPDP)', to: '/admin/audit-log', icon: ShieldAlert },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  return (
    <aside className="w-64 bg-[#0b3037] text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Logo / Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/shree-logo-transparent.png"
                alt="Shree Clinic"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold font-mono tracking-wider text-[#d9ae4a] uppercase leading-none">
                SHREE CLINIC
              </span>
              <span className="text-[10px] text-white/60 font-mono mt-1">
                Admin PMS Portal
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#d9ae4a] text-[#0b3037] font-bold shadow-md shadow-black/10'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-[11px] text-white/50 font-mono">
        <div className="flex items-center gap-2 mb-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">System Online</span>
        </div>
        <p className="truncate">Freedom Hospitals, Mokila</p>
      </div>
    </aside>
  );
};
