import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  MessageSquare,
  Star,
  PlusCircle,
  BarChart3,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { currentOrg } = useAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', currentOrg?.id],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/dashboard', {
        params: { organizationId: currentOrg?.id },
      });
      return res.data.data;
    },
    enabled: !!currentOrg?.id,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalForms: 0,
    activeForms: 0,
    totalResponses: 0,
    averageRating: 0,
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

  return (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300 min-w-0">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            Executive <span className="text-gradient">Feedback Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry, response metrics, and workspace analytics for <span className="text-slate-200 font-semibold">{currentOrg?.name}</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            to="/forms/new"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Form</span>
          </Link>
          <Link
            to="/analytics"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-2 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-brand-400" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-brand-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Forms</span>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3">{summary.totalForms}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Created in workspace
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Published</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3">{summary.activeForms}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> Receiving public responses
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Responses</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3">{summary.totalResponses}</p>
          <p className="text-xs text-slate-500 mt-1">Across all published surveys</p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average CSAT Score</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3">
            {summary.averageRating > 0 ? Math.min(5.0, Math.max(0, Number(summary.averageRating))).toFixed(1) : '0.0'}{' '}
            <span className="text-sm font-normal text-slate-400">/ 5.0</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Satisfaction index</p>
        </div>
      </div>

      {/* Analytics Charts & Top Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart: CSAT Distribution */}
        <div className="lg:col-span-2 glass-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Rating Distribution</h2>
              <p className="text-xs text-slate-400">Breakdown of customer rating scores across forms</p>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full pt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.ratingDistribution || []}>
                <XAxis dataKey="rating" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(dashboardData?.ratingDistribution || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Forms List */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Top Forms</h2>
            <Link to="/forms" className="text-xs text-brand-400 hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {(dashboardData?.topForms || []).map((form: any) => (
              <div
                key={form.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-100 truncate max-w-[180px]">{form.title}</p>
                  <StatusBadge status={form.status} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-brand-400">{form.responseCount}</span>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Responses</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-400" />
            Recent Response Feed
          </h2>
        </div>

        <div className="divide-y divide-slate-800/60">
          {(dashboardData?.recentResponses || []).map((resp: any) => (
            <div key={resp.id} className="py-3.5 flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {resp.respondentName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{resp.respondentName}</p>
                  <p className="text-[11px] text-slate-400">Submitted on <span className="text-slate-300 font-medium">{resp.formTitle}</span></p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500">
                {new Date(resp.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
