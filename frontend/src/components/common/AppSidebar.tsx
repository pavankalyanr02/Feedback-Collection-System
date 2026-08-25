import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  Users,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';

interface AppSidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Feedback Forms', path: '/forms', icon: FileText },
    { label: 'Form Builder', path: '/forms/new', icon: PlusCircle },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Team & Workspace', path: '/workspace', icon: Users },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
  ];

  // Prevent background body scroll when mobile menu drawer is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const renderNavList = () => (
    <div className="space-y-1">
      <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Main Menu
      </p>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onCloseMobileMenu}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-brand-600/20 to-indigo-600/10 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );

  const renderBrandHeader = () => (
    <div className="flex items-center space-x-3 px-3 py-3 mb-6 border-b border-slate-800/60">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
        <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
      </div>
      <div>
        <h1 className="font-extrabold text-base text-slate-100 tracking-tight leading-tight">
          Feedback<span className="text-gradient">Hub</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
          SaaS Analytics Platform
        </p>
      </div>
    </div>
  );

  const renderDemoCard = () => (
    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2 mt-auto">
      <div className="flex items-center justify-between font-semibold text-slate-200">
        <span>Public Demo Form</span>
        <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Test live anonymous feedback submission at `/feedback/csat-survey-2026`.
      </p>
      <a
        href="/feedback/csat-survey-2026"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onCloseMobileMenu}
        className="inline-block w-full text-center py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-medium transition-colors"
      >
        Open Public Form
      </a>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (>= 1024px) */}
      <aside className="w-64 border-r border-slate-800/80 glass-panel min-h-[calc(100vh-4rem)] p-4 flex-col justify-between hidden lg:flex shrink-0">
        <div>
          {renderBrandHeader()}
          {renderNavList()}
        </div>
        {renderDemoCard()}
      </aside>

      {/* Mobile Navigation Drawer (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Slide-in Mobile Drawer Panel */}
          <aside
            className="fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
            aria-label="Mobile Navigation Drawer"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-sm text-slate-100 tracking-tight leading-tight">
                      Feedback<span className="text-gradient">Hub</span>
                    </h1>
                    <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
                      SaaS Analytics Platform
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCloseMobileMenu}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderNavList()}
            </div>

            {renderDemoCard()}
          </aside>
        </div>
      )}
    </>
  );
};
