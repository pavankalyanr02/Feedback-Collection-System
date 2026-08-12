import React from 'react';
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
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Feedback Forms', path: '/forms', icon: FileText },
    { label: 'Form Builder', path: '/forms/new', icon: PlusCircle },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Team & Workspace', path: '/workspace', icon: Users },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 glass-panel min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Logo & Brand */}
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

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
      </div>

      {/* Demo Links Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
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
          className="inline-block w-full text-center py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-medium transition-colors"
        >
          Open Public Form
        </a>
      </div>
    </aside>
  );
};
