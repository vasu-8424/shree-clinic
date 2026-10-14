import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  Receipt,
  Headphones,
  Calendar,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await apiFetch('/api/v1/reports/summary');
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        }
      } catch (e) {
        console.error('Failed to load summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const handleDownload = async (type: 'patients' | 'invoices', filename: string) => {
    try {
      setDownloading(type);
      const res = await apiFetch(`/api/v1/reports/export/${type}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate export file');
      }
    } catch {
      alert('Error downloading report');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
          <FileSpreadsheet className="w-7 h-7 text-[#d9ae4a]" />
          Reports & Data Export Center
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Export clinical case registries, GST invoicing registers, and patient records for accounting & regulatory compliance.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            Registered Patients
          </div>
          <div className="text-2xl font-bold font-serif text-[#0b3037] mt-1">
            {summary?.totalPatients ?? '—'}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">DPDP Compliant EMRs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            Total Appointments
          </div>
          <div className="text-2xl font-bold font-serif text-[#0b3037] mt-1">
            {summary?.totalAppointments ?? '—'}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Consultation records</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-stone-400" />
            Active Trials
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1">
            {summary?.activeTrials ?? '—'}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Ongoing home trials</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-stone-400" />
            Net Billed Revenue
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-600 mt-1 font-mono">
            ₹{summary ? Number(summary.totalBilled).toLocaleString('en-IN') : '—'}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">Gross clinical billings</div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Register Export */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#0b3037]/10 text-[#0b3037] flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Patient Master Directory (CSV)
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Complete registry of patient UHIDs, demographic details, contact numbers, referral sources, and registration timestamps.
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              <CheckCircle className="w-3.5 h-3.5" /> India DPDP Act 2023 Compliant Export
            </div>
          </div>

          <button
            onClick={() => handleDownload('patients', 'shree-clinic-patients.csv')}
            disabled={downloading === 'patients'}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0b3037] hover:bg-[#124b55] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {downloading === 'patients' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Patient Register (.csv)</span>
          </button>
        </div>

        {/* GST Invoicing Register Export */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Billing & Tax Register (CSV)
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Official accounts export including invoice numbers, subtotal values, CGST/SGST tax amounts, collections, and outstanding dues.
            </p>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-stone-600 font-mono bg-stone-100 px-2.5 py-1 rounded-lg w-fit">
              Formatted for CA & Tally Audit
            </div>
          </div>

          <button
            onClick={() => handleDownload('invoices', 'shree-clinic-invoices.csv')}
            disabled={downloading === 'invoices'}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0b3037] hover:bg-[#124b55] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {downloading === 'invoices' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Tax Invoicing Register (.csv)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
