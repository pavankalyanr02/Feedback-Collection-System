import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Pagination } from '../components/common/Pagination';
import { SkeletonTable } from '../components/ui/SkeletonLoader';
import { ShieldCheck, Activity } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', currentOrg?.id, page],
    queryFn: async () => {
      const res = await apiClient.get('/audit/logs', {
        params: { organizationId: currentOrg?.id, page, limit: 15 },
      });
      return res.data;
    },
    enabled: !!currentOrg?.id,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          Security Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">Immutable system log of administrative, publish, and form events</p>
      </div>

      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action Event</th>
                  <th className="py-3.5 px-6">Entity</th>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                        <Activity className="w-3 h-3 mr-1" />
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">{log.entity}</td>
                    <td className="py-4 px-6 text-slate-400">{log.user?.email || 'System'}</td>
                    <td className="py-4 px-6 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};
