import React from 'react';
import { clinicData } from '../data/clinic';

interface FloatingCommunicationProps {
  onBookClick: () => void;
}

export const FloatingCommunication: React.FC<FloatingCommunicationProps> = ({ onBookClick }) => {
  const handleWhatsApp = () => {
    window.location.href = `https://wa.me/?text=Hello%20SHREE%20Clinic,%20I%20would%20like%20to%20inquire%20about%20an%20appointment.`;
  };

  const handleCall = () => {
    window.location.href = `tel:${clinicData.contact.phone.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <>
      {/* Desktop Floating WhatsApp Pill */}
      <aside
        aria-label="Direct messaging contact"
        className="hidden md:block fixed bottom-8 right-8 z-30"
      >
        <button
          onClick={handleWhatsApp}
          className="group flex items-center gap-3 px-5 py-3 rounded-full bg-[#f7f4ec]/95 hover:bg-[#f7f4ec] text-[#0b3037] border border-[#123f48]/15 shadow-[0_8px_30px_rgba(11,48,55,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#d9ae4a]"
          aria-label="Connect with SHREE care team on WhatsApp"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#6c9f36] animate-pulse" />
          <span className="text-xs font-heading font-bold tracking-wider uppercase">WhatsApp</span>
          <span className="text-xs text-[#d9ae4a] transition-transform duration-200 group-hover:translate-x-1">→</span>
        </button>
      </aside>

      {/* Mobile Fixed Bottom Bar (Section 43: Height 64px, background cream, top border subtle teal, equal width buttons: CALL, WHATSAPP, BOOK) */}
      <nav
        aria-label="Mobile Quick Actions"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[64px] bg-[#f7f4ec] border-t border-[#123f48]/15 px-4 flex items-center shadow-[0_-4px_24px_rgba(11,48,55,0.08)]"
      >
        <div className="flex items-center justify-between gap-2.5 w-full max-w-md mx-auto">
          <button
            onClick={handleCall}
            className="flex-1 h-11 rounded-full border border-[#123f48]/20 bg-[#eee9dc]/60 text-center text-xs font-heading font-bold text-[#0b3037] active:bg-[#123f48]/10 transition-colors"
          >
            CALL
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-11 rounded-full bg-[#6c9f36]/15 text-center text-xs font-heading font-bold text-[#6c9f36] active:bg-[#6c9f36]/25 transition-colors"
          >
            WHATSAPP
          </button>
          <button
            onClick={onBookClick}
            className="flex-1 h-11 rounded-full bg-[#0b3037] text-center text-xs font-heading font-bold text-[#f7f4ec] active:bg-[#123f48] transition-colors shadow-sm"
          >
            BOOK
          </button>
        </div>
      </nav>
    </>
  );
};
