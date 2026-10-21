import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Activity, Receipt, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../api/client';

export const DashboardPage: React.FC = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todaysVisits: 0,
    devicesInStock: 0,
    activeTrials: 0,
    totalBilled: 0,
    totalCollected: 0,
    pendingDues: 0,
  });

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/v1/reports/summary');
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="space-y-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#0f192b] to-[#0a101d] p-7 sm:p-9 rounded-3xl border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              Live Clinical Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome, Admin
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium">
            SHREE Multidisciplinary Healthcare · Freedom Hospitals, Mokila
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 text-xs sm:text-sm font-semibold bg-[#070b12]/80 text-slate-200 px-4 py-3 rounded-2xl border border-slate-700/80 shadow-inner">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>India DPDP Compliant EMR</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Today's Visits",
            val: loading ? '...' : (summary.todaysVisits || 0).toString(),
            sub: 'Scheduled consultations',
            icon: Calendar,
            iconColor: 'text-teal-400 bg-teal-500/15 border border-teal-500/30',
            link: '/admin/appointments',
            valColor: 'text-white',
          },
          {
            label: 'Active Patients',
            val: loading ? '...' : (summary.totalPatients || 0).toString(),
            sub: 'Registered EMR records',
            icon: Users,
            iconColor: 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30',
            link: '/admin/patients',
            valColor: 'text-white',
          },
          {
            label: 'Hearing Aid Trials',
            val: loading ? '...' : (summary.activeTrials || 0).toString(),
            sub: 'Ongoing evaluations',
            icon: Activity,
            iconColor: 'text-amber-400 bg-amber-500/15 border border-amber-500/30',
            link: '/admin/hearing-aids',
            valColor: 'text-white',
          },
          {
            label: 'Pending Dues',
            val: loading ? '...' : `₹${(summary.pendingDues || 0).toLocaleString('en-IN')}`,
            sub: 'Outstanding balances',
            icon: Receipt,
            iconColor: 'text-rose-400 bg-rose-500/15 border border-rose-500/30',
            link: '/admin/billing',
            highlight: (summary.pendingDues || 0) > 0,
            valColor: (summary.pendingDues || 0) > 0 ? 'text-rose-400' : 'text-white',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.link}
              className={`bg-[#0e1626] p-6 rounded-2xl border transition-all duration-200 hover:shadow-xl hover:bg-[#121c30] flex items-start justify-between group ${
                stat.highlight ? 'border-rose-800/80 ring-1 ring-rose-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="text-xs sm:text-sm font-bold font-mono text-slate-400 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className={`text-3xl sm:text-4xl font-black mt-2 block tracking-tight ${stat.valColor}`}>
                  {stat.val}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 mt-2 block group-hover:text-slate-200 flex items-center gap-1.5 transition-colors">
                  {stat.sub} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl ${stat.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Launch Cards */}
      <div className="bg-[#0e1626] p-7 sm:p-9 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
          Clinical Operations Modules
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mb-7">
          Access specialized diagnostic directories, hearing aid dispensing, and therapy documentation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/admin/hearing-aids"
            className="p-5 sm:p-6 rounded-2xl bg-[#081520] border border-teal-800/40 hover:border-teal-500/70 hover:bg-[#0a1c2a] transition-all group block shadow-md"
          >
            <span className="text-sm sm:text-base font-bold text-teal-300 group-hover:text-teal-200 block mb-2 flex items-center justify-between">
              Audiology & Hearing Aids
              <ArrowRight className="w-4 h-4 text-teal-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Diagnostic PTA charting, impedance metrics, hearing aid walk-in logs, and trial trackers.
            </p>
          </Link>

          <Link
            to="/admin/patients"
            className="p-5 sm:p-6 rounded-2xl bg-[#091728] border border-cyan-800/40 hover:border-cyan-500/70 hover:bg-[#0c2036] transition-all group block shadow-md"
          >
            <span className="text-sm sm:text-base font-bold text-cyan-300 group-hover:text-cyan-200 block mb-2 flex items-center justify-between">
              Speech & Language Pathology
              <ArrowRight className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Long-term therapy plans, session-wise SOAP notes, and VitalStim® swallowing logs.
            </p>
          </Link>

          <Link
            to="/admin/appointments"
            className="p-5 sm:p-6 rounded-2xl bg-[#091a14] border border-emerald-800/40 hover:border-emerald-500/70 hover:bg-[#0d241c] transition-all group block shadow-md"
          >
            <span className="text-sm sm:text-base font-bold text-emerald-300 group-hover:text-emerald-200 block mb-2 flex items-center justify-between">
              Physiotherapy & Mobility
              <ArrowRight className="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Neuro-rehab notes, orthopedic assessment protocols, and home exercise program tracking.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
