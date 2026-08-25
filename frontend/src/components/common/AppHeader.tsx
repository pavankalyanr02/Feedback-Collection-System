import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Building2, LogOut, ChevronDown, Menu, X } from 'lucide-react';

interface AppHeaderProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { user, organizations, currentOrg, setCurrentOrg, logout } = useAuth();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 glass-panel px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Organization Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-slate-800 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative">
        <button
          onClick={() => setShowOrgDropdown(!showOrgDropdown)}
          className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            {currentOrg?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Workspace</p>
            <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              {currentOrg?.name || 'Acme Tech'}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </p>
          </div>
        </button>

        {showOrgDropdown && (
          <div className="absolute top-12 left-0 w-64 glass-panel border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="text-xs font-semibold text-slate-400 px-3 py-1.5">Select Workspace</p>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setCurrentOrg(org);
                  setShowOrgDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors ${
                  currentOrg?.id === org.id
                    ? 'bg-brand-500/10 text-brand-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="truncate">{org.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Right: Notifications, Theme Toggle, User Profile */}
      <div className="flex items-center space-x-3">
        <button
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-950 animate-pulse"></span>
        </button>

        <ThemeToggle />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-900/60 transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-sm font-medium text-slate-200 hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-12 w-56 glass-panel border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                <p className="text-sm font-semibold text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
