import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Messaging from "./pages/Messaging";
import Payments from "./pages/Payments";
import Members from "./pages/Members";
import Partners from "./pages/Partners";
import PartnerDirectory from "./pages/PartnerDirectory";
import Renewals from "./pages/Renewals";
import Services from "./pages/Services";
import DeliveredServices from "./pages/DeliveredServices";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import ServiceUsage from "./services/ServiceUsage";
import Settings from "./pages/Settings";
import SecuritySettings from "./pages/SecuritySettings";
import GeneralSettings from "./pages/GeneralSettings";
import UserManagement from "./pages/UserManagement";



function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/partners" element={<Partners />} />
         <Route path="/renewals" element={<Renewals />} />
         <Route path="/services" element={<Services />} />
         <Route path="/events" element={<Events />} />
         <Route path="/reports" element={<Reports />} />
         <Route path="/settings" element={<Settings />} />
         <Route path="/settings/security" element={<SecuritySettings />} />
         <Route path="/settings/general" element={<GeneralSettings />} />
         <Route path="/settings/users" element={<UserManagement />} />

   

<Route path="/partners/directory" element={<PartnerDirectory />} />
<Route path="/services/delivered" element={<DeliveredServices />} />
<Route path="/reports/service-usage" element={<ServiceUsage />} />



      </Routes>
    </MainLayout>
  );
}

export default App;