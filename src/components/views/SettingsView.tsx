import React from 'react';
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
} from 'lucide-react';
import { storage } from '../../services/storage';

interface SettingsViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const currentUser = storage.getCurrentUser();

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
    </div>
  );
};
