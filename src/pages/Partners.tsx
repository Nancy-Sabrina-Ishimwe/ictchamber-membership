import { Users, Plus, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PartnerModal from "../components/PartnerModal";

export default function Partners() {
  const navigate = useNavigate();

  // ✅ Modal state (THIS WAS MISSING)
  const [openModal, setOpenModal] = useState(false);

  const recentPartners = [
    {
      name: "Kigali Innovation City",
      type: "Strategic Partner",
      date: "Oct 24, 2023",
    },
    {
      name: "Global Tech Hub Alliance",
      type: "Affiliate",
      date: "Oct 22, 2023",
    },
    {
      name: "Rwanda Development Board",
      type: "Government Entity",
      date: "Oct 15, 2023",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partners</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1 max-w-2xl">
            Manage and collaborate with official partners of the Rwanda ICT Chamber.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">

          {/* Partner List */}
          <button
            onClick={() => navigate('/admin/partners/directory')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-md bg-white text-sm hover:bg-gray-50 transition-colors"
          >
            <List size={16} />
            Partner List
          </button>

          {/* Add Partner → OPEN MODAL (NOT ROUTE) */}
          <button
            onClick={() => setOpenModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors"
          >
            <Plus size={16} />
            Add Partner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-md border border-gray-200 p-4 sm:p-6 shadow-sm w-full sm:max-w-sm flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Total Partners</p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1.5 text-gray-900">142</h3>
          <p className="text-xs text-gray-400 mt-1">+12 from last month</p>
        </div>

        <div className="w-10 h-10 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded-full flex-shrink-0">
          <Users size={18} />
        </div>
      </div>

      {/* Recent */}
      <section className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recently Added Partners</h3>
          <button className="text-sm text-gray-500 hover:underline">
            View All
          </button>
        </div>

        <div>
          {recentPartners.map((p, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-5 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50/70 transition-colors"
            >
              <div className="flex gap-3 items-center min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  📄
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 break-words">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.type}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 sm:text-right">{p.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ MODAL (THIS MAKES THE POPUP LIKE YOUR DESIGN) */}
      {openModal && (
        <PartnerModal onClose={() => setOpenModal(false)} />
      )}
    </div>
  );
}
