import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { LeadsView } from './components/views/LeadsView';
import { LoansView } from './components/views/LoansView';
import { DisbursementsView } from './components/views/DisbursementsView';
import { LockedAmountView } from './components/views/LockedAmountView';
import { LenderPaymentsView } from './components/views/LenderPaymentsView';
import { PartnerPayoutsView } from './components/views/PartnerPayoutsView';
import { LendersView } from './components/views/LendersView';
import { IdRequestsView } from './components/views/IdRequestsView';
import { FinancialDashboardView } from './components/views/FinancialDashboardView';
import { ReportsView } from './components/views/ReportsView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { SettingsView } from './components/views/SettingsView';
import { storage } from './services/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'leads':
        return <LeadsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'loans':
        return <LoansView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'disbursements':
        return <DisbursementsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'locks':
        return <LockedAmountView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'lender-payments':
        return <LenderPaymentsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'partner-payouts':
        return <PartnerPayoutsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'lenders':
        return <LendersView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'id-requests':
        return <IdRequestsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'financial':
        return <FinancialDashboardView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'reports':
        return <ReportsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'audit-logs':
        return <AuditLogsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      case 'settings':
        return <SettingsView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} onRefresh={handleRefresh} />;
    }
  };

  return (
    <div key={refreshKey} className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </div>

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 bg-white text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              &copy; {new Date().getFullYear()} <strong className="text-slate-800">A ONE FINANCIAL SERVICES</strong>. All rights reserved.
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="font-semibold text-emerald-700">Zero Customer Fees Guaranteed</span>
              <span>•</span>
              <span>NUMERIC(18,2) Financial Engine</span>
              <span>•</span>
              <span>DSA Loan CRM</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
