import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  Menu,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col admin-workspace selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          />
        )}

        {/* Mobile Drawer Content */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#070b12] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070b12]">
          <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a101a] border-t border-slate-800/90 z-30 px-3 py-2 flex items-center justify-around shadow-2xl backdrop-blur-md">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-colors ${
              isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/patients"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-colors ${
              isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Patients</span>
        </NavLink>

        <NavLink
          to="/admin/appointments"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-colors ${
              isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Appts</span>
        </NavLink>

        <NavLink
          to="/admin/billing"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-colors ${
              isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span>Billing</span>
        </NavLink>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
