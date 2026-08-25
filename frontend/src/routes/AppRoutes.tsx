import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/common/AppHeader';
import { AppSidebar } from '../components/common/AppSidebar';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FormsPage } from '../pages/FormsPage';
import { FormBuilderPage } from '../pages/FormBuilderPage';
import { PublicFormPage } from '../pages/PublicFormPage';
import { ResponsesPage } from '../pages/ResponsesPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { OrgSettingsPage } from '../pages/OrgSettingsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <AppHeader
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="flex flex-1 relative min-h-0">
        <AppSidebar
          isMobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Anonymous Respondent Route */}
      <Route path="/feedback/:publicId" element={<PublicFormPage />} />

      {/* Auth Route */}
      <Route path="/auth/login" element={<AuthPage />} />

      {/* Protected SaaS App Routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/new" element={<FormBuilderPage />} />
        <Route path="/forms/:id/responses" element={<ResponsesPage />} />
        <Route path="/forms/:id/analytics" element={<AnalyticsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/workspace" element={<OrgSettingsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
