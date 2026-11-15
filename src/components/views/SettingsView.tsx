import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  Server,
  Smartphone,
  Mail,
  MessageSquare,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface SettingsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const currentUser = storage.getCurrentUser();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleResetData = () => {
    storage.resetToSeed();
    setShowConfirmModal(false);
    setToastMsg('All demo data has been reset to clean production state!');
    setTimeout(() => setToastMsg(null), 3500);
    onRefresh();
  };

  const integrationList = [
    {
      name: 'SMS Gateway (Twilio / Fast2SMS)',
      desc: 'SMS alerts for loan sanctions, disbursement UTR, and OTP authorization challenges.',
      status: 'CONFIG_READY',
      envVar: 'SMS_GATEWAY_API_KEY',
    },
    {
      name: 'WhatsApp Business API (Meta)',
      desc: 'Direct customer notifications for document receipt and disbursement notices.',
      status: 'CONFIG_READY',
      envVar: 'WHATSAPP_API_KEY',
    },
    {
      name: 'Private KYC Object Storage (S3 / R2)',
      desc: 'Encrypted object storage bucket for customer PAN, Aadhaar, Cheque, and Bank statements.',
      status: 'CONFIG_READY',
      envVar: 'STORAGE_ACCESS_KEY_ID',
    },
    {
      name: 'Corporate SMTP Mail Relay',
      desc: 'Transaction receipts, partner payout notifications, and executive daily digests.',
      status: 'CONFIG_READY',
      envVar: 'SMTP_HOST',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings & Architecture</h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
            v1.0.0 Production Ready
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          A ONE FINANCIAL SERVICES – Loan CRM & DSA Sourcing Management Infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm">Enterprise Profile</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Company Name:</span>
              <strong className="text-slate-900 font-bold">A ONE FINANCIAL SERVICES</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Industry:</span>
              <span className="text-slate-800 font-semibold">Direct Selling Agent (DSA) & Loan CRM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Primary Product:</span>
              <span className="text-slate-800 font-semibold">New & Pre-Owned Vehicle Loans</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Customer Fee Policy:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                ₹0.00 (Zero Fee Absolute Rule)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Current Session User:</span>
              <span className="text-blue-700 font-bold">{currentUser.fullName} ({currentUser.role})</span>
            </div>
          </div>
        </div>

        {/* Demo Credentials Guide */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm">Five Roles Demo Access</h3>
          </div>

          <p className="text-xs text-slate-500">
            Default Demo Password for all accounts: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-700">Password@123</code>
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">CEO: Rajesh Singhania</span>
                <div className="text-[11px] text-slate-500 font-mono">ceo@aonefinancial.com</div>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">CEO</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Admin: Neha Sharma</span>
                <div className="text-[11px] text-slate-500 font-mono">admin@aonefinancial.com</div>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">ADMIN</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Manager: Vikram Malhotra</span>
                <div className="text-[11px] text-slate-500 font-mono">manager@aonefinancial.com</div>
              </div>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">MANAGER</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Officer: Amit Verma</span>
                <div className="text-[11px] text-slate-500 font-mono">officer.amit@aonefinancial.com</div>
              </div>
              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">OFFICER</span>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Partner: Sunita Joshi</span>
                <div className="text-[11px] text-slate-500 font-mono">partner.sunita@finserve.com</div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">PARTNER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database & Demo State Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-sm">Demo Data & Production State Management</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Clean State Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Purge mock session modifications and restore the pristine seed data
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data to Clean State</span>
          </button>
        </div>

        {/* Dataset Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Active Users</span>
            <span className="text-base font-extrabold text-slate-900">7 Accounts</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">5 distinct roles</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Lenders</span>
            <span className="text-base font-extrabold text-slate-900">10 Institutions</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">HDFC, ICICI, etc.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Loan Leads</span>
            <span className="text-base font-extrabold text-slate-900">4 Sourced</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">16 fields validated</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Loan Volume</span>
            <span className="text-base font-extrabold text-slate-900">₹35.50 Lakh</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">3 active loans</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Disbursed</span>
            <span className="text-base font-extrabold text-slate-900">₹11.00 Lakh</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">₹2L active lock</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 block">Customer Fees</span>
            <span className="text-base font-extrabold text-emerald-700">₹0.00</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Strict zero fee</span>
          </div>
        </div>
      </div>

      {/* Integration Readiness Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">External Provider Integration Architecture</h3>
            <p className="text-xs text-slate-500">Ready for plug-and-play credentials when deploying to live cloud</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold">
            See .env.example
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrationList.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Pending Credentials
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              <div className="text-[10px] font-mono text-slate-400 bg-white p-1.5 rounded border border-slate-200 truncate">
                Variable: {item.envVar}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Reset Demo Data?</h3>
                <p className="text-xs text-slate-500">Restore clean production state</p>
              </div>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to restore the entire CRM to its initial clean production state?
              </p>
              <p className="text-slate-500 text-[11px]">
                All mock leads, bank transfers, locked amounts, ID requests, and notifications will be reset to the verified clean baseline.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
