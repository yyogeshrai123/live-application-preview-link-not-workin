import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Building2,
  FileCheck,
  AlertCircle,
  X,
  Shield,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface LenderPaymentsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LenderPaymentsView: React.FC<LenderPaymentsViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const payments = storage.getLenderPayments();
  const lenders = storage.getLenders(true);
  const loans = storage.getLoans().filter((l) => l.sanctionedAmount > 0);

  const [showModal, setShowModal] = useState(false);
  const [selectedLenderId, setSelectedLenderId] = useState(lenders[0]?.id || '');
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || '');
  const [amountReceived, setAmountReceived] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [bankDetails, setBankDetails] = useState('Current Account #0099120034 A ONE FINANCIAL');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amountReceived);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount received.');
      return;
    }
    if (!transactionRef.trim()) {
      setError('Transaction reference / UTR is required.');
      return;
    }

    try {
      storage.recordLenderPayment({
        lenderId: selectedLenderId,
        loanId: selectedLoanId,
        amountReceived: amt,
        receiptDate,
        transactionReference: transactionRef,
        bankDetails,
        remarks,
      });

      setShowModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to record lender payment.');
    }
  };

  const totalReceived = payments.reduce((acc, curr) => acc + curr.amountReceived, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Lender Payments Received</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
              DSA Commission Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation of commission payouts received from lending institutions. Strictly private to CEO/Admin.
          </p>
        </div>

        {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
          <button
            onClick={() => {
              if (loans.length === 0) {
                alert('No loans available to link.');
                return;
              }
              setAmountReceived('');
              setTransactionRef('');
              setRemarks('');
              setError('');
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Received Payment</span>
          </button>
        )}
      </div>

      {/* Summary Stat */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Commission Received from Lenders</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {formatCurrency(totalReceived)}
          </div>
        </div>
        <div className="p-3 bg-white/10 rounded-xl text-emerald-400">
          <ArrowDownLeft className="w-6 h-6" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Lender & Customer</th>
                <th className="px-4 py-3.5">Sanctioned Amount</th>
                <th className="px-4 py-3.5">Amount Received</th>
                <th className="px-4 py-3.5">Receipt Date</th>
                <th className="px-4 py-3.5">Transaction Reference</th>
                <th className="px-4 py-3.5">Credited Bank Account</th>
                <th className="px-4 py-3.5">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No lender payment receipts recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{p.lenderName}</div>
                      <div className="text-slate-500 text-[11px]">Customer: {p.customerName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">
                      {formatCurrency(p.sanctionedAmount)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700 text-sm">
                      {formatCurrency(p.amountReceived)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">
                      {p.receiptDate}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700 text-[11px]">
                      {p.transactionReference}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {p.bankDetails}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {p.recordedByName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Record Lender Payout Receipt</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Lending Bank *</label>
                <select
                  required
                  value={selectedLenderId}
                  onChange={(e) => setSelectedLenderId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {lenders.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Link to Loan File *</label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} (Sanction: {formatCurrency(l.sanctionedAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Amount Received (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 21250"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bank UTR / Transaction Ref *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI-COMM-20261114-88"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value.toUpperCase())}
                  className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Credited Account Details</label>
                <input
                  type="text"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. 2.5% DSA payout credit advice received"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
