import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
  requireStrictAuth?: boolean;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();

  // Show simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has admin role
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Render admin content
  return <>{children}</>;
}