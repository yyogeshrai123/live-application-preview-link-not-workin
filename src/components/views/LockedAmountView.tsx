import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Plus,
  ShieldCheck,
  AlertCircle,
  X,
  History,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { DisbursementLock } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface LockedAmountViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LockedAmountView: React.FC<LockedAmountViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const locks = storage.getLocks();
  const loans = storage.getLoans().filter((l) => l.sanctionedAmount > 0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedLock, setSelectedLock] = useState<DisbursementLock | null>(null);

  // Form State: Add Lock
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id || '');
  const [lockedAmount, setLockedAmount] = useState('');
  const [lockReason, setLockReason] = useState('');
  const [lockError, setLockError] = useState('');

  // Form State: Release Lock
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseReason, setReleaseReason] = useState('');
  const [releaseError, setReleaseError] = useState('');

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  const currentLoanFin = selectedLoanId ? storage.calculateLoanFinancials(selectedLoanId) : null;

  const handleCreateLock = (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');

    const amt = parseFloat(lockedAmount);
    if (isNaN(amt) || amt <= 0) {
      setLockError('Please enter a valid lock amount.');
      return;
    }

    if (!currentLoanFin) {
      setLockError('Please select a valid sanctioned loan.');
      return;
    }

    if (amt > currentLoanFin.availableBalance) {
      setLockError(
        `Lock amount ₹${amt.toLocaleString('en-IN')} exceeds available balance ₹${currentLoanFin.availableBalance.toLocaleString('en-IN')}.`
      );
      return;
    }

    if (!lockReason.trim()) {
      setLockError('Reason for lock is required.');
      return;
    }

    try {
      storage.addLock(selectedLoanId, amt, lockReason);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setLockError(err.message || 'Failed to create lock.');
    }
  };

  const handleReleaseLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLock) return;
    setReleaseError('');

    const amt = parseFloat(releaseAmount);
    const remaining = selectedLock.lockedAmount - selectedLock.releasedAmount;

    if (isNaN(amt) || amt <= 0) {
      setReleaseError('Please enter a valid release amount.');
      return;
    }

    if (amt > remaining) {
      setReleaseError(`Release amount ₹${amt.toLocaleString('en-IN')} exceeds active remaining lock ₹${remaining.toLocaleString('en-IN')}.`);
      return;
    }

    if (!releaseReason.trim()) {
      setReleaseError('Reason for release is required.');
      return;
    }

    try {
      storage.releaseLock(selectedLock.id, amt, releaseReason);
      setShowReleaseModal(false);
      onRefresh();
    } catch (err: any) {
      setReleaseError(err.message || 'Failed to release lock.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Locked Amount Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              Escrow & Holdbacks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage hypothecation holdbacks, partial releases, and disbursement limits.
          </p>
        </div>

        {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
          <button
            onClick={() => {
              if (loans.length === 0) {
                alert('No sanctioned loans available.');
                return;
              }
              setSelectedLoanId(loans[0]?.id || '');
              setLockedAmount('');
              setLockReason('');
              setLockError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Lock</span>
          </button>
        )}
      </div>

      {/* Formula & Rule Card */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Formula</div>
          <div className="font-mono font-bold text-blue-300">
            Active Locked = Total Locks - Released
          </div>
          <p className="text-[11px] text-slate-400">Multiple locks and partial releases supported per file.</p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Balance Formula</div>
          <div className="font-mono font-bold text-emerald-300">
            Available = Sanctioned - Disbursed - Active Locked
          </div>
          <p className="text-[11px] text-slate-400">Strictly prevents over-disbursement beyond Available Balance.</p>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Compliance</div>
          <div className="font-mono font-bold text-amber-300">
            Immutable Release Ledger
          </div>
          <p className="text-[11px] text-slate-400">Every release logs actor, amount, and reason in audit history.</p>
        </div>
      </div>

      {/* Locks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Customer & Loan</th>
                <th className="px-4 py-3.5">Original Lock</th>
                <th className="px-4 py-3.5">Released Amount</th>
                <th className="px-4 py-3.5">Active Remaining Lock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Reason & Created By</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No active or historical disbursement locks.
                  </td>
                </tr>
              ) : (
                locks.map((lock) => {
                  const remaining = lock.lockedAmount - lock.releasedAmount;
                  return (
                    <tr key={lock.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{lock.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {lock.id}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        {formatCurrency(lock.lockedAmount)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-700">
                        {formatCurrency(lock.releasedAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-mono font-bold text-sm ${remaining > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={lock.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{lock.reason}</div>
                        <div className="text-[10px] text-slate-400">By {lock.createdByName} • {new Date(lock.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        {remaining > 0 && (currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
                          <button
                            onClick={() => {
                              setSelectedLock(lock);
                              setReleaseAmount(String(remaining));
                              setReleaseReason('');
                              setReleaseError('');
                              setShowReleaseModal(true);
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors inline-flex items-center space-x-1"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Release</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LOCK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Create Disbursement Lock</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLock} className="mt-4 space-y-3.5 text-xs">
              {lockError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lockError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Sanctioned Loan *</label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.customerName} - {l.lenderName}
                    </option>
                  ))}
                </select>
              </div>

              {currentLoanFin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Available Balance:</span>
                    <strong className="text-blue-700 font-mono text-sm">{formatCurrency(currentLoanFin.availableBalance)}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount to Lock (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 200000"
                  value={lockedAmount}
                  onChange={(e) => setLockedAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lock Holdback Reason *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Original RTO registration copy pending submission"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
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
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-xs"
                >
                  Confirm Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELEASE LOCK MODAL */}
      {showReleaseModal && selectedLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Release Locked Amount</h3>
              </div>
              <button onClick={() => setShowReleaseModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReleaseLock} className="mt-4 space-y-3.5 text-xs">
              {releaseError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{releaseError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <div><span className="text-slate-500">Customer:</span> <strong className="text-slate-800">{selectedLock.customerName}</strong></div>
                <div><span className="text-slate-500">Total Locked:</span> <strong className="text-slate-800">{formatCurrency(selectedLock.lockedAmount)}</strong></div>
                <div><span className="text-slate-500">Active Remaining:</span> <strong className="text-amber-700 font-mono text-sm">{formatCurrency(selectedLock.lockedAmount - selectedLock.releasedAmount)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Release Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter partial or full remaining amount ({formatCurrency(selectedLock.lockedAmount - selectedLock.releasedAmount)}).
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Release Authorization Reason *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Smart Card verified and scanned copy uploaded to dossier"
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Confirm Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
