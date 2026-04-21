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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Partners</h2>
          <p className="text-gray-500 text-sm mt-1 max-w-xl">
            Manage and collaborate with official partners of the Rwanda ICT Chamber.
          </p>
        </div>

        <div className="flex gap-3">

          {/* Partner List */}
          <button
            onClick={() => navigate("/partners/directory")}
            className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white text-sm hover:bg-gray-50"
          >
            <List size={16} />
            Partner List
          </button>

          {/* Add Partner → OPEN MODAL (NOT ROUTE) */}
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400"
          >
            <Plus size={16} />
            Add Partner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm w-80 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Total Partners</p>
          <h3 className="text-3xl font-bold mt-2">142</h3>
          <p className="text-xs text-gray-400 mt-1">+12 from last month</p>
        </div>

        <div className="w-10 h-10 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded-full">
          <Users size={18} />
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Recently Added Partners</h3>
          <button className="text-sm text-gray-500 hover:underline">
            View All
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {recentPartners.map((p, i) => (
            <div
              key={i}
              className="flex justify-between px-4 py-4 border-b last:border-none hover:bg-gray-50"
            >
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  📄
                </div>

                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.type}</p>
                </div>
              </div>

              <p className="text-xs text-gray-400">{p.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ MODAL (THIS MAKES THE POPUP LIKE YOUR DESIGN) */}
      {openModal && (
        <PartnerModal onClose={() => setOpenModal(false)} />
      )}
    </div>
  );
}