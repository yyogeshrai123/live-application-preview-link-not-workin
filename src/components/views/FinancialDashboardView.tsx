import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Lock,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { MetricCard } from '../common/MetricCard';

interface FinancialDashboardViewProps {
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = () => {
  const fin = storage.getFinancialSummary();

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Executive Financial Dashboard</h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                NUMERIC(18,2) High-Precision Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live enterprise financial KPIs, loan disbursement integrity, and net company DSA revenue.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Company Net Payout</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {formatCurrency(fin.companyNetPayout)}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Sanctioned"
          value={formatCurrency(fin.totalSanctionedAmount)}
          subtitle="Approved by bank underwriters"
          icon={Building2}
          variant="purple"
        />
        <MetricCard
          title="Total Disbursed"
          value={formatCurrency(fin.totalSuccessfulDisbursement)}
          subtitle="Successful bank RTGS/NEFT"
          icon={CreditCard}
          variant="emerald"
        />
        <MetricCard
          title="Pending Disburse"
          value={formatCurrency(fin.pendingDisbursement)}
          subtitle="Sanctioned minus disbursed"
          icon={TrendingUp}
          variant="blue"
        />
        <MetricCard
          title="Active Locked"
          value={formatCurrency(fin.activeLockedAmount)}
          subtitle="Held back under escrow"
          icon={Lock}
          variant="amber"
        />
        <MetricCard
          title="Available Balance"
          value={formatCurrency(fin.availableBalance)}
          subtitle="Safe disbursement headroom"
          icon={ShieldCheck}
          variant="slate"
        />
      </div>

      {/* Revenue & Commission Flow Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Flow Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">DSA Net Commission Waterfall</h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Net: {formatCurrency(fin.companyNetPayout)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">1. Lender Payments Received (+)</span>
                <span className="text-[11px] text-slate-500">Gross commission credited by lending banks</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-sm">{formatCurrency(fin.lenderPaymentsReceived)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">2. Channel Partner Payouts Paid (-)</span>
                <span className="text-[11px] text-slate-500">Commissions disbursed to DSA sourcing partners</span>
              </div>
              <span className="font-mono font-bold text-rose-700 text-sm">{formatCurrency(fin.partnerPayoutPaid)}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950 block">3. Company Net Retained Revenue (=)</span>
                <span className="text-[11px] text-emerald-800 font-medium">Lender Received minus Partner Paid</span>
              </div>
              <span className="font-mono font-black text-emerald-700 text-base">{formatCurrency(fin.companyNetPayout)}</span>
            </div>
          </div>
        </div>

        {/* Partner Payout Liability */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Channel Partner Payout Liabilities</h3>
            <span className="text-xs font-semibold text-slate-500">Snapshot Payout Ledger</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Total Partner Commission Accrued:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(fin.partnerPayoutPayable)}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Total Commission Settled to Partners:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{formatCurrency(fin.partnerPayoutPaid)}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <span className="font-semibold text-amber-950">Pending Partner Payout Liability:</span>
              <span className="font-mono font-bold text-amber-800 text-base">{formatCurrency(fin.partnerPayoutPending)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ABSOLUTE BUSINESS RULE CERTIFICATE */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-800 shadow-md">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 text-xs">
            <h3 className="font-bold text-base text-white">Absolute Regulatory Guarantee: Zero Customer Fees</h3>
            <p className="text-slate-300 leading-relaxed">
              In strict accordance with enterprise policy and financial compliance guidelines, <strong>A ONE FINANCIAL SERVICES</strong> charges ₹0.00 to any loan customer.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-blue-200">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono">NO Processing Fees</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono">NO File Charges</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono">NO Cash Collections</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono">100% Institutional Lender Revenue</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
