import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/app';
import { isStaffRole } from '../../lib/permissions';

interface Props {
  children: React.ReactNode;
}

// ─── Loading splash ───────────────────────────────────────────────────────────
const LoadingScreen: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EF9F27]/20 border-t-[#EF9F27]" />
  </div>
);

// ─── Requires any authenticated user ─────────────────────────────────────────
export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  return <>{children}</>;
};

// ─── Requires admin or view-only staff (STANDARD_USER) ───────────────────────
export const AdminRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  if (!isStaffRole(user.role)) return <Navigate to={ROUTES.MEMBER_DASHBOARD} replace />;
  return <>{children}</>;
};

// ─── Requires member role ─────────────────────────────────────────────────────
export const MemberRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  if (user.role !== 'member') {
    return <Navigate to={isStaffRole(user.role) ? ROUTES.ADMIN : ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
};

// ─── Public-only route (redirects authenticated users to their dashboard) ─────
export const PublicRoute: React.FC<Props> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (user) {
    return (
      <Navigate
        to={isStaffRole(user.role) ? ROUTES.ADMIN : ROUTES.MEMBER_DASHBOARD}
        replace
      />
    );
  }
  return <>{children}</>;
};
