import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lock,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { DisbursementTransaction, TransferStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { OtpModal } from '../common/OtpModal';

interface DisbursementsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const DisbursementsView: React.FC<DisbursementsViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const disbursements = storage.getDisbursements();
  const loans = storage.getLoans().filter((l) => l.sanctionedAmount > 0);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<DisbursementTransaction | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<TransferStatus>('SUCCESSFUL');
  const [statusReason, setStatusReason] = useState('');

  // Form State
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  // Get active financials for the selected loan
  const currentLoanFin = selectedLoanId ? storage.calculateLoanFinancials(selectedLoanId) : null;

  // Prepare Transfer (Triggers 2FA OTP modal first!)
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid transfer amount.');
      return;
    }

    if (!currentLoanFin) {
      setFormError('No valid loan selected.');
      return;
    }

    if (amt > currentLoanFin.availableBalance) {
      setFormError(
        `Transfer amount ₹${amt.toLocaleString('en-IN')} exceeds available balance ₹${currentLoanFin.availableBalance.toLocaleString('en-IN')}. Cannot over-disburse.`
      );
      return;
    }

    if (!beneficiaryAccount.trim() || !accountHolderName.trim() || !utrNumber.trim()) {
      setFormError('Account number, Account Holder Name, and UTR number are mandatory.');
      return;
    }

    // Pass preliminary checks, request OTP verification
    setShowOtpModal(true);
  };

  // Execute Transfer upon OTP verification
  const handleOtpVerified = () => {
    try {
      storage.addBankTransfer({
        loanId: selectedLoanId,
        transferAmount: parseFloat(transferAmount),
        beneficiaryAccount,
        accountHolderName,
        utrNumber,
        remarks,
        bankProofUrl: 'rtgs_transfer_advice.pdf',
      });

      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Transfer failed.');
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedTxn) return;
    try {
      storage.updateTransferStatus(selectedTxn.id, statusTarget, statusReason);
      setShowStatusModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Disbursement Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
              Verified Banking Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bank transfer ledger, UTR tracking, and Available Balance enforcement.
          </p>
        </div>

        {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
          <button
            onClick={() => {
              if (loans.length === 0) {
                alert('No sanctioned loans available for disbursement. Please sanction a loan first.');
                return;
              }
              setSelectedLoanId(loans[0]?.id || '');
              const matchedLead = storage.getLeads().find((l) => l.id === loans[0]?.leadId);
              setAccountHolderName(loans[0]?.customerName || '');
              setBeneficiaryAccount(matchedLead?.bankAccount?.accountNumber || '');
              setTransferAmount('');
              setUtrNumber('');
              setRemarks('');
              setFormError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank Transfer</span>
          </button>
        )}
      </div>

      {/* Financial Formula Rule Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-200">Disbursement Mathematical Integrity:</div>
            <div className="text-[11px] text-slate-400 font-mono">
              Available Balance = Sanctioned Amount - Total Successful Disbursements - Active Locked Amount
            </div>
          </div>
        </div>
        <div className="text-[11px] bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
          Only <strong className="text-emerald-400">SUCCESSFUL</strong> non-reversed transfers count as disbursed.
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Customer & Beneficiary</th>
                <th className="px-4 py-3.5">Transfer Amount</th>
                <th className="px-4 py-3.5">UTR Reference</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date & Verified By</th>
                <th className="px-4 py-3.5">Remarks</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disbursements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No bank transfers recorded yet.
                  </td>
                </tr>
              ) : (
                disbursements.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{txn.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        A/C: {txn.maskedAccount} ({txn.accountHolderName})
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">
                        {formatCurrency(txn.transferAmount)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-blue-700 text-[11px] bg-blue-50 px-2 py-0.5 rounded">
                        {txn.utrNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {new Date(txn.transferDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">By {txn.verifiedByName || txn.createdByName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-600 truncate max-w-[180px]">{txn.remarks || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setSelectedTxn(txn);
                            setStatusTarget(txn.status);
                            setStatusReason('');
                            setShowStatusModal(true);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                          Modify Status
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

      {/* ADD BANK TRANSFER MODAL (WITH LIVE BALANCE CHECK) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">Record Bank Transfer</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateTransfer} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Sanctioned Loan *</label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => {
                    const lId = e.target.value;
                    setSelectedLoanId(lId);
                    const l = loans.find((item) => item.id === lId);
                    const matchedLead = storage.getLeads().find((lead) => lead.id === l?.leadId);
                    if (l) setAccountHolderName(l.customerName);
                    if (matchedLead) setBeneficiaryAccount(matchedLead.bankAccount.accountNumber);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} - {l.lenderName} (Sanctioned: {formatCurrency(l.sanctionedAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Financial Balance Indicator */}
              {currentLoanFin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sanctioned Loan Amount:</span>
                    <strong className="text-slate-900">{formatCurrency(currentLoanFin.sanctionedAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Already Disbursed:</span>
                    <span className="text-emerald-700 font-semibold">{formatCurrency(currentLoanFin.totalSuccessfulDisbursement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Locked Amount:</span>
                    <span className="text-amber-700 font-semibold">{formatCurrency(currentLoanFin.activeLockedAmount)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-xs">
                    <span className="text-blue-900">Available Balance:</span>
                    <span className="text-blue-700 font-mono text-sm">{formatCurrency(currentLoanFin.availableBalance)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transfer Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 500000"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">UTR / Bank Ref Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="UTRIBIN202611..."
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                    className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Beneficiary Account Number *</label>
                  <input
                    type="text"
                    required
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks / Tranche Details</label>
                <input
                  type="text"
                  placeholder="e.g. First tranche RTGS payment for dealer proforma invoice"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify with 2FA OTP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Challenge Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleOtpVerified}
        title="Authorize Bank Transfer"
        description={`Authorizing transfer of ₹${parseFloat(transferAmount || '0').toLocaleString('en-IN')} to ${accountHolderName} (UTR: ${utrNumber}). Enter 2FA OTP to sign.`}
        actionButtonText="Authorize & Record Transfer"
      />

      {/* MODIFY STATUS MODAL */}
      {showStatusModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900">Modify Transaction Status</h3>
            <p className="text-xs text-slate-500 mt-1">
              Txn: {selectedTxn.utrNumber} • {formatCurrency(selectedTxn.transferAmount)}
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Status</label>
                <select
                  value={statusTarget}
                  onChange={(e) => setStatusTarget(e.target.value as TransferStatus)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  <option value="SUCCESSFUL">SUCCESSFUL (Counts as disbursed)</option>
                  <option value="FAILED">FAILED (Does NOT count as disbursed)</option>
                  <option value="REVERSED">REVERSED (Restores available balance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Status Modification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Beneficiary account mismatch reversal confirmed by bank"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
