import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute, MemberRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { NewRequestModal } from './components/membership/portal/NewRequestModal';
import MainLayout from './layouts/MainLayout';
import ServiceUsage from './services/ServiceUsage';
import { usePortalStore } from './store/portalStore';
import Dashboard from './pages/Dashboard';
import DeliveredServices from './pages/DeliveredServices';
import Events from './pages/Events';
import GeneralSettings from './pages/GeneralSettings';
import LoginPage from './pages/LoginPage';
import Members from './pages/Members';
import MemberProfile from './pages/MemberProfile';
import Messaging from './pages/Messaging';
import PartnerDirectory from './pages/PartnerDirectory';
import Partners from './pages/Partners';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Registrations from './pages/Registrations';
import Renewals from './pages/Renewals';
import SecuritySettings from './pages/SecuritySettings';
import Services from './pages/Services';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import { RegistrationPage } from './pages/membership/RegistrationPage';
import { MembershipCatalogPage } from './pages/membership/MembershipCatalogPage';
import { BenefitsPage } from './pages/membership/portal/BenefitsPage';
import { DashboardPage } from './pages/membership/portal/DashboardPage';
import { PaymentsPage } from './pages/membership/portal/PaymentsPage';
import { ProfilePage } from './pages/membership/portal/ProfilePage';
import { RequestsPage } from './pages/membership/portal/RequestsPage';
import { ROUTES } from './constants/app';

const GlobalModals: React.FC = () => {
  const { showNewRequestModal } = usePortalStore();
  return showNewRequestModal ? <NewRequestModal /> : null;
};

const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MainLayout>{children}</MainLayout>
);

const AdminPlaceholder: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <p className="mt-2 max-w-xl text-sm text-slate-500">{description}</p>
  </div>
);

