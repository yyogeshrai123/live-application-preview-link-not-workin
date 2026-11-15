import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  Car,
  Building2,
  Calendar,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
  UserCheck,
  Shield,
  Eye,
  Edit,
  ArrowRight,
  Trash2,
  Clock,
  Check,
  CheckCircle2,
  FileDiff,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Lead, LeadStatus, LeadChangeRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface LeadsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const leads = storage.getLeads();
  const activeLenders = storage.getLenders(true);
  const allUsers = storage.getUsers();
  const officers = allUsers.filter((u) => u.role === 'OFFICER' && u.isActive);
  const partners = allUsers.filter((u) => u.role === 'PARTNER' && u.isActive);
  const changeRequests = storage.getLeadChangeRequests();
  const pendingRequestsCount = changeRequests.filter((r) => r.status === 'PENDING_CEO').length;

  // Sub Tab for CEO & Admin
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'requests'>('leads');
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('ALL');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLender, setFilterLender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOfficer, setFilterOfficer] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetOfficer, setAssignTargetOfficer] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Edit Request State (Admin requests -> CEO approves)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTargetLead, setEditTargetLead] = useState<Lead | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState('');

  // Delete Request State (Admin requests -> CEO approves)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetLead, setDeleteTargetLead] = useState<Lead | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // CEO Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetRequest, setReviewTargetRequest] = useState<LeadChangeRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [ceoRemarksInput, setCeoRemarksInput] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Lead Form State (All 16 Mandatory fields + optional Channel Partner)
  const [formData, setFormData] = useState({
    customerName: '',
    fatherName: '',
    coApplicantName: '',
    customerContactNumber: '',
    coApplicantContactNumber: '',
    customerAddress: '',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    fileReference: '',
    lenderId: activeLenders[0]?.id || '',
    asmName: activeLenders[0]?.contacts[0]?.asmName || '',
    asmContactNumber: activeLenders[0]?.contacts[0]?.asmContactNumber || '',
    channelPartnerId: currentUser.role === 'PARTNER' ? currentUser.id : '',
    assignedOfficerId: currentUser.role === 'OFFICER' ? currentUser.id : (officers[0]?.id || ''),
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    remarks: '',
  });

  const [formError, setFormError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Handle Lender Selection Change in Form
  const handleLenderChange = (lenderId: string) => {
    const lender = activeLenders.find((l) => l.id === lenderId);
    const primaryContact = lender?.contacts[0];
    setFormData((prev) => ({
      ...prev,
      lenderId,
      asmName: primaryContact?.asmName || 'Regional ASM',
      asmContactNumber: primaryContact?.asmContactNumber || '+91 98765 00000',
    }));
  };

  // Check Duplicates in Real-Time
  const checkDuplicates = (phone: string, vehicle: string) => {
    if (!phone && !vehicle) {
      setDuplicateWarning(null);
      return;
    }
    const res = storage.checkLeadDuplicates(phone, vehicle);
    if (res.duplicateFound) {
      setDuplicateWarning(res.reason || 'Potential duplicate lead detected.');
    } else {
      setDuplicateWarning(null);
    }
  };

  // Submit Lead Form
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      storage.createLead({
        customerName: formData.customerName,
        fatherName: formData.fatherName,
        coApplicantName: formData.coApplicantName,
        customerContactNumber: formData.customerContactNumber,
        coApplicantContactNumber: formData.coApplicantContactNumber,
        customerAddress: formData.customerAddress,
        vehicleNumber: formData.vehicleNumber,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        lenderId: formData.lenderId,
        lenderName: activeLenders.find((l) => l.id === formData.lenderId)?.name || 'HDFC Bank',
        asmName: formData.asmName,
        asmContactNumber: formData.asmContactNumber,
        channelPartnerId: formData.channelPartnerId || undefined,
        assignedOfficerId: currentUser.role === 'OFFICER' ? currentUser.id : formData.assignedOfficerId,
        bankAccount: {
          id: '',
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          maskedAccountNumber: '',
          ifscCode: formData.ifscCode,
        },
        status: 'NEW',
        remarks: formData.remarks,
      });

      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create lead.');
    }
  };

  // Update Status in Detail Modal
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!selectedLead) return;
    try {
      const updated = storage.updateLeadStatus(selectedLead.id, newStatus, 'Status updated via CRM');
      setSelectedLead({ ...updated });
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Lead Reassignment Handler
  const handleAssignLead = () => {
    if (!selectedLead || !assignTargetOfficer) return;
    try {
      const updated = storage.assignLead(selectedLead.id, assignTargetOfficer, assignNotes);
      setSelectedLead({ ...updated });
      setShowAssignModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Edit Request Modal
  const openEditRequestModal = (lead: Lead) => {
    setEditTargetLead(lead);
    setEditFormData({
      customerName: lead.customerName,
      fatherName: lead.fatherName,
      coApplicantName: lead.coApplicantName,
      customerContactNumber: lead.customerContactNumber,
      coApplicantContactNumber: lead.coApplicantContactNumber,
      customerAddress: lead.customerAddress,
      vehicleNumber: lead.vehicleNumber,
      vehicleMake: lead.vehicleMake,
      vehicleModel: lead.vehicleModel,
      lenderId: lead.lenderId,
      asmName: lead.asmName,
      asmContactNumber: lead.asmContactNumber,
      bankName: lead.bankAccount?.bankName || '',
      accountNumber: lead.bankAccount?.accountNumber || '',
      ifscCode: lead.bankAccount?.ifscCode || '',
      remarks: lead.remarks || '',
    });
    setEditReason('');
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditLenderChange = (lenderId: string) => {
    const lender = activeLenders.find((l) => l.id === lenderId);
    const primaryContact = lender?.contacts[0];
    setEditFormData((prev: any) => ({
      ...prev,
      lenderId,
      asmName: primaryContact?.asmName || 'Regional ASM',
      asmContactNumber: primaryContact?.asmContactNumber || '+91 98765 00000',
    }));
  };

  const handleSubmitEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTargetLead) return;
    setEditError('');

    if (!editReason.trim()) {
      setEditError('Reason for requesting lead edit is mandatory.');
      return;
    }

    try {
      const lender = activeLenders.find((l) => l.id === editFormData.lenderId);
      const proposedChanges: Partial<Lead> = {
        customerName: editFormData.customerName,
        fatherName: editFormData.fatherName,
        coApplicantName: editFormData.coApplicantName,
        customerContactNumber: editFormData.customerContactNumber,
        coApplicantContactNumber: editFormData.coApplicantContactNumber,
        customerAddress: editFormData.customerAddress,
        vehicleNumber: editFormData.vehicleNumber,
        vehicleMake: editFormData.vehicleMake,
        vehicleModel: editFormData.vehicleModel,
        lenderId: editFormData.lenderId,
        lenderName: lender?.name || editTargetLead.lenderName,
        asmName: editFormData.asmName,
        asmContactNumber: editFormData.asmContactNumber,
        bankAccount: {
          ...editTargetLead.bankAccount,
          bankName: editFormData.bankName,
          accountNumber: editFormData.accountNumber,
          maskedAccountNumber: '••••' + editFormData.accountNumber.slice(-4),
          ifscCode: editFormData.ifscCode,
        },
        remarks: editFormData.remarks,
      };

      storage.submitLeadEditRequest(editTargetLead.id, proposedChanges, editReason);
      setShowEditModal(false);
      setToastMessage('Lead edit request submitted to CEO for review.');
      setTimeout(() => setToastMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setEditError(err.message || 'Failed to submit edit request.');
    }
  };

  // Open Delete Request Modal
  const openDeleteRequestModal = (lead: Lead) => {
    setDeleteTargetLead(lead);
    setDeleteReason('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleSubmitDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTargetLead) return;
    setDeleteError('');

    if (!deleteReason.trim()) {
      setDeleteError('Reason for requesting lead deletion is mandatory.');
      return;
    }

    try {
      storage.submitLeadDeleteRequest(deleteTargetLead.id, deleteReason);
      setShowDeleteModal(false);
      setToastMessage('Lead deletion request submitted to CEO for review.');
      setTimeout(() => setToastMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to submit deletion request.');
    }
  };

  // Open CEO Review Modal
  const openReviewModal = (req: LeadChangeRequest, action: 'APPROVE' | 'REJECT') => {
    setReviewTargetRequest(req);
    setReviewAction(action);
    setCeoRemarksInput('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleExecuteReview = () => {
    if (!reviewTargetRequest) return;
    setReviewError('');
    try {
      if (reviewAction === 'APPROVE') {
        storage.approveLeadChangeRequest(reviewTargetRequest.id, ceoRemarksInput);
        setToastMessage(`Lead ${reviewTargetRequest.requestType.toLowerCase()} request approved by CEO.`);
      } else {
        storage.rejectLeadChangeRequest(reviewTargetRequest.id, ceoRemarksInput);
        setToastMessage(`Lead ${reviewTargetRequest.requestType.toLowerCase()} request rejected.`);
      }
      setShowReviewModal(false);
      setTimeout(() => setToastMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to process request.');
    }
  };

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerContactNumber.includes(searchTerm) ||
      lead.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.fileReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLender = !filterLender || lead.lenderId === filterLender;
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    const matchesOfficer = !filterOfficer || lead.assignedOfficerId === filterOfficer;

    return matchesSearch && matchesLender && matchesStatus && matchesOfficer;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Lead Management System</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              {filteredLeads.length} Files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end customer onboarding, vehicle verification, and bank loan workflow.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              customerName: '',
              fatherName: '',
              coApplicantName: '',
              customerContactNumber: '',
              coApplicantContactNumber: '',
              customerAddress: '',
              vehicleNumber: '',
              vehicleMake: '',
              vehicleModel: '',
              fileReference: '',
              lenderId: activeLenders[0]?.id || '',
              asmName: activeLenders[0]?.contacts[0]?.asmName || '',
              asmContactNumber: activeLenders[0]?.contacts[0]?.asmContactNumber || '',
              channelPartnerId: currentUser.role === 'PARTNER' ? currentUser.id : '',
              assignedOfficerId: currentUser.role === 'OFFICER' ? currentUser.id : (officers[0]?.id || ''),
              bankName: '',
              accountNumber: '',
              ifscCode: '',
              remarks: '',
            });
            setFormError('');
            setDuplicateWarning(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer, phone, vehicle (MH-02...), file ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterLender}
            onChange={(e) => setFilterLender(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="">All Lenders</option>
            {activeLenders.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-medium text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNDER_PROCESS">Under Process</option>
            <option value="SANCTIONED">Sanctioned</option>
            <option value="PARTIALLY_DISBURSED">Partially Disbursed</option>
            <option value="FULLY_DISBURSED">Fully Disbursed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {currentUser.role !== 'OFFICER' && (
            <select
              value={filterOfficer}
              onChange={(e) => setFilterOfficer(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-medium text-slate-700"
            >
              <option value="">All Officers</option>
              {officers.map((off) => (
                <option key={off.id} value={off.id}>{off.fullName}</option>
              ))}
            </select>
          )}

          {(searchTerm || filterLender || filterStatus || filterOfficer) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterLender('');
                setFilterStatus('');
                setFilterOfficer('');
              }}
              className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Customer & File</th>
                <th className="px-4 py-3.5">Vehicle Details</th>
                <th className="px-4 py-3.5">Lender & ASM</th>
                <th className="px-4 py-3.5">Assigned Officer</th>
                <th className="px-4 py-3.5">Sourcing</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{lead.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{lead.fileReference}</div>
                      <div className="text-[11px] text-slate-500">{lead.customerContactNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{lead.vehicleMake} {lead.vehicleModel}</div>
                      <div className="font-mono text-blue-700 font-bold text-[11px]">{lead.vehicleNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{lead.lenderName}</div>
                      <div className="text-[11px] text-slate-500">ASM: {lead.asmName} ({lead.asmContactNumber})</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{lead.salesOfficerName}</div>
                      <div className="text-[11px] text-slate-500">{lead.salesOfficerContactNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {lead.isDirectLead ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Direct Lead
                        </span>
                      ) : (
                        <div className="leading-tight">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Partner DSA
                          </span>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-[120px]">
                            {lead.channelPartnerName}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && (
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setAssignTargetOfficer(lead.assignedOfficerId);
                            setShowAssignModal(true);
                          }}
                          className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                          title="Reassign Officer"
                        >
                          <UserCheck className="w-4 h-4" />
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

      {/* ADD LEAD MODAL (Strictly 16 Mandatory fields, Active Lenders, Auto Officer Assignment, 0 Customer Fee) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Create New Loan CRM Lead</h3>
                <p className="text-xs text-slate-400">All 16 mandatory fields required • Zero customer fees</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {duplicateWarning && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold">Duplicate Notice: </span>
                    <span>{duplicateWarning}</span>
                  </div>
                </div>
              )}

              {/* Automatic Officer Assignment Banner */}
              {currentUser.role === 'OFFICER' && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong>Automatic Officer Assignment Rule:</strong> This lead will be automatically assigned to you ({currentUser.fullName}).
                  </span>
                </div>
              )}

              {/* SECTION 1: Customer & Co-applicant Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-900">
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Customer & Co-Applicant Information (Mandatory)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Father's Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harish Kumar"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98111 22334"
                      value={formData.customerContactNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, customerContactNumber: e.target.value });
                        checkDuplicates(e.target.value, formData.vehicleNumber);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Co-applicant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunita Kumar"
                      value={formData.coApplicantName}
                      onChange={(e) => setFormData({ ...formData, coApplicantName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Co-applicant Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98111 22335"
                      value={formData.coApplicantContactNumber}
                      onChange={(e) => setFormData({ ...formData, coApplicantContactNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Complete Customer Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat 402, Shivam Enclave, Andheri East, Mumbai, Maharashtra 400069"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Vehicle Specs */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-900">
                  <Car className="w-3.5 h-3.5" />
                  <span>2. Vehicle Information (Mandatory)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Vehicle Registration Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="MH-02-CD-4589"
                      value={formData.vehicleNumber}
                      onChange={(e) => {
                        setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() });
                        checkDuplicates(formData.customerContactNumber, e.target.value);
                      }}
                      className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Vehicle Make *</label>
                    <input
                      type="text"
                      required
                      placeholder="Toyota / Hyundai / Tata"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Vehicle Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="Innova Crysta 2.4 VX"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Lender & ASM (Only Active Lenders) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-900">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>3. Active Lender & Area Sales Manager (Mandatory)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Select Active Lender *</label>
                    <select
                      required
                      value={formData.lenderId}
                      onChange={(e) => handleLenderChange(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                    >
                      {activeLenders.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lender ASM Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.asmName}
                      onChange={(e) => setFormData({ ...formData, asmName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Lender ASM Contact *</label>
                    <input
                      type="tel"
                      required
                      value={formData.asmContactNumber}
                      onChange={(e) => setFormData({ ...formData, asmContactNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Customer Bank Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-900">
                  <FileText className="w-3.5 h-3.5" />
                  <span>4. Customer Bank Account Details (Mandatory)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="50100234567890"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full p-2 font-mono border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="HDFC0000128"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Sourcing & Channel Partner (Optional) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-blue-900">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>5. Sourcing & Channel Partner (Optional)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Channel Partner (Leave blank for Direct Lead)
                    </label>
                    <select
                      value={formData.channelPartnerId}
                      disabled={currentUser.role === 'PARTNER'}
                      onChange={(e) => setFormData({ ...formData, channelPartnerId: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white"
                    >
                      <option value="">-- No Channel Partner (Direct Lead) --</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>{p.fullName} ({p.teamName || 'DSA'})</option>
                      ))}
                    </select>
                  </div>
                  {currentUser.role !== 'OFFICER' && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Assigned Sales Officer</label>
                      <select
                        value={formData.assignedOfficerId}
                        onChange={(e) => setFormData({ ...formData, assignedOfficerId: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white"
                      >
                        {officers.map((off) => (
                          <option key={off.id} value={off.id}>{off.fullName} ({off.phoneNumber})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">File Remarks / Notes</label>
                    <input
                      type="text"
                      placeholder="CIBIL profile, specific customer requirements, delivery date..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-sm"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAILS DRAWER / MODAL */}
      {selectedLead && !showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base">{selectedLead.customerName}</span>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedLead.fileReference}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status Update Quick Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Current Status:</span>
                  <span className="ml-2 font-semibold text-blue-700">{selectedLead.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Update to:</span>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                    className="p-1.5 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                  >
                    <option value="NEW">New</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="DOCUMENTS_RECEIVED">Documents Received</option>
                    <option value="APPLICATION_SUBMITTED">Application Submitted</option>
                    <option value="UNDER_PROCESS">Under Process</option>
                    <option value="SANCTIONED">Sanctioned</option>
                    <option value="PARTIALLY_DISBURSED">Partially Disbursed</option>
                    <option value="FULLY_DISBURSED">Fully Disbursed</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">Customer Info</div>
                  <div><span className="text-slate-500">Father's Name:</span> <strong className="text-slate-800">{selectedLead.fatherName}</strong></div>
                  <div><span className="text-slate-500">Contact:</span> <strong className="text-slate-800">{selectedLead.customerContactNumber}</strong></div>
                  <div><span className="text-slate-500">Co-applicant:</span> <strong className="text-slate-800">{selectedLead.coApplicantName} ({selectedLead.coApplicantContactNumber})</strong></div>
                  <div><span className="text-slate-500">Address:</span> <p className="text-slate-700 mt-0.5">{selectedLead.customerAddress}</p></div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">Vehicle Specs</div>
                  <div><span className="text-slate-500">Reg No:</span> <strong className="font-mono text-blue-700">{selectedLead.vehicleNumber}</strong></div>
                  <div><span className="text-slate-500">Make:</span> <strong className="text-slate-800">{selectedLead.vehicleMake}</strong></div>
                  <div><span className="text-slate-500">Model:</span> <strong className="text-slate-800">{selectedLead.vehicleModel}</strong></div>
                  <div><span className="text-slate-500">Bank Details:</span> <p className="text-slate-700 font-mono mt-0.5">{selectedLead.bankAccount.bankName} - {selectedLead.bankAccount.maskedAccountNumber} ({selectedLead.bankAccount.ifscCode})</p></div>
                </div>
              </div>

              {/* Lender & Sourcing Officer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">Lender & ASM</div>
                  <div><span className="text-slate-500">Lender:</span> <strong className="text-slate-800">{selectedLead.lenderName}</strong></div>
                  <div><span className="text-slate-500">ASM Name:</span> <strong className="text-slate-800">{selectedLead.asmName}</strong></div>
                  <div><span className="text-slate-500">ASM Phone:</span> <strong className="text-slate-800">{selectedLead.asmContactNumber}</strong></div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">Assignment & Partner</div>
                  <div><span className="text-slate-500">Sales Officer:</span> <strong className="text-slate-800">{selectedLead.salesOfficerName} ({selectedLead.salesOfficerContactNumber})</strong></div>
                  <div><span className="text-slate-500">Channel Partner:</span> <strong className="text-slate-800">{selectedLead.isDirectLead ? 'Direct Lead' : selectedLead.channelPartnerName}</strong></div>
                  <div><span className="text-slate-500">Created:</span> <span className="text-slate-600">{new Date(selectedLead.createdAt).toLocaleDateString()} by {selectedLead.createdByName}</span></div>
                </div>
              </div>

              {/* Remarks */}
              {selectedLead.remarks && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800">Remarks: </span>
                  <span className="text-slate-600">{selectedLead.remarks}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && (
                  <button
                    onClick={() => {
                      setAssignTargetOfficer(selectedLead.assignedOfficerId);
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold flex items-center space-x-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reassign Lead</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-semibold ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN OFFICER MODAL */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900">Reassign File to Sales Officer</h3>
            <p className="text-xs text-slate-500 mt-1">Lead: {selectedLead.customerName} ({selectedLead.fileReference})</p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Sales Officer</label>
                <select
                  value={assignTargetOfficer}
                  onChange={(e) => setAssignTargetOfficer(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none bg-white font-semibold"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>{off.fullName} - {off.teamName || 'Sales Team'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reassignment Notes</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Reason for transfer (workload balance, territory assignment...)"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignLead}
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
