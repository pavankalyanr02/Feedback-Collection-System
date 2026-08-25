import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkeletonTable } from '../components/ui/SkeletonLoader';
import { Users, UserPlus, Shield, Building2 } from 'lucide-react';

export const OrgSettingsPage: React.FC = () => {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['orgMembers', currentOrg?.id],
    queryFn: async () => {
      const res = await apiClient.get(`/organizations/${currentOrg?.id}/members`);
      return res.data.data;
    },
    enabled: !!currentOrg?.id,
  });

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/organizations/${currentOrg?.id}/members`, {
        email,
        role,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgMembers'] });
      setShowAddModal(false);
      setEmail('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to add member.');
    },
  });

  return (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">RBAC Management</span>
          <h1 className="text-2xl font-extrabold text-slate-100">{currentOrg?.name} Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">Manage team members, roles, and permissions</p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setErrorMsg(null);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Member Table */}
      {isLoading ? (
        <SkeletonTable />
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              Active Workspace Members ({members?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Member Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">RBAC Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {(members || []).map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-semibold flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                        {m.firstName.charAt(0)}
                      </div>
                      <span>{m.firstName} {m.lastName}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{m.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          m.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : m.role === 'MANAGER'
                            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {m.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-100">Add Member to Workspace</h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">User Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@feedback.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value="MEMBER">MEMBER (View assigned forms)</option>
                  <option value="MANAGER">MANAGER (Create & edit forms, view responses)</option>
                  <option value="ADMIN">ADMIN (Full workspace management)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800/60">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => addMemberMutation.mutate()}
                disabled={!email || addMemberMutation.isPending}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-colors"
              >
                {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
