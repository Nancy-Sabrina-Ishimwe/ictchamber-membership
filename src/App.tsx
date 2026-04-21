import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Messaging from "./pages/Messaging";
import Payments from "./pages/Payments";
import Members from "./pages/Members";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/messaging" element={<Messaging />} />
      </Routes>
    </MainLayout>
  );
}

export default App;