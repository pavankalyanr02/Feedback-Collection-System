import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { BarChart3, TrendingUp, Star, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  const { data: formsData } = useQuery({
    queryKey: ['formsListForAnalytics', currentOrg?.id],
    queryFn: async () => {
      const res = await apiClient.get('/forms', { params: { organizationId: currentOrg?.id, limit: 50 } });
      return res.data.data;
    },
    enabled: !!currentOrg?.id,
  });

  const forms = formsData || [];
  const activeFormId = selectedFormId || (forms.length > 0 ? forms[0].id : '');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['formAnalytics', activeFormId],
    queryFn: async () => {
      const res = await apiClient.get(`/forms/${activeFormId}/analytics`);
      return res.data.data;
    },
    enabled: !!activeFormId,
  });

  const COLORS = ['#0c82ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Form Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Form <span className="text-gradient">Analytics Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Deep question-level telemetry and customer response statistics</p>
        </div>

        {forms.length > 0 && (
          <select
            value={activeFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-100 font-semibold text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500"
          >
            {forms.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.title} ({f.responseCount} responses)
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : !analytics ? (
        <EmptyState
          icon={BarChart3}
          title="Select a Feedback Form"
          description="Choose a published feedback form from the dropdown to inspect response trends and statistical distribution."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Submissions</span>
                <p className="text-2xl font-extrabold text-slate-100">{analytics.totalResponses}</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">Daily Trend Peak</span>
                <p className="text-2xl font-extrabold text-slate-100">
                  {analytics.dailyTrends?.length > 0
                    ? Math.max(...analytics.dailyTrends.map((d: any) => d.responses))
                    : 0}{' '}
                  <span className="text-xs font-normal text-slate-400">responses / day</span>
                </p>
              </div>
            </div>
          </div>

          {/* Daily Trend Line Chart */}
          {analytics.dailyTrends?.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                Response Volume Over Time
              </h2>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.dailyTrends}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line type="monotone" dataKey="responses" stroke="#0c82ff" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Question-by-Question Analysis */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-100">Question Metrics Breakdown</h2>

            {analytics.questionStats?.map((q: any, idx: number) => (
              <div key={q.questionId} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <h3 className="text-sm font-bold text-slate-100">
                    Q{idx + 1}: {q.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {q.totalAnswers} Answers Recorded
                  </span>
                </div>

                {q.averageScore !== undefined && (
                  <div className="flex items-center space-x-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-slate-100">
                      Average Score: <span className="text-amber-400 font-extrabold">{q.averageScore}</span>
                    </span>
                  </div>
                )}

                {q.optionStats && (
                  <div className="h-48 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={q.optionStats} layout="vertical">
                        <XAxis type="number" stroke="#64748b" fontSize={11} />
                        <YAxis dataKey="option" type="category" stroke="#64748b" fontSize={11} width={120} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {q.optionStats.map((_: any, i: number) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
