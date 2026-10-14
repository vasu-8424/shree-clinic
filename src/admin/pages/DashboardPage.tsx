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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Visits",
            val: loading ? '...' : (summary.todaysVisits || 0).toString(),
            sub: 'Scheduled consultations',
            icon: Calendar,
            color: 'text-teal-600 bg-teal-50',
            link: '/admin/appointments',
          },
          {
            label: 'Active Patients',
            val: loading ? '...' : (summary.totalPatients || 0).toString(),
            sub: 'Registered EMR records',
            icon: Users,
            color: 'text-cyan-600 bg-cyan-50',
            link: '/admin/patients',
          },
          {
            label: 'Hearing Aid Trials',
            val: loading ? '...' : (summary.activeTrials || 0).toString(),
            sub: 'Ongoing evaluations',
            icon: Activity,
            color: 'text-amber-600 bg-amber-50',
            link: '/admin/hearing-aids',
          },
          {
            label: 'Pending Dues',
            val: loading ? '...' : `₹${(summary.pendingDues || 0).toLocaleString('en-IN')}`,
            sub: 'Outstanding balances',
            icon: Receipt,
            color: 'text-rose-600 bg-rose-50',
            link: '/admin/billing',
            highlight: (summary.pendingDues || 0) > 0,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              to={stat.link}
              className={`bg-white p-5 rounded-2xl border transition-all duration-200 hover:shadow-md flex items-start justify-between group ${
                stat.highlight ? 'border-rose-200 ring-1 ring-rose-100' : 'border-neutral-200/90'
              }`}
            >
              <div>
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider block">
                  {stat.label}
                </span>
                <span className={`text-2xl sm:text-3xl font-extrabold mt-1 block ${stat.highlight ? 'text-rose-600' : 'text-neutral-900'}`}>
                  {stat.val}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block group-hover:text-stone-700 flex items-center gap-1">
                  {stat.sub} <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
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
