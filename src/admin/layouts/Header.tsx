import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { admin, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-neutral-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Clinical Workspace
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-semibold text-neutral-800">
            Audiology · Speech · Physiotherapy
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* View Public Website */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-black border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Current Admin Tag */}
        <div className="flex items-center gap-2 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-[#0b3037] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#d9ae4a]" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-neutral-900 leading-tight">
              {admin?.email || 'Admin'}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 leading-tight">
              Clinical Director
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer ml-1"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
