import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
      <div className="glass-card p-10 rounded-3xl border border-slate-800 max-w-md space-y-4 shadow-2xl">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
        <h1 className="text-3xl font-extrabold text-slate-100">404 - Page Not Found</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested route does not exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
