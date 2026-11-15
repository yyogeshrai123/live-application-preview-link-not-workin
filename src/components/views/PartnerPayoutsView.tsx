import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Percent,
  CreditCard,
  AlertCircle,
  X,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { PartnerPayout } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface PartnerPayoutsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const PartnerPayoutsView: React.FC<PartnerPayoutsViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const payouts = storage.getPartnerPayouts();
  const rules = storage.getPartnerPayoutRules();

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PartnerPayout | null>(null);

  // Form: Rule Config
  const [ruleLoanType, setRuleLoanType] = useState('New Vehicle Loan');
  const [rulePercentage, setRulePercentage] = useState('2.0');
  const [ruleError, setRuleError] = useState('');

  // Form: Record Payout Payment
  const [payAmount, setPayAmount] = useState('');
  const [payUtr, setPayUtr] = useState('');
  const [payRemarks, setPayRemarks] = useState('');
  const [payError, setPayError] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const handleUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError('');

    const pct = parseFloat(rulePercentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setRuleError('Please enter a valid percentage between 0 and 100.');
      return;
    }

    try {
      storage.updatePartnerPayoutRule(ruleLoanType, pct);
      setShowRuleModal(false);
      onRefresh();
    } catch (err: any) {
      setRuleError(err.message || 'Failed to update rule.');
    }
  };

  const handleRecordPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    setPayError('');

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayError('Please enter a valid payout amount.');
      return;
    }

    if (amt > selectedPayout.pendingAmount) {
      setPayError(`Payment ₹${amt.toLocaleString('en-IN')} exceeds pending balance ₹${selectedPayout.pendingAmount.toLocaleString('en-IN')}.`);
      return;
    }

    if (!payUtr.trim()) {
      setPayError('UTR / Transaction reference is required.');
      return;
    }

    try {
      storage.recordPartnerPayoutTransaction(selectedPayout.id, amt, payUtr, payRemarks);
      setShowPayModal(false);
      onRefresh();
    } catch (err: any) {
      setPayError(err.message || 'Failed to record payout.');
    }
  };

  const totalPayable = payouts.reduce((acc, curr) => acc + curr.payableAmount, 0);
  const totalPaid = payouts.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = payouts.reduce((acc, curr) => acc + curr.pendingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Channel Partner Payouts</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-800">
              DSA Commission Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculated as Sanctioned Amount × Snapshot Payout Percentage. Strictly private to CEO/Admin.
          </p>
        </div>

        {currentUser.role === 'CEO' && (
          <button
            onClick={() => {
              setRulePercentage('2.0');
              setRuleError('');
              setShowRuleModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Percent className="w-4 h-4" />
            <span>Configure Payout Rules</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payouts Payable</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalPayable)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Calculated from sanctioned files</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid to Partners</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(totalPaid)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Bank transfer UTR verified</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Partner Balance</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{formatCurrency(totalPending)}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting payout release</p>
        </div>
      </div>

      {/* Active Rules Snapshot Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-200">Active Payout Percentage Rules:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {rules.map((r) => (
            <span key={r.id} className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300">
              {r.loanType}: <strong className="text-emerald-400">{r.payoutPercentage}%</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Channel Partner</th>
                <th className="px-4 py-3.5">Customer & File</th>
                <th className="px-4 py-3.5">Sanctioned Amount</th>
                <th className="px-4 py-3.5">Payout Snapshot %</th>
                <th className="px-4 py-3.5">Payable Amount</th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Pending Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    No channel partner payouts generated yet. Payouts generate automatically when partner leads are sanctioned.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                      {p.partnerName}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{p.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Loan ID: {p.loanId}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {formatCurrency(p.sanctionedAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px]">
                        {p.payoutPercentageSnapshot}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatCurrency(p.payableAmount)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700">
                      {formatCurrency(p.paidAmount)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-amber-700">
                      {formatCurrency(p.pendingAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {p.pendingAmount > 0 && (currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setSelectedPayout(p);
                            setPayAmount(String(p.pendingAmount));
                            setPayUtr('');
                            setPayRemarks('');
                            setPayError('');
                            setShowPayModal(true);
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors inline-flex items-center space-x-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay Partner</span>
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

      {/* CONFIGURE RULE MODAL (CEO ONLY) */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Percent className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">Configure Payout Percentage Rule</h3>
              </div>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRule} className="mt-4 space-y-3.5 text-xs">
              {ruleError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ruleError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Loan Category</label>
                <select
                  value={ruleLoanType}
                  onChange={(e) => setRuleLoanType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  <option value="New Vehicle Loan">New Vehicle Loan</option>
                  <option value="Commercial Vehicle Loan">Commercial Vehicle Loan</option>
                  <option value="Used Vehicle Loan">Used Vehicle Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Applicable Payout Percentage (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2.0"
                  value={rulePercentage}
                  onChange={(e) => setRulePercentage(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Rule: Future sanctioned loans will snapshot this percentage. Existing loan snapshots remain untouched.
                </p>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Save Payout Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYOUT PAYMENT MODAL */}
      {showPayModal && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Record Partner Commission Payout</h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayout} className="mt-4 space-y-3.5 text-xs">
              {payError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <div><span className="text-slate-500">Partner:</span> <strong className="text-slate-800">{selectedPayout.partnerName}</strong></div>
                <div><span className="text-slate-500">Customer File:</span> <strong className="text-slate-800">{selectedPayout.customerName}</strong></div>
                <div><span className="text-slate-500">Pending Amount:</span> <strong className="text-amber-700 font-mono text-sm">{formatCurrency(selectedPayout.pendingAmount)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank Transfer UTR *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFCPAY202611150029"
                  value={payUtr}
                  onChange={(e) => setPayUtr(e.target.value.toUpperCase())}
                  className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Commission payout tranche remarks"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Payout Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
