import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { admin, logout } = useAuth();

  return (
    <header className="h-18 bg-[#0a0f18]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Clinical Workspace
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-200">
            Audiology · Speech · Physiotherapy
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* View Public Website */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white border border-slate-700/80 rounded-xl hover:bg-slate-800/80 transition-all shadow-xs"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        {/* Current Admin Tag */}
        <div className="flex items-center gap-2.5 pl-3.5 border-l border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-bold text-white leading-tight">
              {admin?.email || 'admin@shreeclinic.com'}
            </span>
            <span className="text-xs font-medium text-slate-400 leading-tight mt-0.5">
              Clinical Director
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 border border-rose-800/50 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ml-1"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
