import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  FileText,
  UserCheck,
  Clock,
  Eye,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { IdRequest, UserRole } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface IdRequestsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const IdRequestsView: React.FC<IdRequestsViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const requests = storage.getIdRequests();
  const managers = storage.getUsers().filter((u) => u.role === 'MANAGER' && u.isActive);

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<IdRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionError, setActionError] = useState('');

  // Submit Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [requestedRole, setRequestedRole] = useState<UserRole>('OFFICER');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [assignedManagerId, setAssignedManagerId] = useState(managers[0]?.id || '');
  const [remarks, setRemarks] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !mobileNumber.trim() || !email.trim() || !panNumber.trim() || !aadhaarNumber.trim()) {
      setFormError('All personal identity and contact fields are required.');
      return;
    }

    try {
      storage.submitIdRequest({
        fullName,
        mobileNumber,
        email,
        address,
        requestedRole,
        panNumber: panNumber.toUpperCase(),
        aadhaarNumber,
        bankAccountDetails: {
          bankName,
          accountNumber,
          ifscCode: ifscCode.toUpperCase(),
        },
        assignedManagerId: currentUser.role === 'MANAGER' ? currentUser.id : assignedManagerId,
        documents: {
          panCardUrl: `${panNumber.toLowerCase()}_pan_doc.pdf`,
          aadhaarCardUrl: `${panNumber.toLowerCase()}_aadhaar_doc.pdf`,
          cancelledChequeUrl: `${panNumber.toLowerCase()}_cheque_doc.pdf`,
          bankStatementUrl: `${panNumber.toLowerCase()}_statement_doc.pdf`,
        },
        remarks,
      });

      setShowSubmitModal(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit ID request.');
    }
  };

  const handleAdminReview = (approve: boolean) => {
    if (!selectedReq) return;
    try {
      storage.adminReviewIdRequest(selectedReq.id, approve, reviewRemarks);
      setSelectedReq(null);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCeoFinalApprove = (approve: boolean) => {
    if (!selectedReq) return;
    try {
      storage.ceoFinalApproveIdRequest(selectedReq.id, approve, reviewRemarks);
      setSelectedReq(null);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">KYC User Onboarding & Approvals</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              Multi-Tier Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manager ID Request Submission &rarr; Admin KYC Verification &rarr; Final CEO Authorization.
          </p>
        </div>

        {(currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN' || currentUser.role === 'CEO') && (
          <button
            onClick={() => {
              setFullName('');
              setMobileNumber('');
              setEmail('');
              setAddress('');
              setPanNumber('');
              setAadhaarNumber('');
              setBankName('HDFC Bank');
              setAccountNumber('');
              setIfscCode('HDFC0000128');
              setRemarks('');
              setFormError('');
              setShowSubmitModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New ID Request</span>
          </button>
        )}
      </div>

      {/* Workflow Stage Visualizer */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Onboarding Approval Protocol
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center space-x-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Manager Submission</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Sales Manager collects KYC documents (PAN, Aadhaar, Cheque, Bank Statement) and initiates request.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center space-x-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Admin Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Admin screens KYC proofs, verifies bank details, and forwards compliant files to CEO.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center space-x-2 font-bold text-slate-200 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>CEO Final Activation</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              CEO gives final mandatory approval. Account automatically created and active with immediate login.
            </p>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Applicant & Contact</th>
                <th className="px-4 py-3.5">Requested Role</th>
                <th className="px-4 py-3.5">KYC Identity (PAN / Aadhaar)</th>
                <th className="px-4 py-3.5">Submitted By</th>
                <th className="px-4 py-3.5">Current Stage / Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No ID requests found in your jurisdiction.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{req.fullName}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{req.email}</div>
                      <div className="text-slate-500 text-[11px]">{req.mobileNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        {req.requestedRole}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-slate-800 font-semibold">PAN: {req.panNumber}</div>
                      <div className="font-mono text-slate-500 text-[11px]">Aadhaar: {req.aadhaarNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{req.submittedByName}</div>
                      <div className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setReviewRemarks('');
                          setActionError('');
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Review Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBMIT ID REQUEST MODAL (MANAGER/ADMIN/CEO) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Submit KYC ID Request</h3>
                <p className="text-xs text-slate-400">Onboarding application for Sales Officer or Channel Partner</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavita Rawat"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Requested Role *</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as UserRole)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                  >
                    <option value="OFFICER">Sales Officer</option>
                    <option value="PARTNER">Channel Partner (DSA)</option>
                    {currentUser.role === 'CEO' && <option value="MANAGER">Sales Team Manager</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98999 88771"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kavita@partner.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Residential / Agency Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Shop 14, Commercial Complex, Sector 18, Noida, Uttar Pradesh"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PAN Card Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Aadhaar Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="9876 5432 1098"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="50100998877665"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Remarks & Sourcing History</label>
                  <input
                    type="text"
                    placeholder="Experience, sourcing volume, certifications..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Uploads Checklist Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Required KYC Documents Attached:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <span className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>PAN Card Copy</span></span>
                  <span className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>Aadhaar Card Front/Back</span></span>
                  <span className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>Cancelled Cheque</span></span>
                  <span className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> <span>6-Month Bank Statement</span></span>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Submit for Admin Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW DOSSIER MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base">{selectedReq.fullName}</span>
                  <StatusBadge status={selectedReq.status} />
                </div>
                <p className="text-xs text-slate-400">KYC Verification Dossier • {selectedReq.requestedRole}</p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {actionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div><span className="text-slate-500">Email:</span> <strong className="text-slate-800">{selectedReq.email}</strong></div>
                <div><span className="text-slate-500">Mobile:</span> <strong className="text-slate-800">{selectedReq.mobileNumber}</strong></div>
                <div><span className="text-slate-500">PAN:</span> <strong className="font-mono text-slate-800">{selectedReq.panNumber}</strong></div>
                <div><span className="text-slate-500">Aadhaar:</span> <strong className="font-mono text-slate-800">{selectedReq.aadhaarNumber}</strong></div>
                <div className="col-span-2"><span className="text-slate-500">Address:</span> <p className="text-slate-700 mt-0.5">{selectedReq.address}</p></div>
              </div>

              {/* Bank Details */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Bank Payout Account</span>
                <div className="text-slate-700 font-mono">
                  {selectedReq.bankAccountDetails.bankName} - {selectedReq.bankAccountDetails.accountNumber} ({selectedReq.bankAccountDetails.ifscCode})
                </div>
              </div>

              {/* History & Remarks */}
              {selectedReq.adminRemarks && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold">Admin Review Notes ({selectedReq.adminReviewedByName}): </span>
                  <span>{selectedReq.adminRemarks}</span>
                </div>
              )}

              {/* Approval Actions according to Role and Stage */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <label className="block text-slate-700 font-semibold">Review / Approval Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Enter verification notes, NSDL match confirmation, or rejection reason..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setSelectedReq(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <div className="space-x-2">
                    {/* Admin Tier: Approve/Reject when PENDING_ADMIN */}
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'CEO') && selectedReq.status === 'PENDING_ADMIN' && (
                      <>
                        <button
                          onClick={() => handleAdminReview(false)}
                          className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl"
                        >
                          Reject KYC
                        </button>
                        <button
                          onClick={() => handleAdminReview(true)}
                          className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 font-bold rounded-xl"
                        >
                          Verify & Forward to CEO
                        </button>
                      </>
                    )}

                    {/* CEO Tier: Final Approval when PENDING_CEO */}
                    {currentUser.role === 'CEO' && selectedReq.status === 'PENDING_CEO' && (
                      <>
                        <button
                          onClick={() => handleCeoFinalApprove(false)}
                          className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl"
                        >
                          Reject Account
                        </button>
                        <button
                          onClick={() => handleCeoFinalApprove(true)}
                          className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl shadow-xs"
                        >
                          CEO Final Approve & Activate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
