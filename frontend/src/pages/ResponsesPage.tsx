import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { Pagination } from '../components/common/Pagination';
import { SkeletonTable } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Download, MessageSquare, Eye, X, User as UserIcon } from 'lucide-react';

export const ResponsesPage: React.FC = () => {
  const { id: formId } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

  const { data: formData } = useQuery({
    queryKey: ['formDetails', formId],
    queryFn: async () => {
      const res = await apiClient.get(`/forms/${formId}`);
      return res.data.data;
    },
    enabled: !!formId,
  });

  const { data: responsesData, isLoading } = useQuery({
    queryKey: ['formResponses', formId, page],
    queryFn: async () => {
      const res = await apiClient.get(`/forms/${formId}/responses`, {
        params: { page, limit: 10 },
      });
      return res.data;
    },
    enabled: !!formId,
  });

  const handleExportCSV = () => {
    const responses = responsesData?.data || [];
    if (responses.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,Response ID,Respondent,Submitted At,Question,Answer\n';
    responses.forEach((resp: any) => {
      const respondent = resp.isAnonymous ? 'Anonymous' : resp.respondent?.email || 'Authenticated User';
      resp.answers.forEach((ans: any) => {
        const line = `"${resp.id}","${respondent}","${resp.submittedAt}","${ans.questionTitle.replace(/"/g, '""')}","${ans.value.replace(/"/g, '""')}"`;
        csvContent += line + '\n';
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `feedback_responses_${formId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const responses = responsesData?.data || [];
  const pagination = responsesData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Response Management</span>
          <h1 className="text-2xl font-extrabold text-slate-100">{formData?.title || 'Form Responses'}</h1>
          <p className="text-xs text-slate-400 mt-1">Total {pagination.total} submissions recorded</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={responses.length === 0}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Response Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : responses.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Responses Yet"
          description="Share your public form URL to collect feedback responses from your users."
        />
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Response ID</th>
                  <th className="py-3.5 px-6">Respondent</th>
                  <th className="py-3.5 px-6">Answers Count</th>
                  <th className="py-3.5 px-6">Submitted At</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {responses.map((resp: any) => (
                  <tr key={resp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                      {resp.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-6">
                      {resp.isAnonymous ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">
                          Anonymous
                        </span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                          <span className="font-semibold">{resp.respondent?.firstName} {resp.respondent?.lastName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-400">{resp.answers?.length}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(resp.submittedAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedResponse(resp)}
                        className="px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-semibold flex items-center space-x-1 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Answers</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Response Detail Drawer Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Response Detail</h3>
                <p className="text-xs text-slate-400">
                  {selectedResponse.isAnonymous ? 'Anonymous Submission' : selectedResponse.respondent?.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedResponse.answers.map((ans: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <p className="text-xs font-semibold text-brand-400">{ans.questionTitle}</p>
                  <p className="text-sm text-slate-100 font-medium whitespace-pre-wrap">{ans.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
