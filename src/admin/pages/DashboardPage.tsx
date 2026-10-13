import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Activity, Receipt, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { admin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Clinical Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Welcome, Dr. {admin?.email.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            SHREE Multidisciplinary Healthcare · Freedom Hospitals, Mokila
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-stone-100 p-3 rounded-2xl border border-neutral-200">
          <ShieldCheck className="w-4 h-4 text-[#0b3037]" />
          <span>India DPDP Compliant EMR</span>
        </div>
      </div>

      {/* KPI Stats Grid Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Visits", val: '0', sub: 'Scheduled consultations', icon: Calendar, color: 'text-teal-600 bg-teal-50' },
          { label: 'Active Patients', val: '0', sub: 'Registered EMR records', icon: Users, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Hearing Aid Trials', val: '0', sub: 'Ongoing evaluations', icon: Activity, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pending Dues', val: '₹0', sub: 'Outstanding balances', icon: Receipt, color: 'text-rose-600 bg-rose-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-xs flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 block">
                  {stat.val}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  {stat.sub}
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-xs">
        <h2 className="text-lg font-bold text-neutral-900 mb-2">
          Clinical Operations Modules
        </h2>
        <p className="text-xs text-neutral-600 mb-6">
          Access specialized diagnostic directories, hearing aid dispensing, and therapy documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#0b3037]/5 border border-[#0b3037]/15">
            <span className="text-xs font-bold text-[#0b3037] block mb-1">Audiology & Hearing Aids</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Diagnostic PTA charting, impedance metrics, hearing aid walk-in logs, and trial trackers.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0891b2]/5 border border-[#0891b2]/15">
            <span className="text-xs font-bold text-[#0891b2] block mb-1">Speech & Language Pathology</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Long-term therapy plans, session-wise SOAP notes, and VitalStim® swallowing logs.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#65a30d]/5 border border-[#65a30d]/15">
            <span className="text-xs font-bold text-[#4d7c0f] block mb-1">Physiotherapy & Mobility</span>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Neuro-rehab notes, orthopedic assessment protocols, and home exercise program tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
