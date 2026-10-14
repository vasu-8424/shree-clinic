import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  Loader2,
  FileText,
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity', entityFilter);

      const res = await apiFetch(`/api/v1/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, entityFilter]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            DELETE
          </span>
        );
      case 'VIEW':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
            VIEW
          </span>
        );
      case 'EXPORT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            EXPORT
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0b3037] flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-[#d9ae4a]" />
          DPDP Act 2023 Compliance Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Immutable audit log tracking all electronic health records access, creation, modifications, and exports.
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">DPDP Act 2023 Section 8 Privacy Safeguard:</span> Audit logs
          record timestamps, user agents, and IP addresses with entity identifiers. In strict
          compliance with Indian data protection laws, logs NEVER store patient names, mobile numbers,
          or decrypted clinical notes.
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="VIEW">VIEW</option>
            <option value="DELETE">DELETE</option>
            <option value="EXPORT">EXPORT</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700"
          >
            <option value="">All Entities</option>
            <option value="Patient">Patient</option>
            <option value="Appointment">Appointment</option>
            <option value="HearingAid">Hearing Aid</option>
            <option value="Invoice">Invoice</option>
            <option value="Settings">Settings</option>
          </select>
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Showing {logs.length} logged events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#0b3037] animate-spin mb-3" />
            <p className="text-xs text-stone-500">Querying secure audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">No logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Admin / Origin</th>
                  <th className="py-3 px-4">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-stone-900">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-stone-500 truncate max-w-[140px]" title={log.entityId}>
                      {log.entityId || '—'}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{log.admin?.email || 'System'}</div>
                      <div className="text-[10px] text-stone-400">{log.ipAddress || '127.0.0.1'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
