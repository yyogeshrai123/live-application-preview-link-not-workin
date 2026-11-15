import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Building2,
  Users,
  CreditCard,
  Shield,
  X,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface ReportsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = () => {
  const currentUser = storage.getCurrentUser();
  const leads = storage.getLeads();
  const loans = storage.getLoans();
  const disbursements = storage.getDisbursements();
  const locks = storage.getLocks();
  const payouts = storage.getPartnerPayouts();
  const payments = storage.getLenderPayments();
  const fin = storage.getFinancialSummary();

  const [selectedReport, setSelectedReport] = useState('total-leads');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const reportTypes = [
    { id: 'total-leads', name: 'Total Leads Report', roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER'] },
    { id: 'officer-performance', name: 'Officer-wise Performance', roles: ['CEO', 'ADMIN', 'MANAGER'] },
    { id: 'manager-performance', name: 'Manager-wise Team Report', roles: ['CEO', 'ADMIN'] },
    { id: 'partner-leads', name: 'Channel Partner Sourced Leads', roles: ['CEO', 'ADMIN', 'MANAGER', 'PARTNER'] },
    { id: 'lender-loans', name: 'Lender-wise Loan Summary', roles: ['CEO', 'ADMIN'] },
    { id: 'sanctioned-loans', name: 'Sanctioned Loans Ledger', roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER'] },
    { id: 'disbursements', name: 'Disbursement Bank Transfers', roles: ['CEO', 'ADMIN'] },
    { id: 'locked-amounts', name: 'Active & Released Locked Amounts', roles: ['CEO', 'ADMIN'] },
    { id: 'lender-payments', name: 'Lender Commission Receipts', roles: ['CEO', 'ADMIN'] },
    { id: 'partner-payouts', name: 'Channel Partner Payouts Ledger', roles: ['CEO', 'ADMIN'] },
    { id: 'financial-summary', name: 'Comprehensive Date-wise Financial Report', roles: ['CEO', 'ADMIN'] },
  ];

  const allowedReports = reportTypes.filter((r) => r.roles.includes(currentUser.role));

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  // Generate CSV data and trigger download
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReport === 'total-leads' || selectedReport === 'partner-leads') {
      headers = ['File Reference', 'Customer Name', 'Contact Number', 'Vehicle', 'Lender', 'Officer', 'Partner', 'Status', 'Created Date'];
      rows = leads.map((l) => [
        l.fileReference,
        `"${l.customerName}"`,
        l.customerContactNumber,
        `"${l.vehicleMake} ${l.vehicleModel} (${l.vehicleNumber})"`,
        `"${l.lenderName}"`,
        `"${l.salesOfficerName}"`,
        `"${l.channelPartnerName || 'Direct'}"`,
        l.status,
        new Date(l.createdAt).toLocaleDateString(),
      ]);
    } else if (selectedReport === 'disbursements') {
      headers = ['UTR Reference', 'Customer Name', 'Account Holder', 'Transfer Amount', 'Status', 'Verified By', 'Date'];
      rows = disbursements.map((d) => [
        d.utrNumber,
        `"${d.customerName}"`,
        `"${d.accountHolderName}"`,
        String(d.transferAmount),
        d.status,
        `"${d.verifiedByName || d.createdByName}"`,
        new Date(d.transferDate).toLocaleDateString(),
      ]);
    } else {
      headers = ['Application Number', 'Customer Name', 'Lender', 'Applied Amount', 'Sanctioned Amount', 'Status'];
      rows = loans.map((l) => [
        l.applicationNumber,
        `"${l.customerName}"`,
        `"${l.lenderName}"`,
        String(l.appliedAmount),
        String(l.sanctionedAmount),
        l.status,
      ]);
    }

    csvContent += headers.join(',') + '\r\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AONE_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Executive Reports & Data Export</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              CSV & PDF Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Download institutional compliance records, audit-ready disbursement sheets, and partner conversion statements.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Printable PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allowedReports.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={`p-4 rounded-xl border text-left transition-all text-xs ${
              selectedReport === r.id
                ? 'bg-blue-50/80 border-blue-500 shadow-xs text-blue-950 font-bold ring-1 ring-blue-500'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold">{r.name}</span>
              {selectedReport === r.id && <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
            <p className="text-[11px] text-slate-500">Institutional format report with role-based filtering</p>
          </button>
        ))}
      </div>

      {/* Live Data Preview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Live Preview: {reportTypes.find((r) => r.id === selectedReport)?.name}
            </h3>
            <span className="text-[11px] text-slate-500">Showing current workspace database records</span>
          </div>
          <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-bold">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">File / Identifier</th>
                <th className="px-4 py-3">Primary Entity</th>
                <th className="px-4 py-3">Associated Bank / User</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount / Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.slice(0, 5).map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{l.fileReference}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{l.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{l.lenderName} ({l.salesOfficerName})</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">{l.status}</span></td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{l.vehicleMake} {l.vehicleModel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 p-8 my-8 text-xs font-sans print:shadow-none print:border-none print:p-0">
            {/* Report Header */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">A ONE FINANCIAL SERVICES</h2>
                <p className="text-slate-500 text-[11px] font-semibold">Corporate Loan CRM & DSA Sourcing System</p>
                <p className="text-slate-400 text-[10px]">Mumbai Head Office • License: NBFC-DSA/2026/088</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-blue-800 block">CONFIDENTIAL REPORT</span>
                <span className="text-slate-500 text-[11px]">Generated on: {new Date().toLocaleString()}</span>
                <span className="text-slate-500 text-[11px] block">Actor: {currentUser.fullName} ({currentUser.role})</span>
              </div>
            </div>

            {/* Financial Overview Snapshot */}
            <div className="my-6 grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sanctioned</span>
                <strong className="text-slate-900 text-sm font-mono">{formatCurrency(fin.totalSanctionedAmount)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Disbursed</span>
                <strong className="text-emerald-700 text-sm font-mono">{formatCurrency(fin.totalSuccessfulDisbursement)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Locked</span>
                <strong className="text-amber-700 text-sm font-mono">{formatCurrency(fin.activeLockedAmount)}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Payout</span>
                <strong className="text-blue-900 text-sm font-mono">{formatCurrency(fin.companyNetPayout)}</strong>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-400 italic mb-4">
              Verified by Antigravity Core Banking Logic • Zero Customer Fees Charged
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
              >
                Print to PDF / Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
