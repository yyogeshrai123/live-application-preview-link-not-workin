import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Lock,
  ArrowDownLeft,
  DollarSign,
  FileCheck,
  BarChart3,
  ScrollText,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const currentUser = storage.getCurrentUser();
  const role = currentUser.role;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER'],
    },
    {
      id: 'leads',
      label: 'Lead Management',
      icon: Users,
      roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER'],
    },
    {
      id: 'loans',
      label: 'Loan Applications',
      icon: FileText,
      roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER'],
    },
    {
      id: 'disbursements',
      label: 'Disbursements (Bank Transfers)',
      icon: CreditCard,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'locks',
      label: 'Locked Amounts',
      icon: Lock,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'lender-payments',
      label: 'Lender Payments Received',
      icon: ArrowDownLeft,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'partner-payouts',
      label: 'Partner Payouts & Rules',
      icon: DollarSign,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'lenders',
      label: 'Lender Management',
      icon: Building2,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'id-requests',
      label: 'KYC Onboarding & Approvals',
      icon: FileCheck,
      roles: ['CEO', 'ADMIN', 'MANAGER'],
      badge: 'Workflow',
    },
    {
      id: 'financial',
      label: 'Financial Dashboard',
      icon: BarChart3,
      roles: ['CEO', 'ADMIN'],
      badge: 'KPIs',
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: FileText,
      roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER'],
    },
    {
      id: 'audit-logs',
      label: 'Security Audit Logs',
      icon: ScrollText,
      roles: ['CEO', 'ADMIN'],
    },
    {
      id: 'settings',
      label: 'Company Settings & Info',
      icon: Settings,
      roles: ['CEO', 'ADMIN', 'MANAGER', 'OFFICER', 'PARTNER'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[120px]">
                  {currentUser.fullName}
                </p>
                <div className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/40 text-blue-300 border border-blue-700/40">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Policy Badge */}
        <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5 text-blue-400 font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Customer Fee Policy</span>
          </div>
          <p className="leading-tight text-slate-400">
            Absolute Rule: ₹0 fees charged to customers by A ONE Financial Services.
          </p>
        </div>
      </aside>
    </>
  );
};
