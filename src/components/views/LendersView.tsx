import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Lender } from '../../types';

interface LendersViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const LendersView: React.FC<LendersViewProps> = ({ setActiveTab: _setActiveTab, onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const lenders = storage.getLenders(false); // get all lenders including inactive

  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);

  // Form: Add Lender
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [asmName, setAsmName] = useState('');
  const [asmContact, setAsmContact] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // Form: Add Contact
  const [cAsmName, setCAsmName] = useState('');
  const [cAsmContact, setCAsmContact] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cError, setCError] = useState('');

  const handleCreateLender = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !code.trim() || !asmName.trim() || !asmContact.trim()) {
      setError('Lender name, code, ASM name, and ASM contact are mandatory.');
      return;
    }

    try {
      storage.addLender(name, code, asmName, asmContact, email);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add lender.');
    }
  };

  const handleToggleStatus = (lenderId: string) => {
    try {
      storage.toggleLenderStatus(lenderId);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLender) return;
    setCError('');

    if (!cAsmName.trim() || !cAsmContact.trim()) {
      setCError('ASM name and contact number are required.');
      return;
    }

    try {
      storage.addLenderContact(selectedLender.id, cAsmName, cAsmContact, cEmail);
      setShowContactModal(false);
      onRefresh();
    } catch (err: any) {
      setCError(err.message || 'Failed to add contact.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Lender Management</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              {lenders.filter((l) => l.isActive).length} Active Partners
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure partner banks, NBFCs, and Area Sales Managers (ASM). Only active lenders appear in CRM Lead dropdowns.
          </p>
        </div>

        {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
          <button
            onClick={() => {
              setName('');
              setCode('');
              setAsmName('');
              setAsmContact('');
              setEmail('');
              setError('');
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lending Partner</span>
          </button>
        )}
      </div>

      {/* Lenders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lenders.map((lender) => (
          <div
            key={lender.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
              lender.isActive ? 'border-slate-200 hover:border-blue-300' : 'border-slate-200 bg-slate-50/70 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{lender.name}</h3>
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    CODE: {lender.code}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(lender.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-full border transition-colors ${
                    lender.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                  }`}
                  title="Click to toggle status"
                >
                  {lender.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Contacts */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ASM Contacts ({lender.contacts.length})
                </span>
                <div className="space-y-1.5 text-xs">
                  {lender.contacts.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col space-y-0.5">
                      <div className="font-bold text-slate-800">{c.asmName}</div>
                      <div className="flex items-center text-slate-500 text-[11px] space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.asmContactNumber}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center text-slate-500 text-[11px] space-x-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(currentUser.role === 'CEO' || currentUser.role === 'ADMIN') && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedLender(lender);
                    setCAsmName('');
                    setCAsmContact('');
                    setCEmail('');
                    setCError('');
                    setShowContactModal(true);
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add ASM Contact</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD LENDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">Add Lending Institution</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLender} className="mt-4 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lender Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yes Bank"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lender Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YESB"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full p-2 font-mono uppercase border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary ASM Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Varma"
                  value={asmName}
                  onChange={(e) => setAsmName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ASM Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 12345"
                  value={asmContact}
                  onChange={(e) => setAsmContact(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ASM Email Address</label>
                <input
                  type="email"
                  placeholder="asm@bank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showContactModal && selectedLender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add ASM Contact ({selectedLender.name})</h3>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="mt-4 space-y-3.5 text-xs">
              {cError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ASM Full Name *</label>
                <input
                  type="text"
                  required
                  value={cAsmName}
                  onChange={(e) => setCAsmName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">ASM Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={cAsmContact}
                  onChange={(e) => setCAsmContact(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 shadow-xs"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
