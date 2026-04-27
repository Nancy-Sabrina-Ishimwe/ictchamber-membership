import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NewRequestModal } from './components/membership/portal/NewRequestModal';
import MainLayout from './layouts/MainLayout';
import ServiceUsage from './services/ServiceUsage';
import { usePortalStore } from './store/portalStore';
import Dashboard from './pages/Dashboard';
import DeliveredServices from './pages/DeliveredServices';
import Events from './pages/Events';
import GeneralSettings from './pages/GeneralSettings';
import Members from './pages/Members';
import Messaging from './pages/Messaging';
import PartnerDirectory from './pages/PartnerDirectory';
import Partners from './pages/Partners';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
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
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route
          path="/admin"
          element={
            <AdminShell>
              <Dashboard />
            </AdminShell>
          }
        />
        <Route
          path="/admin/members"
          element={
            <AdminShell>
              <Members />
            </AdminShell>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminShell>
              <Payments />
            </AdminShell>
          }
        />
        <Route
          path="/admin/messaging"
          element={
            <AdminShell>
              <Messaging />
            </AdminShell>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <AdminShell>
              <Partners />
            </AdminShell>
          }
        />
        <Route
          path="/admin/partners/directory"
          element={
            <AdminShell>
              <PartnerDirectory />
            </AdminShell>
          }
        />
        <Route
          path="/admin/renewals"
          element={
            <AdminShell>
              <Renewals />
            </AdminShell>
          }
        />
        <Route
          path="/admin/services"
          element={
            <AdminShell>
              <Services />
            </AdminShell>
          }
        />
        <Route
          path="/admin/services/delivered"
          element={
            <AdminShell>
              <DeliveredServices />
            </AdminShell>
          }
        />
        <Route
          path="/admin/events"
          element={
            <AdminShell>
              <Events />
            </AdminShell>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminShell>
              <Reports />
            </AdminShell>
          }
        />
        <Route
          path="/admin/reports/service-usage"
          element={
            <AdminShell>
              <ServiceUsage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminShell>
              <Settings />
            </AdminShell>
          }
        />
        <Route
          path="/admin/settings/security"
          element={
            <AdminShell>
              <SecuritySettings />
            </AdminShell>
          }
        />
        <Route
          path="/admin/settings/general"
          element={
            <AdminShell>
              <GeneralSettings />
            </AdminShell>
          }
        />
        <Route
          path="/admin/settings/users"
          element={
            <AdminShell>
              <UserManagement />
            </AdminShell>
          }
        />
        <Route
          path="/admin/support"
          element={
            <AdminShell>
              <AdminPlaceholder
                title="Support"
                description="This route is preserved so the superadmin navigation stays intact while the support screen is still being finalized."
              />
            </AdminShell>
          }
        />
        <Route path="/admin/logout" element={<Navigate to="/admin" replace />} />

        <Route path="/members" element={<Navigate to="/admin/members" replace />} />
        <Route path="/partners" element={<Navigate to="/admin/partners" replace />} />
        <Route
          path="/partners/directory"
          element={<Navigate to="/admin/partners/directory" replace />}
        />
        <Route path="/payments-admin" element={<Navigate to="/admin/payments" replace />} />
        <Route path="/messaging" element={<Navigate to="/admin/messaging" replace />} />
        <Route path="/renewals" element={<Navigate to="/admin/renewals" replace />} />
        <Route path="/services" element={<Navigate to="/admin/services" replace />} />
        <Route
          path="/services/delivered"
          element={<Navigate to="/admin/services/delivered" replace />}
        />
        <Route path="/events" element={<Navigate to="/admin/events" replace />} />
        <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
        <Route
          path="/reports/service-usage"
          element={<Navigate to="/admin/reports/service-usage" replace />}
        />
        <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
        <Route
          path="/settings/security"
          element={<Navigate to="/admin/settings/security" replace />}
        />
        <Route
          path="/settings/general"
          element={<Navigate to="/admin/settings/general" replace />}
        />
        <Route
          path="/settings/users"
          element={<Navigate to="/admin/settings/users" replace />}
        />
        <Route path="/support" element={<Navigate to="/admin/support" replace />} />
        <Route path="/logout" element={<Navigate to="/admin/logout" replace />} />

        <Route path="/member/register" element={<RegistrationPage />} />
        <Route path="/member/dashboard" element={<DashboardPage />} />
        <Route path="/member/requests" element={<RequestsPage />} />
        <Route path="/member/profile" element={<ProfilePage />} />
        <Route path="/member/benefits" element={<BenefitsPage />} />
        <Route path="/member/payments" element={<PaymentsPage />} />
        <Route path="/member/membership-catalog" element={<MembershipCatalogPage />} />

        <Route path="/register" element={<Navigate to="/member/register" replace />} />
        <Route path="/dashboard" element={<Navigate to="/member/dashboard" replace />} />
        <Route path="/requests" element={<Navigate to="/member/requests" replace />} />
        <Route path="/profile" element={<Navigate to="/member/profile" replace />} />
        <Route path="/benefits" element={<Navigate to="/member/benefits" replace />} />
        <Route path="/payments" element={<Navigate to="/member/payments" replace />} />
        <Route path="/membership-catalog" element={<Navigate to="/member/membership-catalog" replace />} />
        <Route path="/catalog" element={<Navigate to="/member/membership-catalog" replace />} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
}

export default App;
