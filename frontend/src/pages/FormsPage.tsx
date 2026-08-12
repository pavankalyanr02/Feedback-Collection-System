import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Copy,
  Check,
  Eye,
  BarChart2,
  CopyPlus,
  Trash2,
  Globe,
  FileText,
} from 'lucide-react';

export const FormsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['forms', currentOrg?.id, page, search, statusFilter],
    queryFn: async () => {
      const res = await apiClient.get('/forms', {
        params: {
          organizationId: currentOrg?.id,
          page,
          limit: 9,
          search,
          status: statusFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!currentOrg?.id,
  });

  const publishMutation = useMutation({
    mutationFn: async (formId: string) => {
      await apiClient.post(`/forms/${formId}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (formId: string) => {
      await apiClient.post(`/forms/${formId}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (formId: string) => {
      await apiClient.delete(`/forms/${formId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  const handleCopyLink = (publicId: string, formId: string) => {
    const publicUrl = `${window.location.origin}/feedback/${publicId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const forms = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 9, total: 0, totalPages: 1 };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Feedback <span className="text-gradient">Forms</span>
          </h1>
          <p className="text-sm text-slate-400">
            Create, publish, manage, and share your feedback collection forms.
          </p>
        </div>
        <Link
          to="/forms/new"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Feedback Form</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search forms by title or description..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Status Tabs */}
        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-full md:w-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Published', value: 'PUBLISHED' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Closed', value: 'CLOSED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === tab.value
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid / Loading / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Feedback Forms Found"
          description="Build your first feedback form to start gathering responses from your users and customers."
          actionLabel="Create Feedback Form"
          onAction={() => window.location.href = '/forms/new'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form: any) => (
            <div
              key={form.id}
              className="glass-card p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-base text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1">
                    {form.title}
                  </h3>
                  <StatusBadge status={form.status} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {form.description || 'No description provided.'}
                </p>

                <div className="flex items-center space-x-4 pt-2 text-xs font-medium text-slate-400">
                  <span>{form.questionCount} Questions</span>
                  <span>•</span>
                  <span className="text-brand-400 font-bold">{form.responseCount} Responses</span>
                </div>
              </div>

              {/* Form Card Action Toolbar */}
              <div className="pt-5 border-t border-slate-800/60 mt-4 flex items-center justify-between gap-1">
                {form.status === 'PUBLISHED' ? (
                  <button
                    onClick={() => handleCopyLink(form.publicId, form.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                    title="Copy Public Form URL"
                  >
                    {copiedId === form.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => publishMutation.mutate(form.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                )}

                <div className="flex items-center space-x-1">
                  <Link
                    to={`/forms/${form.id}/responses`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title="View Responses"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/forms/${form.id}/analytics`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title="View Form Analytics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => duplicateMutation.mutate(form.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                    title="Duplicate Form"
                  >
                    <CopyPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this feedback form?')) {
                        deleteMutation.mutate(form.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      <Pagination meta={pagination} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
