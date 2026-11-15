import React, { useState } from 'react';
import {
  FileText,
  Building2,
  CheckCircle,
  X,
  Plus,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { LoanApplication } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface LoansViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LoansView: React.FC<LoansViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const loans = storage.getLoans();
  const leads = storage.getLeads();

  // Modals
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  // Sanction Form State
  const [sanctionAmount, setSanctionAmount] = useState('');
  const [lenderRef, setLenderRef] = useState('');
  const [sanctionRemarks, setSanctionRemarks] = useState('');
  const [sanctionError, setSanctionError] = useState('');

  // Create Application State
  const [createLeadId, setCreateLeadId] = useState(leads[0]?.id || '');
  const [appliedAmount, setAppliedAmount] = useState('');
  const [loanType, setLoanType] = useState('New Vehicle Loan');
  const [createError, setCreateError] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const handleRecordSanction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setSanctionError('');

    const amt = parseFloat(sanctionAmount);
    if (isNaN(amt) || amt <= 0) {
      setSanctionError('Please enter a valid sanction amount greater than 0.');
      return;
    }
    if (!lenderRef.trim()) {
      setSanctionError('Lender Reference Number is mandatory.');
      return;
    }

    try {
      storage.sanctionLoan(selectedLoan.id, amt, lenderRef, sanctionRemarks);
      setShowSanctionModal(false);
      onRefresh();
    } catch (err: any) {
      setSanctionError(err.message || 'Failed to record sanction.');
    }
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const amt = parseFloat(appliedAmount);
    if (isNaN(amt) || amt <= 0) {
      setCreateError('Please enter a valid applied loan amount.');
      return;
    }

    try {
      storage.createLoanApplication({
        leadId: createLeadId,
        appliedAmount: amt,
        loanType,
      });
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create application.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Loan Application Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              {loans.length} Files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bank underwriting, credit sanction letters, and sanctioned loan tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setAppliedAmount('');
            setCreateError('');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Loan Application</span>
        </button>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Application & Customer</th>
                <th className="px-4 py-3.5">Lender</th>
                <th className="px-4 py-3.5">Applied Amount</th>
                <th className="px-4 py-3.5">Sanctioned Amount</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Lender Ref / Remarks</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No loan applications created yet.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{loan.customerName}</div>
                      <div className="font-mono text-blue-700 text-[11px] font-semibold">{loan.applicationNumber}</div>
                      <div className="text-[10px] text-slate-400">{loan.loanType} • Applied: {loan.applicationDate}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{loan.lenderName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">
                      {formatCurrency(loan.appliedAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      {loan.sanctionedAmount > 0 ? (
                        <div className="font-bold text-emerald-700 text-sm">
                          {formatCurrency(loan.sanctionedAmount)}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-medium">Pending Sanction</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium">{loan.lenderReferenceNumber || '—'}</div>
                      {loan.remarks && <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{loan.remarks}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setSanctionAmount(loan.sanctionedAmount ? String(loan.sanctionedAmount) : String(loan.appliedAmount));
                            setLenderRef(loan.lenderReferenceNumber || '');
                            setSanctionRemarks(loan.remarks || '');
                            setSanctionError('');
                            setShowSanctionModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
                        >
                          {loan.sanctionedAmount > 0 ? 'Edit Sanction' : 'Record Sanction'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD SANCTION MODAL */}
      {showSanctionModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Record Credit Sanction</h3>
              </div>
              <button onClick={() => setShowSanctionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSanction} className="mt-4 space-y-3.5 text-xs">
              {sanctionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sanctionError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div><span className="text-slate-500">Customer:</span> <strong className="text-slate-800">{selectedLoan.customerName}</strong></div>
                <div><span className="text-slate-500">Lender:</span> <strong className="text-slate-800">{selectedLoan.lenderName}</strong></div>
                <div><span className="text-slate-500">Applied Amount:</span> <strong className="text-slate-800">{formatCurrency(selectedLoan.appliedAmount)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sanctioned Loan Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1000000"
                  value={sanctionAmount}
                  onChange={(e) => setSanctionAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: This Sanctioned Amount defines the base for disbursements, locks, and partner payouts.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lender Sanction Reference Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC-SAN-2026-991"
                  value={lenderRef}
                  onChange={(e) => setLenderRef(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sanction Terms / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="ROI, tenure in months, any special credit conditions..."
                  value={sanctionRemarks}
                  onChange={(e) => setSanctionRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSanctionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE APPLICATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">New Loan Application</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="mt-4 space-y-3.5 text-xs">
              {createError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Customer Lead *</label>
                <select
                  required
                  value={createLeadId}
                  onChange={(e) => setCreateLeadId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} - {l.vehicleMake} {l.vehicleModel} ({l.lenderName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Loan Type</label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white"
                >
                  <option value="New Vehicle Loan">New Vehicle Loan</option>
                  <option value="Used Vehicle Loan">Used Vehicle Loan</option>
                  <option value="Commercial Vehicle Loan">Commercial Vehicle Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Applied Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 800000"
                  value={appliedAmount}
                  onChange={(e) => setAppliedAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
