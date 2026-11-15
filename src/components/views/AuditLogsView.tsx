import React from 'react';
import {
  ScrollText,
  Shield,
  Clock,
  UserCheck,
  Lock,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface AuditLogsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = () => {
  const currentUser = storage.getCurrentUser();
  const logs = storage.getAuditLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & Financial Audit Trail</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-white">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographic timestamped action history tracking all entity modifications, status changes, and disbursements.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Strictly Private to CEO & Admin</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Timestamp & IP</th>
                <th className="px-4 py-3.5">Actor & Role</th>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Entity / Record ID</th>
                <th className="px-4 py-3.5">Previous State</th>
                <th className="px-4 py-3.5">New State / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-sans">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{log.ipAddress}</div>
                    </td>
                    <td className="px-4 py-3.5 font-sans">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="font-semibold font-sans">{log.entityName}</div>
                      <div className="text-[10px] text-slate-400">{log.recordId}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 truncate max-w-[160px]" title={log.previousValue}>
                      {log.previousValue || 'None'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 font-semibold truncate max-w-[220px]" title={log.newValue}>
                      {log.newValue}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
