import React, { useState } from 'react';
import {
  Shield,
  Bell,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Key,
  CheckCircle,
  Menu,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeTab: _activeTab,
  setActiveTab,
  onRefresh,
}) => {
  const currentUser = storage.getCurrentUser();
  const notifications = storage.getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    storage.setCurrentUser(role);
    setShowRoleMenu(false);
    onRefresh();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean production state?')) {
      storage.resetToSeed();
      onRefresh();
    }
  };

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'CEO', label: 'CEO', desc: 'Full system control & final approvals' },
    { role: 'ADMIN', label: 'Admin', desc: 'Operations & transaction verification' },
    { role: 'MANAGER', label: 'Sales Team Manager', desc: 'Team pipeline & ID requests' },
    { role: 'OFFICER', label: 'Sales Officer', desc: 'Lead creation & auto-assignment' },
    { role: 'PARTNER', label: 'Channel Partner', desc: 'Partner lead submission portal' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-md border border-blue-400/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    A ONE FINANCIAL SERVICES
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600/30 text-blue-300 rounded border border-blue-500/30">
                    DSA CRM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Loan CRM & Channel Partner Management</p>
              </div>
            </div>
          </div>

          {/* Center/Right: Quick Role Switcher, Notifications, Demo Credentials */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick 1-Click Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                title="Switch active role to test permissions"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-slate-400 hidden sm:inline">Role:</span>
                <span className="font-bold text-white bg-blue-600/40 px-1.5 py-0.5 rounded border border-blue-500/40">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Perspective
                    </p>
                    <p className="text-[11px] text-slate-500">Test role-based privacy & permissions</p>
                  </div>
                  <div className="py-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => handleRoleChange(r.role)}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          currentUser.role === r.role ? 'bg-blue-900/30 text-blue-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">{r.label}</div>
                          <div className="text-[10px] text-slate-400">{r.desc}</div>
                        </div>
                        {currentUser.role === r.role && <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                    </div>
                    <span className="text-[11px] bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded font-medium">
                      {unreadCount} unread
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            storage.markNotificationAsRead(n.id);
                            if (n.link) setActiveTab(n.link);
                            setShowNotifications(false);
                            onRefresh();
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-800/50 transition-colors ${
                            !n.isRead ? 'bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Credentials Modal Trigger */}
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Demo Credentials"
            >
              <Key className="w-5 h-5" />
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={handleResetData}
              className="p-2 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Current User Chip */}
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center font-bold text-white text-[11px]">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Demo User Credentials</h3>
                  <p className="text-xs text-slate-500">Universal Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-blue-700">Password@123</code></p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentials(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">1. CEO: Rajesh Singhania</div>
                  <div className="text-slate-500 font-mono">ceo@aonefinancial.com</div>
                </div>
                <button
                  onClick={() => { handleRoleChange('CEO'); setShowCredentials(false); }}
                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Switch
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">2. Admin: Neha Sharma</div>
                  <div className="text-slate-500 font-mono">admin@aonefinancial.com</div>
                </div>
                <button
                  onClick={() => { handleRoleChange('ADMIN'); setShowCredentials(false); }}
                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Switch
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">3. Sales Manager: Vikram Malhotra</div>
                  <div className="text-slate-500 font-mono">manager@aonefinancial.com</div>
                </div>
                <button
                  onClick={() => { handleRoleChange('MANAGER'); setShowCredentials(false); }}
                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Switch
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">4. Sales Officer: Amit Verma</div>
                  <div className="text-slate-500 font-mono">officer.amit@aonefinancial.com</div>
                </div>
                <button
                  onClick={() => { handleRoleChange('OFFICER'); setShowCredentials(false); }}
                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Switch
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">5. Channel Partner: Sunita Joshi</div>
                  <div className="text-slate-500 font-mono">partner.sunita@finserve.com</div>
                </div>
                <button
                  onClick={() => { handleRoleChange('PARTNER'); setShowCredentials(false); }}
                  className="px-2.5 py-1 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  Switch
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCredentials(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
