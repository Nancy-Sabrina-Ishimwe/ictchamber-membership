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

<Route path="/partners/directory" element={<PartnerDirectory />} />
<Route path="/services/delivered" element={<DeliveredServices />} />



      </Routes>
    </MainLayout>
  );
}

export default App;