function App() {
  return (
    <>
      <GlobalModals />
      <Routes>
        {/* ── Public ── */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* ── Admin (requires admin role) ── */}
        <Route
          path={ROUTES.ADMIN}
          element={
            <AdminRoute>
              <AdminShell>
                <Dashboard />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_MEMBERS}
          element={
            <AdminRoute>
              <AdminShell>
                <Members />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_REGISTRATIONS}
          element={
            <AdminRoute>
              <AdminShell>
                <Registrations />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/members/:id"
          element={
            <AdminRoute>
              <AdminShell>
                <MemberProfile />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PAYMENTS}
          element={
            <AdminRoute>
              <AdminShell>
                <Payments />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_MESSAGING}
          element={
            <AdminRoute>
              <AdminShell>
                <Messaging />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PARTNERS}
          element={
            <AdminRoute>
              <AdminShell>
                <Partners />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PARTNERS_DIRECTORY}
          element={
            <AdminRoute>
              <AdminShell>
                <PartnerDirectory />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_RENEWALS}
          element={
            <AdminRoute>
              <AdminShell>
                <Renewals />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SERVICES}
          element={
            <AdminRoute>
              <AdminShell>
                <Services />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SERVICES_DELIVERED}
          element={
            <AdminRoute>
              <AdminShell>
                <DeliveredServices />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_EVENTS}
          element={
            <AdminRoute>
              <AdminShell>
                <Events />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_REPORTS}
          element={
            <AdminRoute>
              <AdminShell>
                <Reports />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_REPORTS_SERVICE_USAGE}
          element={
            <AdminRoute>
              <AdminShell>
                <ServiceUsage />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <AdminRoute>
              <AdminShell>
                <Settings />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS_SECURITY}
          element={
            <AdminRoute>
              <AdminShell>
                <SecuritySettings />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS_GENERAL}
          element={
            <AdminRoute>
              <AdminShell>
                <GeneralSettings />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS_USERS}
          element={
            <AdminRoute>
              <AdminShell>
                <UserManagement />
              </AdminShell>
            </AdminRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SUPPORT}
          element={
            <AdminRoute>
              <AdminShell>
                <AdminPlaceholder
                  title="Support"
                  description="This route is preserved so the super-admin navigation stays intact while the support screen is still being finalized."
                />
              </AdminShell>
            </AdminRoute>
          }
        />

        {/* ── Legacy admin short-paths ── */}
        <Route path="/members"           element={<Navigate to={ROUTES.ADMIN_MEMBERS}            replace />} />
        <Route path="/partners"          element={<Navigate to={ROUTES.ADMIN_PARTNERS}           replace />} />
        <Route path="/partners/directory"element={<Navigate to={ROUTES.ADMIN_PARTNERS_DIRECTORY} replace />} />
        <Route path="/payments-admin"    element={<Navigate to={ROUTES.ADMIN_PAYMENTS}           replace />} />
        <Route path="/messaging"         element={<Navigate to={ROUTES.ADMIN_MESSAGING}          replace />} />
        <Route path="/renewals"          element={<Navigate to={ROUTES.ADMIN_RENEWALS}           replace />} />
        <Route path="/services"          element={<Navigate to={ROUTES.ADMIN_SERVICES}           replace />} />
        <Route path="/services/delivered"element={<Navigate to={ROUTES.ADMIN_SERVICES_DELIVERED} replace />} />
        <Route path="/events"            element={<Navigate to={ROUTES.ADMIN_EVENTS}             replace />} />
        <Route path="/reports"           element={<Navigate to={ROUTES.ADMIN_REPORTS}            replace />} />
        <Route path="/reports/service-usage" element={<Navigate to={ROUTES.ADMIN_REPORTS_SERVICE_USAGE} replace />} />
        <Route path="/settings"          element={<Navigate to={ROUTES.ADMIN_SETTINGS}           replace />} />
        <Route path="/settings/security" element={<Navigate to={ROUTES.ADMIN_SETTINGS_SECURITY} replace />} />
        <Route path="/settings/general"  element={<Navigate to={ROUTES.ADMIN_SETTINGS_GENERAL}  replace />} />
        <Route path="/settings/users"    element={<Navigate to={ROUTES.ADMIN_SETTINGS_USERS}    replace />} />
        <Route path="/support"           element={<Navigate to={ROUTES.ADMIN_SUPPORT}            replace />} />

        {/* ── Member portal (requires member role) ── */}
        <Route path={ROUTES.MEMBER_REGISTER}  element={<RegistrationPage />} />
        <Route
          path={ROUTES.MEMBER_DASHBOARD}
          element={
            <MemberRoute>
              <DashboardPage />
            </MemberRoute>
          }
        />
        <Route
          path={ROUTES.MEMBER_REQUESTS}
          element={
            <MemberRoute>
              <RequestsPage />
            </MemberRoute>
          }
        />
        <Route
          path={ROUTES.MEMBER_PROFILE}
          element={
            <MemberRoute>
              <ProfilePage />
            </MemberRoute>
          }
        />
        <Route
          path={ROUTES.MEMBER_BENEFITS}
          element={
            <MemberRoute>
              <BenefitsPage />
            </MemberRoute>
          }
        />
        <Route
          path={ROUTES.MEMBER_PAYMENTS}
          element={
            <MemberRoute>
              <PaymentsPage />
            </MemberRoute>
          }
        />
        <Route path={ROUTES.MEMBER_CATALOG} element={<MembershipCatalogPage />} />

        {/* ── Legacy member short-paths ── */}
        <Route path="/register"           element={<Navigate to={ROUTES.MEMBER_REGISTER}   replace />} />
        <Route path="/dashboard"          element={<Navigate to={ROUTES.MEMBER_DASHBOARD}  replace />} />
        <Route path="/requests"           element={<Navigate to={ROUTES.MEMBER_REQUESTS}   replace />} />
        <Route path="/profile"            element={<Navigate to={ROUTES.MEMBER_PROFILE}    replace />} />
        <Route path="/benefits"           element={<Navigate to={ROUTES.MEMBER_BENEFITS}   replace />} />
        <Route path="/payments"           element={<Navigate to={ROUTES.MEMBER_PAYMENTS}   replace />} />
        <Route path="/membership-catalog" element={<Navigate to={ROUTES.MEMBER_CATALOG}    replace />} />
        <Route path="/catalog"            element={<Navigate to={ROUTES.MEMBER_CATALOG}    replace />} />

        {/* ── Catch-all: send unauthenticated users to login ── */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </>
  );
}

export default App;
