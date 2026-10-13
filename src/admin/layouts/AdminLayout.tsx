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
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs animate-fade-in"
          />
        )}

        {/* Mobile Drawer Content */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b3037] transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
              isActive ? 'text-[#0b3037]' : 'text-neutral-500'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/patients"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
              isActive ? 'text-[#0b3037]' : 'text-neutral-500'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Patients</span>
        </NavLink>

        <NavLink
          to="/admin/appointments"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
              isActive ? 'text-[#0b3037]' : 'text-neutral-500'
            }`
          }
        >
          <CalendarDays className="w-5 h-5" />
          <span>Appts</span>
        </NavLink>

        <NavLink
          to="/admin/billing"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
              isActive ? 'text-[#0b3037]' : 'text-neutral-500'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span>Billing</span>
        </NavLink>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-neutral-500 hover:text-black cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
