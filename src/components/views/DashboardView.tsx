import React from 'react';
import {
  Users,
  CreditCard,
  Building2,
  FileCheck,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  Shield,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { MetricCard } from '../common/MetricCard';
import { StatusBadge } from '../common/StatusBadge';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const currentUser = storage.getCurrentUser();
  const role = currentUser.role;

  const leads = storage.getLeads();
  const loans = storage.getLoans();
  const finSummary = storage.getFinancialSummary();
  const idRequests = storage.getIdRequests();
  const pendingApprovals = idRequests.filter(
    (r) => (role === 'ADMIN' && r.status === 'PENDING_ADMIN') || (role === 'CEO' && r.status === 'PENDING_CEO')
  );

  const formatCurrency = (amt: number) => {
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>A ONE FINANCIAL SERVICES – Executive Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.fullName}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Logged in as <strong className="text-white underline decoration-blue-500 underline-offset-4">{role}</strong>.
            {role === 'CEO' && ' You have executive authority over disbursements, partner payout rules, locked amounts and final KYC approvals.'}
            {role === 'ADMIN' && ' Manage loan files, verify authorized bank transfers, and perform first-level KYC screening.'}
            {role === 'MANAGER' && ' Supervise your sales team pipeline, track ID requests and assign leads.'}
            {role === 'OFFICER' && ' Create customer leads (auto-assigned to you), update file statuses, and track sanctions.'}
            {role === 'PARTNER' && ' Submit loan leads, monitor real-time file approvals and track your DSA conversion.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('leads')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{role === 'PARTNER' ? 'Submit New Lead' : 'Create Customer Lead'}</span>
            </button>
            {(role === 'CEO' || role === 'ADMIN') && (
              <button
                onClick={() => setActiveTab('financial')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Financial Dashboard</span>
              </button>
            )}
            {pendingApprovals.length > 0 && (
              <button
                onClick={() => setActiveTab('id-requests')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>{pendingApprovals.length} Approval(s) Awaiting You</span>
              </button>
            )}
          </div>
        </div>

        {/* Background decorative watermark */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
          <Shield className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Leads"
          value={leads.length}
          subtitle={role === 'PARTNER' ? 'Submitted by your agency' : 'In your active pipeline'}
          icon={Users}
          variant="blue"
        />

        {(role === 'CEO' || role === 'ADMIN') ? (
          <>
            <MetricCard
              title="Sanctioned Amount"
              value={formatCurrency(finSummary.totalSanctionedAmount)}
              subtitle="Total sanctioned loans"
              icon={Building2}
              variant="purple"
            />
            <MetricCard
              title="Total Disbursed"
              value={formatCurrency(finSummary.totalSuccessfulDisbursement)}
              subtitle="Successful bank transfers"
              icon={CreditCard}
              variant="emerald"
            />
            <MetricCard
              title="Company Net Payout"
              value={formatCurrency(finSummary.companyNetPayout)}
              subtitle="Lender Received - Partner Paid"
              icon={TrendingUp}
              variant="amber"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Active Loans"
              value={loans.length}
              subtitle="Under process / sanctioned"
              icon={Building2}
              variant="purple"
            />
            <MetricCard
              title="Sanctioned Files"
              value={leads.filter((l) => l.status === 'SANCTIONED' || l.status === 'PARTIALLY_DISBURSED' || l.status === 'FULLY_DISBURSED').length}
              subtitle="Approved by lenders"
              icon={CheckCircle2}
              variant="emerald"
            />
            <MetricCard
              title="Pending KYC Approvals"
              value={idRequests.filter((r) => r.status.startsWith('PENDING')).length}
              subtitle="Onboarding pipeline"
              icon={FileCheck}
              variant="amber"
            />
          </>
        )}
      </div>

      {/* Action Highlights & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Recent Leads & Applications</h2>
              <p className="text-xs text-slate-500">Live status of customer files</p>
            </div>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Customer & File</th>
                  <th className="px-4 py-3">Vehicle Details</th>
                  <th className="px-4 py-3">Lender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{lead.customerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{lead.fileReference}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{lead.vehicleMake} {lead.vehicleModel}</div>
                      <div className="text-[11px] font-mono text-blue-700 font-semibold">{lead.vehicleNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{lead.lenderName}</div>
                      <div className="text-[11px] text-slate-500">ASM: {lead.asmName}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setActiveTab('leads')}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance & Workflow Quick Card */}
        <div className="space-y-6">
          {/* Zero Customer Fee Guarantee Box */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-5 border border-blue-800 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-300 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Regulatory Compliance</h3>
            </div>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>Zero Customer Fee Policy:</strong> A ONE Financial Services does NOT charge any upfront, processing, or file fees to customers.
              </p>
              <div className="p-2.5 rounded-lg bg-white/10 text-[11px] text-blue-200">
                All DSA revenues are derived strictly from lender commissions and payouts.
              </div>
            </div>
          </div>

          {/* Pending ID Approvals Widget (CEO/Admin/Manager) */}
          {(role === 'CEO' || role === 'ADMIN' || role === 'MANAGER') && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">KYC Onboarding Queue</h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {idRequests.filter((r) => r.status.startsWith('PENDING')).length} Pending
                </span>
              </div>
              <div className="space-y-3">
                {idRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{req.fullName}</div>
                      <div className="text-[11px] text-slate-500">{req.requestedRole} • PAN: {req.panNumber}</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('id-requests')}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Reminders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Follow-ups</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Next 48 hrs</span>
            </div>
            <div className="space-y-2 text-xs">
              {leads.filter((l) => l.followUpDate).slice(0, 2).map((l) => (
                <div key={l.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{l.customerName}</span>
                    <span className="text-blue-700 font-mono text-[11px]">{new Date(l.followUpDate!).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{l.remarks}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
